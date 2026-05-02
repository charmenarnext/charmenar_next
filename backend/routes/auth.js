const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../models/User');

const otpStore = new Map();
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

console.log('📦 [AUTH ROUTES] Registering routes...');

// POST /api/auth/admin/request-otp - DIAGNOSTIC VERSION
router.post('/admin/request-otp', async (req, res) => {
  console.log('');
  console.log('═══════════════════════════════════════════════════════');
  console.log('🔐 [OTP REQUEST] Received:', req.body);
  
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email required' });
    }

    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'charmenarnext@gmail.com';
    if (email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const otp = generateOTP();
    const expiresAt = Date.now() + 10 * 60 * 1000;
    
    otpStore.set(email.toLowerCase(), { otp, expiresAt, attempts: 0 });

    console.log('✅ [OTP REQUEST] Generated OTP:', otp);

    // ===== DIAGNOSTIC: Check environment variables =====
    console.log('📧 [DIAGNOSTIC] Checking email configuration...');
    console.log('   EMAIL_USER:', process.env.EMAIL_USER || 'NOT SET');
    console.log('   EMAIL_PASS length:', process.env.EMAIL_PASS?.length || 0);
    console.log('   EMAIL_PASS has 16 chars:', process.env.EMAIL_PASS?.length === 16);
    console.log('   ADMIN_EMAIL:', process.env.ADMIN_EMAIL || 'NOT SET');

    // Validate credentials
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('❌ [DIAGNOSTIC] Email credentials NOT configured!');
      return res.status(500).json({
        success: false,
        message: 'Email not configured. Check Render environment variables.',
        debug: {
          hasUser: !!process.env.EMAIL_USER,
          hasPass: !!process.env.EMAIL_PASS,
          passLength: process.env.EMAIL_PASS?.length || 0
        }
      });
    }

    if (process.env.EMAIL_PASS.length !== 16) {
      console.error('❌ [DIAGNOSTIC] EMAIL_PASS must be 16 characters!');
      return res.status(500).json({
        success: false,
        message: 'Invalid email password length. Must be 16 characters.',
        debug: {
          passLength: process.env.EMAIL_PASS.length,
          expected: 16
        }
      });
    }

    // ===== Try to send email =====
    console.log('📧 [OTP REQUEST] Creating Gmail transporter...');
    
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      tls: { rejectUnauthorized: false }
    });

    console.log('📧 [OTP REQUEST] Verifying connection...');
    
    // Verify connection first
    await new Promise((resolve, reject) => {
      transporter.verify((error, success) => {
        if (error) {
          console.error('❌ [OTP REQUEST] Verification FAILED:', error.message);
          reject(error);
        } else {
          console.log('✅ [OTP REQUEST] Verification SUCCESS');
          resolve(success);
        }
      });
    });

    // Send email
    console.log('📧 [OTP REQUEST] Sending email...');
    
    await transporter.sendMail({
      from: `"Charmenar Next" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '🔐 OTP Verification',
      html: `
        <div style="font-family: Arial; padding: 20px;">
          <h2 style="color: #667eea;">Charmenar Next Admin</h2>
          <p>Your OTP is:</p>
          <div style="background: #667eea; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
            <span style="font-size: 36px; font-weight: bold; color: white; letter-spacing: 8px;">${otp}</span>
          </div>
          <p>Expires in 10 minutes.</p>
        </div>
      `,
      text: `Your OTP is: ${otp}`
    });

    console.log('✅ [OTP REQUEST] Email sent successfully!');
    console.log('═══════════════════════════════════════════════════════');
    console.log('');

    res.json({
      success: true,
      message: 'OTP sent to your email',
      email: email
    });

  } catch (error) {
    console.error('');
    console.error('❌ [OTP REQUEST] FAILED:', error.message);
    console.error('❌ [OTP REQUEST] Code:', error.code);
    console.error('❌ [OTP REQUEST] Response:', error.response);
    console.error('');
    
    let errorMessage = 'Failed to send OTP';
    
    if (error.message.includes('Invalid credentials') || error.message.includes('Authentication failed')) {
      errorMessage = 'Gmail authentication failed. Check EMAIL_USER and EMAIL_PASS in Render.';
    } else if (error.message.includes('Connection timeout')) {
      errorMessage = 'Gmail connection timeout. Enable 2-Step Verification.';
    } else if (error.message.includes('ENOTFOUND')) {
      errorMessage = 'Cannot connect to Gmail. Check internet connection.';
    }
    
    res.status(500).json({
      success: false,
      message: errorMessage,
      error: error.message,
      code: error.code
    });
  }
});

// ... [Keep the rest of the routes the same - admin/login, register, login, me]
// (I'm keeping this short - just replace the OTP route above)

// POST /api/auth/admin/login
router.post('/admin/login', async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP required' });
    }

    const emailKey = email.toLowerCase();
    const storedOTP = otpStore.get(emailKey);
    
    if (!storedOTP) {
      return res.status(400).json({ success: false, message: 'OTP not found. Request a new one.' });
    }

    if (Date.now() > storedOTP.expiresAt) {
      otpStore.delete(emailKey);
      return res.status(400).json({ success: false, message: 'OTP expired. Request a new one.' });
    }

    if (storedOTP.attempts >= 3) {
      otpStore.delete(emailKey);
      return res.status(400).json({ success: false, message: 'Too many attempts. Request a new OTP.' });
    }

    if (otp !== storedOTP.otp) {
      storedOTP.attempts += 1;
      otpStore.set(emailKey, storedOTP);
      return res.status(400).json({ 
        success: false, 
        message: `Invalid OTP. ${3 - storedOTP.attempts} attempts remaining.` 
      });
    }

    const token = jwt.sign(
      { userId: 'admin', email, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    otpStore.delete(emailKey);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: { id: 'admin', email, name: 'Charmenar Admin', role: 'admin' }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Login failed' });
  }
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'All fields required' });
    }

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ success: false, message: 'User exists' });
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

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required' });
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