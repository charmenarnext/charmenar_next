const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../models/User');

// In-memory OTP store
const otpStore = new Map();

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// ===== CRITICAL: Log all routes being registered =====
console.log('📦 [AUTH ROUTES] Registering routes...');

// ===== ADMIN ROUTES =====

// POST /api/auth/admin/request-otp
router.post('/admin/request-otp', async (req, res) => {
  console.log('🔐 [OTP REQUEST] Received:', req.body);
  console.log('📍 [OTP REQUEST] From IP:', req.ip);
  
  try {
    const { email } = req.body;
    
    if (!email) {
      console.warn('⚠️ [OTP REQUEST] No email provided');
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    // Verify admin email
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'charmenarnext@gmail.com';
    if (email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      console.warn('⚠️ [OTP REQUEST] Unauthorized email:', email);
      return res.status(403).json({ success: false, message: 'Unauthorized email address' });
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
    
    // Store OTP
    otpStore.set(email.toLowerCase(), {
      otp,
      expiresAt,
      attempts: 0
    });

    console.log('✅ [OTP REQUEST] Generated OTP for:', email);

    // Send email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: `"Charmenar Next" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Admin Portal - OTP Verification',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #667eea;">Charmenar Next Admin Portal</h2>
          <p>Your OTP is: <strong style="font-size: 24px; letter-spacing: 5px; color: #764ba2;">${otp}</strong></p>
          <p>This code expires in 10 minutes.</p>
          <p style="color: #999; font-size: 12px;">If you didn't request this, please ignore this email.</p>
        </div>
      `
    });

    console.log('✅ [OTP REQUEST] Email sent to:', email);
    
    res.json({
      success: true,
      message: 'OTP sent successfully to your email',
      email: email
    });

  } catch (error) {
    console.error('❌ [OTP REQUEST] Error:', error.message);
    console.error('❌ [OTP REQUEST] Stack:', error.stack);
    
    res.status(500).json({
      success: false,
      message: 'Failed to send OTP. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// POST /api/auth/admin/login
router.post('/admin/login', async (req, res) => {
  console.log('🔐 [ADMIN LOGIN] Received:', req.body);
  
  try {
    const { email, otp } = req.body;
    
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP are required' });
    }

    const storedOTP = otpStore.get(email.toLowerCase());
    
    if (!storedOTP) {
      return res.status(400).json({ success: false, message: 'OTP expired or not found. Please request a new one.' });
    }

    if (Date.now() > storedOTP.expiresAt) {
      otpStore.delete(email.toLowerCase());
      return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
    }

    if (storedOTP.attempts >= 3) {
      otpStore.delete(email.toLowerCase());
      return res.status(400).json({ success: false, message: 'Too many attempts. Please request a new OTP.' });
    }

    if (otp !== storedOTP.otp) {
      storedOTP.attempts += 1;
      otpStore.set(email.toLowerCase(), storedOTP);
      return res.status(400).json({ 
        success: false, 
        message: `Invalid OTP. ${3 - storedOTP.attempts} attempts remaining.` 
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: 'admin', email: email, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    otpStore.delete(email.toLowerCase());

    console.log('✅ [ADMIN LOGIN] Success for:', email);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: 'admin',
        email: email,
        name: 'Charmenar Admin',
        role: 'admin'
      }
    });

  } catch (error) {
    console.error('❌ [ADMIN LOGIN] Error:', error.message);
    res.status(500).json({ success: false, message: 'Login failed' });
  }
});

// ===== REGULAR USER ROUTES =====

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({ name, email, password: hashedPassword });
    await user.save();

    const token = jwt.sign({ userId: user._id, email }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: { id: user._id, name: user.name, email: user.email }
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id, email }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: { id: user._id, name: user.name, email: user.email }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Login failed' });
  }
});

router.get('/me', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ success: false, message: 'No token provided' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.json({ success: true, user });
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
});

module.exports = router;