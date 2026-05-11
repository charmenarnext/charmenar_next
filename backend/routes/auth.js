const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const User = require('../models/User');

// ===== OTP & Token Storage =====
const otpStore = new Map();
const resetTokenStore = new Map();

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();
const generateResetToken = () => crypto.randomBytes(32).toString('hex');

console.log('📦 [AUTH ROUTES] Registering routes...');

// ===== ADMIN ROUTES =====

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

    console.log('✅ [ADMIN OTP] Sent to:', email);
    res.json({ success: true, message: 'OTP sent to your email' });

  } catch (error) {
    console.error('❌ [ADMIN OTP] Error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to send OTP', error: error.message });
  }
});

router.post('/admin/login', async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP required' });
    }

    const storedOTP = otpStore.get(email.toLowerCase());
    
    if (!storedOTP) {
      return res.status(400).json({ success: false, message: 'OTP not found. Please request a new one.' });
    }

    if (Date.now() > storedOTP.expiresAt) {
      otpStore.delete(email.toLowerCase());
      return res.status(400).json({ success: false, message: 'OTP expired. Please request a new one.' });
    }

    if (otp !== storedOTP.otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    otpStore.delete(email.toLowerCase());

    const token = jwt.sign(
      { userId: 'admin', email, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('✅ [ADMIN LOGIN] Success:', email);
    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: { id: 'admin', email, name: 'Charmenar Admin', role: 'admin' }
    });

  } catch (error) {
    console.error('❌ [ADMIN LOGIN] Error:', error.message);
    res.status(500).json({ success: false, message: 'Login failed', error: error.message });
  }
});

// ===== USER ROUTES =====

router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    
    console.log('📝 [REGISTER] Request received:', { name, email, phone });
    
    if (!name || !email || !phone || !password) {
      console.log('❌ [REGISTER] Missing required fields');
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required' 
      });
    }

    // Check if user exists
    let existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      console.log('❌ [REGISTER] User already exists');
      return res.status(400).json({ 
        success: false, 
        message: 'User already exists with this email or phone' 
      });
    }

    // Hash password - CRITICAL STEP
    console.log('🔐 [REGISTER] Hashing password...');
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    console.log('✅ [REGISTER] Password hashed successfully');
    console.log('📊 [REGISTER] Hash length:', hashedPassword.length);
    console.log('📊 [REGISTER] Hash starts with:', hashedPassword.substring(0, 7));

    // Create and save user
    const user = new User({ 
      name, 
      email, 
      phone, 
      password: hashedPassword 
    });
    
    await user.save();
    console.log('✅ [REGISTER] User saved to database:', user._id);

    // Generate token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('✅ [REGISTER] Registration successful:', email);

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
    console.error('❌ [REGISTER] Stack:', error.stack);
    res.status(500).json({ 
      success: false, 
      message: 'Registration failed',
      error: error.message 
    });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;
    
    console.log('🔐 [LOGIN] Attempting login for phone:', phone);
    console.log('🔐 [LOGIN] Password length:', password?.length);
    
    if (!phone || !password) {
      console.log('❌ [LOGIN] Missing phone or password');
      return res.status(400).json({ 
        success: false, 
        message: 'Phone number and password are required' 
      });
    }

    // Find user by phone
    const user = await User.findOne({ phone });
    
    if (!user) {
      console.log('❌ [LOGIN] User not found with phone:', phone);
      return res.status(400).json({ 
        success: false, 
        message: 'User not found. Please register first.' 
      });
    }

    console.log('✅ [LOGIN] User found:', user.email);
    console.log('📊 [LOGIN] Stored password hash:', user.password.substring(0, 20) + '...');
    console.log('📊 [LOGIN] Stored hash length:', user.password.length);
    console.log('📊 [LOGIN] Hash starts with:', user.password.substring(0, 7));

    // Compare passwords
    console.log('🔐 [LOGIN] Comparing passwords...');
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('🔐 [LOGIN] Password match result:', isMatch);
    
    if (!isMatch) {
      console.log('❌ [LOGIN] Password does not match!');
      console.log('📝 [LOGIN] Entered password length:', password.length);
      console.log('📝 [LOGIN] Entered password:', password);
      
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

    console.log('✅ [LOGIN] Login successful:', user.email);

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
    console.error('❌ [LOGIN] Stack:', error.stack);
    res.status(500).json({ 
      success: false, 
      message: 'Login failed',
      error: error.message 
    });
  }
});

// ===== FORGOT PASSWORD ROUTES =====

router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ 
        success: true, 
        message: 'If the email exists, a reset link has been sent' 
      });
    }

    const resetToken = generateResetToken();
    const expiresAt = Date.now() + 60 * 60 * 1000;
    
    resetTokenStore.set(user.email, {
      token: resetToken,
      expiresAt,
      userId: user._id
    });

    const resetLink = `${process.env.FRONTEND_URL || 'https://charmenarnext.github.io'}/charmenar_next/reset-password?token=${resetToken}&email=${user.email}`;

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
        <body style="font-family: Arial, sans-serif; background: #f4f4f4; padding: 20px;">
          <div style="background: white; padding: 30px; border-radius: 10px; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #667eea;">Charmenar Next</h2>
            <p>Click the button below to reset your password:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 25px; font-weight: bold;">
                Reset Password
              </a>
            </div>
            <p style="color: #999;">This link expires in 1 hour.</p>
          </div>
        </body>
        </html>
      `
    });

    console.log('✅ [FORGOT PASSWORD] Reset link sent to:', email);
    res.json({ success: true, message: 'Reset link sent to your email' });

  } catch (error) {
    console.error('❌ [FORGOT PASSWORD] Error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to send reset link', error: error.message });
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
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const storedToken = resetTokenStore.get(email);
    
    if (!storedToken || storedToken.token !== token) {
      return res.status(400).json({ success: false, message: 'Invalid reset token' });
    }

    if (Date.now() > storedToken.expiresAt) {
      resetTokenStore.delete(email);
      return res.status(400).json({ success: false, message: 'Token expired' });
    }

    const user = await User.findById(storedToken.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    await user.save();

    resetTokenStore.delete(email);

    console.log('✅ [RESET PASSWORD] Password reset for:', email);
    res.json({ success: true, message: 'Password reset successful' });

  } catch (error) {
    console.error('❌ [RESET PASSWORD] Error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to reset password', error: error.message });
  }
});

// ===== GET USER INFO =====

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
    res.status(401).json({ success: false, message: 'Invalid token', error: error.message });
  }
});

module.exports = router;