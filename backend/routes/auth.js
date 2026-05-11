const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sgMail = require('@sendgrid/mail');
const User = require('../models/User');

// Configure SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  console.log('✅ [EMAIL] SendGrid configured');
} else {
  console.warn('⚠️ [EMAIL] SendGrid API key not found');
}

// In-memory storage
const otpStore = new Map();
const resetTokenStore = new Map();

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();
const generateResetToken = () => crypto.randomBytes(32).toString('hex');

console.log('📦 [AUTH ROUTES] Initialized');

// ==========================================
// ADMIN ROUTES
// ==========================================

// POST /api/auth/admin/request-otp
router.post('/admin/request-otp', async (req, res) => {
  try {
    const { email } = req.body;
    console.log('📥 [ADMIN OTP] Request received for:', email);

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'charmenarnext@gmail.com';
    if (email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      return res.status(403).json({ success: false, message: 'Unauthorized email address' });
    }

    // Generate & store OTP
    const otp = generateOTP();
    otpStore.set(email.toLowerCase(), {
      otp,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
      attempts: 0
    });

    console.log(`🔑 [ADMIN OTP] Generated: ${otp}`);

    // ===== SEND EMAIL VIA SENDGRID =====
    if (process.env.SENDGRID_API_KEY) {
      try {
        console.log('📤 Sending email via SendGrid...');

        const msg = {
          to: email,
          from: {
            email: process.env.SENDGRID_FROM_EMAIL || 'charmenarnext@gmail.com',
            name: process.env.SENDGRID_FROM_NAME || 'Charmenar Next Admin'
          },
          subject: '🔐 Admin Portal - OTP Verification',
          html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; background: #f4f4f4;">
              <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <h2 style="color: #667eea; text-align: center; margin-bottom: 20px;">Charmenar Next Admin Portal</h2>
                <p style="color: #555; text-align: center;">Your One-Time Password (OTP) is:</p>
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
                  <span style="font-size: 36px; font-weight: bold; color: white; letter-spacing: 8px;">${otp}</span>
                </div>
                <p style="color: #888; text-align: center; font-size: 12px;">
                  This OTP expires in 10 minutes.<br>
                  If you didn't request this, please ignore this email.
                </p>
              </div>
            </div>
          `,
          text: `Your OTP is: ${otp}\n\nThis OTP expires in 10 minutes.`
        };

        await sgMail.send(msg);
        console.log('✅ [EMAIL] SendGrid email sent successfully to:', email);
        
        return res.json({
          success: true,
          message: 'OTP sent to your email. Check inbox and spam folder.'
        });

      } catch (sendError) {
        console.error('❌ SendGrid Error:', sendError.message);
        if (sendError.response) {
          console.error('❌ SendGrid Response Body:', sendError.response.body);
        }
        
        // Fallback: return OTP so admin can still login
        return res.json({
          success: true,
          message: 'Email service temporarily unavailable. Use this OTP.',
          otp: otp
        });
      }
    } else {
      console.log('⚠️ SendGrid not configured. Returning OTP for testing.');
      return res.json({
        success: true,
        message: 'Test mode active. Use this OTP.',
        otp: otp
      });
    }

  } catch (error) {
    console.error('❌ [ADMIN OTP] Critical Error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to process OTP request' });
  }
});

// POST /api/auth/admin/login
router.post('/admin/login', async (req, res) => {
  try {
    const { email, otp } = req.body;
    console.log('🔐 [ADMIN LOGIN] Attempting login for:', email);

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP are required' });
    }

    const storedData = otpStore.get(email.toLowerCase());

    if (!storedData) {
      return res.status(400).json({ success: false, message: 'No OTP found. Please request a new one.' });
    }

    if (Date.now() > storedData.expiresAt) {
      otpStore.delete(email.toLowerCase());
      return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
    }

    if (otp !== storedData.otp) {
      storedData.attempts += 1;
      if (storedData.attempts >= 3) {
        otpStore.delete(email.toLowerCase());
        return res.status(400).json({ success: false, message: 'Too many failed attempts. Please request a new OTP.' });
      }
      return res.status(400).json({
        success: false,
        message: `Invalid OTP. Attempts remaining: ${3 - storedData.attempts}`
      });
    }

    // OTP verified successfully
    otpStore.delete(email.toLowerCase());

    const token = jwt.sign(
      { userId: 'admin', email, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('✅ [ADMIN LOGIN] Success for:', email);
    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: { id: 'admin', email, name: 'Charmenar Admin', role: 'admin' }
    });

  } catch (error) {
    console.error('❌ [ADMIN LOGIN] Critical Error:', error.message);
    res.status(500).json({ success: false, message: 'Login failed' });
  }
});

// ==========================================
// USER ROUTES
// ==========================================

router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    console.log('📝 [REGISTER] Attempting registration for:', email);

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists with this email or phone' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({ name, email, phone, password: hashedPassword });
    await user.save();

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('✅ [REGISTER] Success:', user._id);
    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: { id: user._id, name: user.name, email: user.email, phone: user.phone }
    });
  } catch (error) {
    console.error('❌ [REGISTER] Error:', error.message);
    res.status(500).json({ success: false, message: 'Registration failed', error: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;
    console.log('🔐 [LOGIN] Attempting login for phone:', phone);

    if (!phone || !password) {
      return res.status(400).json({ success: false, message: 'Phone and password are required' });
    }

    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(400).json({ success: false, message: 'User not found. Please register first.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid password' });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('✅ [LOGIN] Success:', user.email);
    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: { id: user._id, name: user.name, email: user.email, phone: user.phone }
    });
  } catch (error) {
    console.error('❌ [LOGIN] Error:', error.message);
    res.status(500).json({ success: false, message: 'Login failed', error: error.message });
  }
});

// Forgot password route
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ success: true, message: 'If the email exists, a reset link has been sent' });
    }

    const token = generateResetToken();
    resetTokenStore.set(email, {
      token,
      expiresAt: Date.now() + 3600000, // 1 hour
      userId: user._id
    });

    const resetLink = `${process.env.FRONTEND_URL || 'https://charmenarnext.github.io'}/charmenar_next/reset-password?token=${token}&email=${email}`;
    
    // Send via SendGrid if configured
    if (process.env.SENDGRID_API_KEY) {
      try {
        const msg = {
          to: email,
          from: {
            email: process.env.SENDGRID_FROM_EMAIL || 'charmenarnext@gmail.com',
            name: process.env.SENDGRID_FROM_NAME || 'Charmenar Next'
          },
          subject: '🔐 Password Reset Request',
          html: `<p>Click to reset your password:</p><a href="${resetLink}">${resetLink}</a><p>This link expires in 1 hour.</p>`,
          text: `Reset your password: ${resetLink}\n\nThis link expires in 1 hour.`
        };
        await sgMail.send(msg);
        console.log('✅ [FORGOT PASSWORD] Email sent via SendGrid');
      } catch (err) {
        console.log('⚠️ [FORGOT PASSWORD] Email failed, link:', resetLink);
      }
    }

    res.json({ success: true, message: 'If the email exists, a reset link has been sent' });
  } catch (error) {
    console.error('❌ [FORGOT PASSWORD] Error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to process request' });
  }
});

// Reset password route
router.post('/reset-password', async (req, res) => {
  try {
    const { token, email, newPassword, confirmPassword } = req.body;

    if (!token || !email || !newPassword || !confirmPassword) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const storedData = resetTokenStore.get(email);
    if (!storedData || storedData.token !== token) {
      return res.status(400).json({ success: false, message: 'Invalid reset token' });
    }
    if (Date.now() > storedData.expiresAt) {
      resetTokenStore.delete(email);
      return res.status(400).json({ success: false, message: 'Reset token has expired' });
    }

    const user = await User.findById(storedData.userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    resetTokenStore.delete(email);
    console.log('✅ [RESET PASSWORD] Success for:', email);
    res.json({ success: true, message: 'Password reset successful. Please login with your new password.' });
  } catch (error) {
    console.error('❌ [RESET PASSWORD] Error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to reset password' });
  }
});

// Get user info
router.get('/me', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ success: false, message: 'No token provided' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.json({ success: true, user });
  } catch (error) {
    console.error('❌ [GET /me] Error:', error.message);
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
});

module.exports = router;