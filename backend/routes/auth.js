const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const User = require('../models/User');

const otpStore = new Map();
const resetTokenStore = new Map();

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();
const generateResetToken = () => crypto.randomBytes(32).toString('hex');

console.log('📦 [AUTH ROUTES] Registering routes...');

// ===== ADMIN ROUTES =====

router.post('/admin/request-otp', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email required' });

    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'charmenarnext@gmail.com';
    if (email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      return res.status(403).json({ success: false, message: 'Unauthorized email' });
    }

    const otp = generateOTP();
    otpStore.set(email.toLowerCase(), { otp, expiresAt: Date.now() + 600000, attempts: 0 });

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
      tls: { rejectUnauthorized: false }
    });

    await transporter.sendMail({
      from: `"Charmenar Next" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '🔐 Admin OTP',
      html: `<h2>Your OTP: ${otp}</h2><p>Expires in 10 minutes</p>`
    });

    res.json({ success: true, message: 'OTP sent' });
  } catch (error) {
    console.error('❌ [ADMIN OTP] Error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to send OTP' });
  }
});

router.post('/admin/login', async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ success: false, message: 'Email and OTP required' });

    const storedOTP = otpStore.get(email.toLowerCase());
    if (!storedOTP || Date.now() > storedOTP.expiresAt || otp !== storedOTP.otp) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    otpStore.delete(email.toLowerCase());
    const token = jwt.sign({ userId: 'admin', email, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '24h' });

    res.json({ success: true, token, user: { id: 'admin', email, name: 'Admin', role: 'admin' } });
  } catch (error) {
    console.error('❌ [ADMIN LOGIN] Error:', error.message);
    res.status(500).json({ success: false, message: 'Login failed' });
  }
});

// ===== USER REGISTRATION =====
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    
    console.log('📝 [REGISTER] Received:', { name, email, phone, passwordLength: password?.length });
    
    if (!name || !email || !phone || !password) {
      return res.status(400).json({ success: false, message: 'All fields required' });
    }

    // Trim and clean inputs
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();
    const cleanPassword = password.trim();

    // Check existing user
    const existingUser = await User.findOne({ $or: [{ email: cleanEmail }, { phone: cleanPhone }] });
    if (existingUser) {
      console.log('❌ [REGISTER] User already exists');
      return res.status(400).json({ success: false, message: 'User exists with this email or phone' });
    }

    // Hash password with consistent salt rounds
    console.log('🔐 [REGISTER] Hashing password...');
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(cleanPassword, salt);
    
    console.log('✅ [REGISTER] Hash created:', { 
      hashStart: hashedPassword.substring(0, 10),
      hashLength: hashedPassword.length,
      saltRounds 
    });

    // Create user
    const user = new User({
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      password: hashedPassword
    });

    await user.save();
    console.log('✅ [REGISTER] User saved:', user._id);

    const token = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });

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

// ===== USER LOGIN =====
router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;
    
    console.log('🔐 [LOGIN] Attempt:', { phone, passwordLength: password?.length });
    
    if (!phone || !password) {
      return res.status(400).json({ success: false, message: 'Phone and password required' });
    }

    // Trim inputs
    const cleanPhone = phone.trim();
    const cleanPassword = password.trim();

    // Find user
    const user = await User.findOne({ phone: cleanPhone });
    if (!user) {
      console.log('❌ [LOGIN] User not found:', cleanPhone);
      return res.status(400).json({ success: false, message: 'User not found' });
    }

    console.log('✅ [LOGIN] User found:', user.email);
    console.log('📊 [LOGIN] Stored hash:', user.password.substring(0, 15) + '...');
    console.log('📊 [LOGIN] Hash length:', user.password.length);

    // Compare passwords with detailed logging
    console.log('🔐 [LOGIN] Comparing...');
    const startTime = Date.now();
    const isMatch = await bcrypt.compare(cleanPassword, user.password);
    const duration = Date.now() - startTime;
    
    console.log('🔐 [LOGIN] Result:', isMatch, '(', duration + 'ms )');
    console.log('🔐 [LOGIN] Entered pwd:', cleanPassword);
    console.log('🔐 [LOGIN] Entered length:', cleanPassword.length);
    
    if (!isMatch) {
      console.log('❌ [LOGIN] Password mismatch!');
      return res.status(400).json({ success: false, message: 'Invalid password' });
    }

    const token = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });

    console.log('✅ [LOGIN] Success:', user.email);
    res.json({ success: true, message: 'Login successful', token, user: { id: user._id, name: user.name, email: user.email, phone: user.phone } });

  } catch (error) {
    console.error('❌ [LOGIN] Error:', error.message);
    res.status(500).json({ success: false, message: 'Login failed', error: error.message });
  }
});

// ===== FORGOT PASSWORD =====
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email required' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.json({ success: true, message: 'If email exists, reset link sent' });
    }

    const resetToken = generateResetToken();
    resetTokenStore.set(user.email, { token: resetToken, expiresAt: Date.now() + 3600000, userId: user._id });

    const resetLink = `${process.env.FRONTEND_URL || 'https://charmenarnext.github.io'}/charmenar_next/reset-password?token=${resetToken}&email=${user.email}`;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
      tls: { rejectUnauthorized: false }
    });

    await transporter.sendMail({
      from: `"Charmenar Next" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: '🔐 Password Reset',
      html: `
        <div style="font-family: Arial; padding: 20px;">
          <h2>Reset Your Password</h2>
          <p><a href="${resetLink}" style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px;">Reset Password</a></p>
          <p>Link expires in 1 hour.</p>
        </div>
      `
    });

    res.json({ success: true, message: 'Reset link sent' });
  } catch (error) {
    console.error('❌ [FORGOT PASSWORD] Error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to send reset link' });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const { token, email, newPassword, confirmPassword } = req.body;
    
    if (!token || !email || !newPassword || !confirmPassword) {
      return res.status(400).json({ success: false, message: 'All fields required' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be 6+ characters' });
    }

    const storedToken = resetTokenStore.get(email.toLowerCase());
    if (!storedToken || storedToken.token !== token || Date.now() > storedToken.expiresAt) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    }

    const user = await User.findById(storedToken.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    resetTokenStore.delete(email.toLowerCase());

    res.json({ success: true, message: 'Password reset successful' });
  } catch (error) {
    console.error('❌ [RESET PASSWORD] Error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to reset password' });
  }
});

// ===== GET USER =====
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