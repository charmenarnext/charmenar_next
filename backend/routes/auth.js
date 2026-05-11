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

console.log('📦 [AUTH ROUTES] Initialized');

// ===== ADMIN ROUTES =====

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
      return res.status(403).json({ success: false, message: 'Unauthorized email' });
    }

    // Generate OTP
    const otp = generateOTP();
    otpStore.set(email.toLowerCase(), { 
      otp, 
      expiresAt: Date.now() + 10 * 60 * 1000 
    });

    console.log(`🔑 [ADMIN OTP] Generated: ${otp}`);

    // ===== EMAIL SENDING LOGIC WITH TIMEOUT FIX =====
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try {
        console.log('📤 Attempting to send email...');
        
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
          },
          tls: { rejectUnauthorized: false },
          connectionTimeout: 5000 // ⚡ FIX: Timeout after 5 seconds
        });

        await transporter.sendMail({
          from: `"Charmenar Admin" <${process.env.EMAIL_USER}>`,
          to: email,
          subject: '🔐 Admin Portal OTP',
          html: `
            <div style="text-align:center; padding:20px; font-family:sans-serif;">
              <h2>Charmenar Next Admin</h2>
              <p>Your OTP is:</p>
              <div style="background:#667eea; color:white; padding:15px; font-size:24px; font-weight:bold; display:inline-block; border-radius:8px;">
                ${otp}
              </div>
            </div>
          `
        });

        console.log('✅ [ADMIN OTP] Email sent successfully');
        res.json({ success: true, message: 'OTP sent to your email' });

      } catch (emailError) {
        console.error('❌ Email Service Error:', emailError.message);
        // ⚡ FIX: If email fails, send OTP in response so user can login anyway
        console.log(`⚠️ FALLBACK: Returning OTP in response because email failed.`);
        res.json({
          success: true,
          message: 'Email service unavailable. Check console or response for OTP.',
          otp: otp // <--- This allows you to see the OTP
        });
      }
    } else {
      // No email config - Return OTP immediately
      console.log('⚠️ No email config found. Returning OTP.');
      res.json({
        success: true,
        message: 'OTP generated (Test Mode).',
        otp: otp
      });
    }

  } catch (error) {
    console.error('❌ [ADMIN OTP] Critical Error:', error.message);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
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

    // Success
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

// ===== USER ROUTES =====

// POST /api/auth/register
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

// POST /api/auth/login
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

// POST /api/auth/forgot-password
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

    // Simple console log for now to prevent email timeouts on this route too
    console.log(`🔗 [FORGOT PASSWORD] Link: ${resetLink}`);
    
    res.json({ success: true, message: 'Reset link sent (Check console)' });
  } catch (error) {
    console.error('❌ [FORGOT PASSWORD] Error:', error.message);
    res.status(500).json({ success: false, message: 'Failed' });
  }
});

// POST /api/auth/reset-password
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
    console.error('❌ [RESET PASSWORD] Error:', error.message);
    res.status(500).json({ success: false, message: 'Failed' });
  }
});

// GET /api/auth/me
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