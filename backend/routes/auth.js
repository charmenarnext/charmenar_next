const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const User = require('../models/User');

// In-memory storage
const otpStore = new Map();
const resetTokenStore = new Map();

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();
const generateResetToken = () => crypto.randomBytes(32).toString('hex');

// ==========================================
// DEBUG: Check Environment Variables
// ==========================================
console.log('🔍 [DEBUG] Environment Variables Check:');
console.log('EMAIL_USER:', process.env.EMAIL_USER ? '✅ Set' : '❌ NOT SET');
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? `✅ Set (${process.env.EMAIL_PASS.length} chars)` : '❌ NOT SET');
console.log('ADMIN_EMAIL:', process.env.ADMIN_EMAIL || '❌ NOT SET (using default)');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✅ Set' : '❌ NOT SET');

// ==========================================
// ADMIN ROUTES
// ==========================================

// POST /api/auth/admin/request-otp
router.post('/admin/request-otp', async (req, res) => {
  try {
    const { email } = req.body;
    console.log('\n📥 [ADMIN OTP] Request received for:', email);

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
      expiresAt: Date.now() + 10 * 60 * 1000,
      attempts: 0
    });

    console.log('🔑 [ADMIN OTP] Generated:', otp);

    // ===== CHECK EMAIL CONFIGURATION =====
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('❌ [EMAIL] Environment variables NOT configured!');
      console.log('EMAIL_USER:', process.env.EMAIL_USER || 'NOT SET');
      console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'SET (hidden)' : 'NOT SET');
      
      return res.json({
        success: true,
        message: 'Email not configured. Check server logs.',
        otp: otp,
        debug: {
          EMAIL_USER: process.env.EMAIL_USER ? 'Set' : 'NOT SET',
          EMAIL_PASS: process.env.EMAIL_PASS ? 'Set' : 'NOT SET'
        }
      });
    }

    console.log('✅ [EMAIL] Configuration found:');
    console.log('   From:', process.env.EMAIL_USER);
    console.log('   To:', email);

    // ===== CREATE TRANSPORTER WITH DEBUGGING =====
    let transporter;
    try {
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        },
        tls: { 
          rejectUnauthorized: false,
          minVersion: 'TLSv1.2'
        },
        debug: true, // Enable SMTP debugging
        logger: true // Log to console
      });

      console.log('🔧 [EMAIL] Transporter created, verifying connection...');
      
      // Verify connection
      await transporter.verify();
      console.log('✅ [EMAIL] SMTP connection verified successfully!');

    } catch (transportError) {
      console.error('❌ [EMAIL] Transporter creation failed:');
      console.error('   Error:', transportError.message);
      console.error('   Code:', transportError.code);
      console.error('   Command:', transportError.command);
      
      return res.json({
        success: true,
        message: 'Email configuration error. Check server logs.',
        otp: otp,
        error: transportError.message
      });
    }

    // ===== SEND EMAIL =====
    try {
      console.log('📤 [EMAIL] Sending email...');
      
      const mailOptions = {
        from: `"Charmenar Next Admin" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: '🔐 Admin Portal - OTP Verification',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; background: #f4f4f4;">
            <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px;">
              <h2 style="color: #667eea; text-align: center;">Charmenar Next Admin</h2>
              <p style="text-align: center; color: #666;">Your OTP is:</p>
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
                <span style="font-size: 36px; font-weight: bold; color: white; letter-spacing: 8px;">${otp}</span>
              </div>
              <p style="text-align: center; color: #999; font-size: 12px;">Expires in 10 minutes.</p>
            </div>
          </div>
        `,
        text: `Your OTP is: ${otp}`
      };

      const info = await transporter.sendMail(mailOptions);
      
      console.log('✅ [EMAIL] Email sent successfully!');
      console.log('   Message ID:', info.messageId);
      console.log('   Preview URL:', nodemailer.getTestMessageUrl(info));

      return res.json({
        success: true,
        message: 'OTP sent to your email. Check inbox and spam folder.'
      });

    } catch (sendError) {
      console.error('❌ [EMAIL] Failed to send email:');
      console.error('   Error:', sendError.message);
      console.error('   Code:', sendError.code);
      console.error('   Command:', sendError.command);
      console.error('   Response:', sendError.response);
      
      // Return OTP as fallback
      return res.json({
        success: true,
        message: 'Email failed to send. Use this OTP.',
        otp: otp,
        error: sendError.message
      });
    }

  } catch (error) {
    console.error('❌ [ADMIN OTP] Critical Error:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({ success: false, message: 'Failed to process request' });
  }
});

// POST /api/auth/admin/login
router.post('/admin/login', async (req, res) => {
  try {
    const { email, otp } = req.body;
    console.log('🔐 [ADMIN LOGIN] Attempting login for:', email);

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP required' });
    }

    const storedData = otpStore.get(email.toLowerCase());

    if (!storedData) {
      return res.status(400).json({ success: false, message: 'No OTP found. Request a new one.' });
    }

    if (Date.now() > storedData.expiresAt) {
      otpStore.delete(email.toLowerCase());
      return res.status(400).json({ success: false, message: 'OTP expired.' });
    }

    if (otp !== storedData.otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    otpStore.delete(email.toLowerCase());

    const token = jwt.sign(
      { userId: 'admin', email, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('✅ [ADMIN LOGIN] Success');
    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: { id: 'admin', email, name: 'Charmenar Admin', role: 'admin' }
    });

  } catch (error) {
    console.error('❌ [ADMIN LOGIN] Error:', error.message);
    res.status(500).json({ success: false, message: 'Login failed' });
  }
});

// ==========================================
// USER ROUTES (Keep existing code)
// ==========================================

router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !phone || !password) {
      return res.status(400).json({ success: false, message: 'All fields required' });
    }

    let user = await User.findOne({ $or: [{ email }, { phone }] });
    if (user) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({ name, email, phone, password: hashedPassword });
    await user.save();

    const token = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: { id: user._id, name: user.name, email: user.email, phone: user.phone }
    });
  } catch (error) {
    console.error('❌ [REGISTER] Error:', error.message);
    res.status(500).json({ success: false, message: 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;
    if (!phone || !password) {
      return res.status(400).json({ success: false, message: 'Phone and password required' });
    }

    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(400).json({ success: false, message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid password' });
    }

    const token = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: { id: user._id, name: user.name, email: user.email, phone: user.phone }
    });
  } catch (error) {
    console.error('❌ [LOGIN] Error:', error.message);
    res.status(500).json({ success: false, message: 'Login failed' });
  }
});

// Forgot password & reset password routes
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email required' });

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ success: true, message: 'If email exists, reset link sent' });
    }

    const token = generateResetToken();
    resetTokenStore.set(email, { token, expiresAt: Date.now() + 3600000, userId: user._id });

    const resetLink = `${process.env.FRONTEND_URL || 'https://charmenarnext.github.io'}/charmenar_next/reset-password?token=${token}&email=${email}`;
    console.log('🔗 Reset link:', resetLink);

    res.json({ success: true, message: 'If email exists, reset link sent' });
  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).json({ success: false, message: 'Failed' });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const { token, email, newPassword, confirmPassword } = req.body;
    
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match' });
    }

    const storedData = resetTokenStore.get(email);
    if (!storedData || storedData.token !== token) {
      return res.status(400).json({ success: false, message: 'Invalid token' });
    }

    if (Date.now() > storedData.expiresAt) {
      resetTokenStore.delete(email);
      return res.status(400).json({ success: false, message: 'Token expired' });
    }

    const user = await User.findById(storedData.userId);
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    resetTokenStore.delete(email);
    res.json({ success: true, message: 'Password reset successful' });
  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).json({ success: false, message: 'Failed' });
  }
});

router.get('/me', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ success: false, message: 'No token' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.json({ success: true, user });
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
});

module.exports = router;