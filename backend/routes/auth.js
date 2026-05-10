const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const User = require('../models/User');

// ===== OTP & Token Storage (In-memory - use Redis/DB in production) =====
const otpStore = new Map();
const resetTokenStore = new Map();

// Generate 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Generate reset token
const generateResetToken = () => crypto.randomBytes(32).toString('hex');

console.log('📦 [AUTH ROUTES] Registering routes...');

// ===== ADMIN ROUTES =====

// POST /api/auth/admin/request-otp
router.post('/admin/request-otp', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email required' });
    }

    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'charmenarnext@gmail.com';
    if (email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      return res.status(403).json({ success: false, message: 'Unauthorized email' });
    }

    const otp = generateOTP();
    const expiresAt = Date.now() + 10 * 60 * 1000;
    
    otpStore.set(email.toLowerCase(), { otp, expiresAt, attempts: 0 });

    // Send email via Gmail
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      tls: { rejectUnauthorized: false }
    });

    await transporter.sendMail({
      from: `"Charmenar Next Admin" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '🔐 Admin Portal - OTP Verification',
      html: `
        <div style="font-family: Arial; padding: 20px; background: #f4f4f4;">
          <div style="background: white; padding: 30px; border-radius: 10px; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #667eea;">Charmenar Next Admin</h2>
            <p>Your OTP is:</p>
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
              <span style="font-size: 36px; font-weight: bold; color: white; letter-spacing: 8px;">${otp}</span>
            </div>
            <p>Expires in 10 minutes.</p>
          </div>
        </div>
      `
    });

    res.json({ success: true, message: 'OTP sent to your email' });

  } catch (error) {
    console.error('❌ Admin OTP Error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to send OTP' });
  }
});

// POST /api/auth/admin/login
router.post('/admin/login', async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP required' });
    }

    const storedOTP = otpStore.get(email.toLowerCase());
    
    if (!storedOTP || Date.now() > storedOTP.expiresAt || otp !== storedOTP.otp) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    otpStore.delete(email.toLowerCase());

    const token = jwt.sign(
      { userId: 'admin', email, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: { id: 'admin', email, name: 'Charmenar Admin', role: 'admin' }
    });

  } catch (error) {
    console.error('❌ Admin Login Error:', error.message);
    res.status(500).json({ success: false, message: 'Login failed' });
  }
});

// ===== USER ROUTES =====

// POST /api/auth/register - Name, Phone, Email, Password
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    
    // Validate required fields
    if (!name || !email || !phone || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name, email, phone and password are required' 
      });
    }

    // Check if user exists
    let user = await User.findOne({ $or: [{ email }, { phone }] });
    if (user) {
      return res.status(400).json({ 
        success: false, 
        message: 'User already exists with this email or phone' 
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    user = new User({ name, email, phone, password: hashedPassword });
    await user.save();

    // Generate token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('✅ [REGISTER] New user:', email);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone
      }
    });

  } catch (error) {
    console.error('❌ [REGISTER] Error:', error.message);
    res.status(500).json({ success: false, message: 'Registration failed' });
  }
});

// POST /api/auth/login - Phone + Password
router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;
    
    if (!phone || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Phone number and password are required' 
      });
    }

    // Find user by phone
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(400).json({ 
        success: false, 
        message: 'User not found. Please register first.' 
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid password' 
      });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('✅ [LOGIN] User logged in:', user.email);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone
      }
    });

  } catch (error) {
    console.error('❌ [LOGIN] Error:', error.message);
    res.status(500).json({ success: false, message: 'Login failed' });
  }
});

// POST /api/auth/forgot-password - Send reset link
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is required' 
      });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if user exists or not (security)
      return res.json({ 
        success: true, 
        message: 'If the email exists, a reset link has been sent' 
      });
    }

    // Generate reset token
    const resetToken = generateResetToken();
    const expiresAt = Date.now() + 60 * 60 * 1000; // 1 hour
    
    // Store token
    resetTokenStore.set(user.email, {
      token: resetToken,
      expiresAt,
      userId: user._id
    });

    // Create reset link
    const resetLink = `${process.env.FRONTEND_URL || 'https://charmenarnext.github.io'}/charmenar_next/reset-password?token=${resetToken}&email=${user.email}`;

    // Send email via Gmail
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      tls: { rejectUnauthorized: false }
    });

    await transporter.sendMail({
      from: `"Charmenar Next" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '🔐 Password Reset Request',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Password Reset</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Charmenar Next</h1>
                      <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0;">Password Reset</p>
                    </td>
                  </tr>
                  
                  <!-- Body -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <h2 style="color: #333333; margin: 0 0 20px;">Reset Your Password</h2>
                      <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                        You requested to reset your password. Click the button below to create a new password:
                      </p>
                      
                      <!-- Reset Button -->
                      <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetLink}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 25px; font-weight: bold; font-size: 16px; display: inline-block;">
                          Reset Password
                        </a>
                      </div>
                      
                      <p style="color: #999999; font-size: 14px; line-height: 1.6; margin: 20px 0 0;">
                        Or copy and paste this link into your browser:
                      </p>
                      <p style="color: #667eea; font-size: 12px; word-break: break-all; margin: 10px 0 0;">
                        ${resetLink}
                      </p>
                      
                      <p style="color: #999999; font-size: 14px; margin: 30px 0 0;">
                        <strong>This link will expire in 1 hour.</strong>
                      </p>
                      
                      <p style="color: #999999; font-size: 14px; margin: 20px 0 0;">
                        If you didn't request this, please ignore this email.
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center; border-top: 1px solid #e9ecef;">
                      <p style="color: #999999; font-size: 12px; margin: 0;">
                        © ${new Date().getFullYear()} Charmenar Next. All rights reserved.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
      text: `
        Charmenar Next - Password Reset
        
        You requested to reset your password. Click the link below:
        
        ${resetLink}
        
        This link will expire in 1 hour.
        
        If you didn't request this, please ignore this email.
        
        © ${new Date().getFullYear()} Charmenar Next
      `
    });

    console.log('✅ [FORGOT PASSWORD] Reset link sent to:', email);

    res.json({ 
      success: true, 
      message: 'If the email exists, a reset link has been sent' 
    });

  } catch (error) {
    console.error('❌ [FORGOT PASSWORD] Error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to send reset link' });
  }
});

// POST /api/auth/reset-password - Reset password with token
router.post('/reset-password', async (req, res) => {
  try {
    const { token, email, newPassword, confirmPassword } = req.body;
    
    // Validate
    if (!token || !email || !newPassword || !confirmPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required' 
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'Passwords do not match' 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password must be at least 6 characters' 
      });
    }

    // Verify token
    const storedToken = resetTokenStore.get(email);
    
    if (!storedToken || storedToken.token !== token) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid reset token' 
      });
    }

    // Check expiration
    if (Date.now() > storedToken.expiresAt) {
      resetTokenStore.delete(email);
      return res.status(400).json({ 
        success: false, 
        message: 'Reset token has expired. Please request a new one.' 
      });
    }

    // Find user
    const user = await User.findById(storedToken.userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    user.password = hashedPassword;
    await user.save();

    // Delete used token
    resetTokenStore.delete(email);

    console.log('✅ [RESET PASSWORD] Password reset for:', email);

    res.json({ 
      success: true, 
      message: 'Password reset successful. Please login with your new password.' 
    });

  } catch (error) {
    console.error('❌ [RESET PASSWORD] Error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to reset password' });
  }
});

// GET /api/auth/me
router.get('/me', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, user });

  } catch (error) {
    console.error('❌ [GET /me] Error:', error.message);
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
});

module.exports = router;