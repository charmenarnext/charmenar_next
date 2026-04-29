const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const AdminOTP = require('../models/AdminOTP');
const { sendAdminLoginOTP, sendWelcomeEmail } = require('../utils/emailService');
const { auth } = require('../middleware/auth');

// ✅ Use your JWT_SECRET from .env with fallback
const JWT_SECRET = process.env.JWT_SECRET || 'charmenar-next-catering-events-fallback-secret-key-do-not-use-in-production';

// User Registration
router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('phone').trim().notEmpty().withMessage('Phone number is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, email, phone, password } = req.body;

    // Check if user already exists
    let user = await User.findOne({ $or: [{ email }, { phone }] });
    if (user) {
      return res.status(400).json({ 
        message: 'User already exists with this email or phone number' 
      });
    }

    // Create new user
    user = new User({
      name,
      email,
      phone,
      password
    });

    await user.save();

    // Send welcome email
    await sendWelcomeEmail(email, name);

    // Generate token with YOUR JWT_SECRET
    const token = jwt.sign(
      { userId: user._id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// User Login
router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token with YOUR JWT_SECRET
    const token = jwt.sign(
      { userId: user._id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        isAdmin: user.isAdmin
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Admin - Request OTP
router.post('/admin/request-otp', async (req, res) => {
  try {
    const { email } = req.body;

    if (email !== 'charmenarnext@gmail.com') {
      return res.status(403).json({ message: 'Unauthorized email' });
    }

    // Generate OTP
    let adminOTP = await AdminOTP.findOne({ email });
    if (!adminOTP) {
      adminOTP = new AdminOTP({ email });
    }

    const otp = adminOTP.generateOTP();
    await adminOTP.save();

    // Send OTP via email
    await sendAdminLoginOTP(email, otp);

    res.json({ 
      success: true, 
      message: 'OTP sent to your email successfully' 
    });
  } catch (error) {
    console.error('OTP request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin - Verify OTP and Login
router.post('/admin/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (email !== 'charmenarnext@gmail.com') {
      return res.status(403).json({ message: 'Unauthorized email' });
    }

    const adminOTP = await AdminOTP.findOne({ email });
    if (!adminOTP) {
      return res.status(400).json({ message: 'No OTP found. Please request a new one.' });
    }

    if (adminOTP.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    if (new Date() > adminOTP.expiresAt) {
      return res.status(400).json({ message: 'OTP expired. Please request a new one.' });
    }

    // Create or get admin user
    let admin = await User.findOne({ email });
    if (!admin) {
      admin = new User({
        name: 'Admin',
        email,
        phone: '0000000000',
        password: Math.random().toString(36).slice(-10),
        isAdmin: true
      });
      await admin.save();
    }

    // Generate token with YOUR JWT_SECRET
    const token = jwt.sign(
      { userId: admin._id },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Delete used OTP
    await AdminOTP.deleteOne({ email });

    res.json({
      success: true,
      token,
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        isAdmin: admin.isAdmin
      }
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      phone: req.user.phone
    }
  });
});

module.exports = router;