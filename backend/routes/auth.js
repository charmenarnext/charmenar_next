const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ===== OTP Storage (In-memory for now - use Redis/DB in production) =====
const otpStore = new Map();

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// ===== LOGGING =====
console.log('📦 [AUTH ROUTES] Registering routes...');
console.log('   → POST /api/auth/admin/request-otp');
console.log('   → POST /api/auth/admin/login');
console.log('   → POST /api/auth/register');
console.log('   → POST /api/auth/login');
console.log('   → GET  /api/auth/me');
console.log('');

// ===== ADMIN ROUTES =====

// POST /api/auth/admin/request-otp
router.post('/admin/request-otp', async (req, res) => {
  console.log('');
  console.log('═══════════════════════════════════════════════════════');
  console.log('🔐 [OTP REQUEST] Received:', req.body);
  console.log('📍 [OTP REQUEST] From IP:', req.ip);
  
  try {
    const { email } = req.body;
    
    // Validate email
    if (!email) {
      console.warn('⚠️ [OTP REQUEST] No email provided');
      return res.status(400).json({ 
        success: false, 
        message: 'Email is required' 
      });
    }

    // Verify admin email
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'charmenarnext@gmail.com';
    if (email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      console.warn('⚠️ [OTP REQUEST] Unauthorized email:', email);
      return res.status(403).json({ 
        success: false, 
        message: 'Unauthorized email address' 
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
    
    // Store OTP (use lowercase key for consistency)
    const emailKey = email.toLowerCase();
    otpStore.set(emailKey, {
      otp,
      expiresAt,
      attempts: 0
    });

    console.log('✅ [OTP REQUEST] Generated OTP for:', email);
    console.log('🔢 [OTP REQUEST] >>>>> ACTUAL OTP CODE:', otp, '<<<<<');
    console.log('⏰ [OTP REQUEST] Expires in 10 minutes');
    console.log('⚠️  [OTP REQUEST] Email sending DISABLED - OTP shown above');
    console.log('═══════════════════════════════════════════════════════');
    console.log('');

    // ✅ Send response immediately WITHOUT email
    // ⚠️ For development/testing - shows OTP in response
    // Remove YOUR_OTP_IS field in production!
    res.json({
      success: true,
      message: 'OTP generated successfully. Check Render logs or console for the code.',
      email: email,
      // ⚠️ DEVELOPMENT ONLY - Shows OTP in response for testing
      YOUR_OTP_IS: otp,
      note: 'Copy the value of YOUR_OTP_IS and enter it in the login form. Remove this field in production.'
    });

  } catch (error) {
    console.error('');
    console.error('❌ [OTP REQUEST] Error:', error.message);
    console.error('❌ [OTP REQUEST] Stack:', error.stack);
    console.error('');
    
    res.status(500).json({
      success: false,
      message: 'Failed to generate OTP. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// POST /api/auth/admin/login
router.post('/admin/login', async (req, res) => {
  console.log('');
  console.log('🔐 [ADMIN LOGIN] Attempting login...');
  console.log('   Received body:', req.body);
  
  try {
    const { email, otp } = req.body;
    
    // Validate input
    if (!email || !otp) {
      console.warn('⚠️ [ADMIN LOGIN] Missing email or OTP');
      return res.status(400).json({ 
        success: false, 
        message: 'Email and OTP are required',
        received: { 
          email: !!email, 
          otp: !!otp, 
          otpLength: otp?.length 
        }
      });
    }

    // Use lowercase key for lookup
    const emailKey = email.toLowerCase();
    console.log('🔍 [ADMIN LOGIN] Looking up OTP for:', emailKey);
    
    const storedOTP = otpStore.get(emailKey);
    
    // Check if OTP exists
    if (!storedOTP) {
      console.warn('⚠️ [ADMIN LOGIN] No OTP found for:', emailKey);
      console.log('📋 [ADMIN LOGIN] Available keys in otpStore:', Array.from(otpStore.keys()));
      return res.status(400).json({ 
        success: false, 
        message: 'OTP not found. Please request a new one.',
        debug: {
          emailKey,
          storeHasKeys: otpStore.size > 0,
          availableEmails: Array.from(otpStore.keys())
        }
      });
    }

    // Check expiration
    if (Date.now() > storedOTP.expiresAt) {
      console.warn('⚠️ [ADMIN LOGIN] OTP expired for:', emailKey);
      otpStore.delete(emailKey);
      return res.status(400).json({ 
        success: false, 
        message: 'OTP expired. Please request a new one.' 
      });
    }

    // Check attempts limit
    if (storedOTP.attempts >= 3) {
      console.warn('⚠️ [ADMIN LOGIN] Too many attempts for:', emailKey);
      otpStore.delete(emailKey);
      return res.status(400).json({ 
        success: false, 
        message: 'Too many attempts. Please request a new OTP.' 
      });
    }

    // Verify OTP
    console.log('🔢 [ADMIN LOGIN] Comparing OTPs:');
    console.log('   Entered:', otp);
    console.log('   Stored:', storedOTP.otp);
    console.log('   Match:', otp === storedOTP.otp);
    
    if (otp !== storedOTP.otp) {
      storedOTP.attempts += 1;
      otpStore.set(emailKey, storedOTP);
      console.warn('⚠️ [ADMIN LOGIN] OTP mismatch! Attempts:', storedOTP.attempts);
      
      return res.status(400).json({ 
        success: false, 
        message: `Invalid OTP. ${3 - storedOTP.attempts} attempts remaining.`,
        debug: {
          entered: otp,
          stored: storedOTP.otp,
          attempts: storedOTP.attempts
        }
      });
    }

    // OTP verified - generate JWT token
    const token = jwt.sign(
      { 
        userId: 'admin', 
        email: email, 
        role: 'admin',
        name: 'Charmenar Admin'
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Clear used OTP
    otpStore.delete(emailKey);

    console.log('✅ [ADMIN LOGIN] Success for:', email);
    console.log('');

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
    console.error('');
    console.error('❌ [ADMIN LOGIN] Error:', error.message);
    console.error('❌ [ADMIN LOGIN] Stack:', error.stack);
    console.error('');
    
    res.status(500).json({ 
      success: false, 
      message: 'Login failed. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ===== REGULAR USER ROUTES =====

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    
    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name, email and password are required' 
      });
    }

    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ 
        success: false, 
        message: 'User already exists with this email' 
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    user = new User({
      name,
      email,
      phone,
      password: hashedPassword
    });

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
    
    res.status(500).json({ 
      success: false, 
      message: 'Registration failed' 
    });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and password are required' 
      });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('✅ [LOGIN] User logged in:', email);

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
    
    res.status(500).json({ 
      success: false, 
      message: 'Login failed' 
    });
  }
});

// GET /api/auth/me
router.get('/me', async (req, res) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'No token provided' 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user (exclude password)
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    res.json({ 
      success: true, 
      user 
    });

  } catch (error) {
    console.error('❌ [GET /me] Error:', error.message);
    
    res.status(401).json({ 
      success: false, 
      message: 'Invalid token' 
    });
  }
});

module.exports = router;