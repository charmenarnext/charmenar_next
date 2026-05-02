const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../models/User');
console.log('📦 auth.js: Registering admin routes...');
console.log('   → POST /admin/request-otp');
console.log('   → POST /admin/login');

// OTP storage (in-memory for now)
const otpStore = new Map();

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// ===== ADMIN OTP ROUTES =====

// Request OTP (Step 1)
router.post('/admin/request-otp', async (req, res) => {
  try {
    console.log('🔐 [DEBUG] /admin/request-otp HIT!', {
      body: req.body,
      headers: req.headers,
      ip: req.ip
    });
    
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is required' 
      });
    }

    // Verify admin email
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'charmenarnext@gmail.com';
    if (email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      return res.status(403).json({ 
        success: false, 
        message: 'Unauthorized email address' 
      });
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

    // Send email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: `"Charmenar Next" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Admin Portal - OTP Verification',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">Charmenar Next</h1>
            <p style="color: rgba(255,255,255,0.9);">Admin Portal</p>
          </div>
          <div style="padding: 30px; background: #f8f9fa;">
            <h2 style="color: #333;">Your Verification Code</h2>
            <p style="color: #666;">Use this OTP to login:</p>
            <div style="background: white; padding: 20px; text-align: center; margin: 20px 0;">
              <span style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #667eea;">${otp}</span>
            </div>
            <p style="color: #999; font-size: 14px;">Expires in 10 minutes.</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    
    console.log('✅ OTP sent to:', email);
    
    res.status(200).json({
      success: true,
      message: 'OTP sent successfully to your email',
      email: email
    });

  } catch (error) {
    console.error('❌ Admin OTP Error:', error.message);
    
    res.status(500).json({
      success: false,
      message: 'Failed to send OTP. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Verify OTP and Login (Step 2)
router.post('/admin/login', async (req, res) => {
  try {
    console.log('🔐 Admin Login Attempt:', req.body);
    
    const { email, otp } = req.body;
    
    if (!email || !otp) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and OTP are required' 
      });
    }

    const emailKey = email.toLowerCase();
    const storedOTP = otpStore.get(emailKey);
    
    if (!storedOTP) {
      return res.status(400).json({ 
        success: false, 
        message: 'OTP expired or not found. Please request a new one.' 
      });
    }

    // Check expiration
    if (Date.now() > storedOTP.expiresAt) {
      otpStore.delete(emailKey);
      return res.status(400).json({ 
        success: false, 
        message: 'OTP has expired. Please request a new one.' 
      });
    }

    // Check attempts
    if (storedOTP.attempts >= 3) {
      otpStore.delete(emailKey);
      return res.status(400).json({ 
        success: false, 
        message: 'Too many attempts. Please request a new OTP.' 
      });
    }

    // Verify OTP
    if (otp !== storedOTP.otp) {
      storedOTP.attempts += 1;
      otpStore.set(emailKey, storedOTP);
      
      return res.status(400).json({ 
        success: false, 
        message: `Invalid OTP. ${3 - storedOTP.attempts} attempts remaining.` 
      });
    }

    // Generate JWT token
    const adminUser = {
      id: 'admin',
      email: email,
      role: 'admin',
      name: 'Charmenar Admin'
    };

    const token = jwt.sign(
      { userId: adminUser.id, email: adminUser.email, role: adminUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Clear used OTP
    otpStore.delete(emailKey);

    console.log('✅ Admin login successful:', email);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: adminUser.id,
        email: adminUser.email,
        name: adminUser.name,
        role: adminUser.role
      }
    });

  } catch (error) {
    console.error('❌ Admin Login Error:', error.message);
    
    res.status(500).json({
      success: false,
      message: 'Login failed. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ===== REGULAR USER AUTH ROUTES =====

router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name, email and password are required' 
      });
    }

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ 
        success: false, 
        message: 'User already exists' 
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
      name,
      email,
      phone,
      password: hashedPassword
    });

    await user.save();

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

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
    console.error('Registration error:', error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Registration failed' 
    });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and password are required' 
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
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
    console.error('Login error:', error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Login failed' 
    });
  }
});

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
    console.error('Get user error:', error.message);
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
});

module.exports = router;