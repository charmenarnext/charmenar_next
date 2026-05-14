// ===== IMPORTS =====
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
require('dotenv').config();

const app = express();

// ===== STARTUP LOGGING =====
console.log('');
console.log('═══════════════════════════════════════════════════════');
console.log('🚀 Starting Charmenar Next Backend...');
console.log('📦 Environment:', process.env.NODE_ENV || 'development');
console.log('🔌 Port:', process.env.PORT || 5010);
console.log('═══════════════════════════════════════════════════════');
console.log('');

// ===== CORS Configuration - Allow All Approved Origins =====
app.use(cors({
  origin: [
    'https://charmenarnext.com',
    'https://www.charmenarnext.com',
    'https://charmenarnext.github.io',
    'https://charmenarnext.github.io/charmenar_next',
    'http://localhost:3003',
    'http://localhost:3000',
    'http://localhost:5010'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// ===== Security Headers (Helmet) =====
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }, // Allow GitHub Pages
  contentSecurityPolicy: false, // Disable for API (handled by frontend)
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: false
}));

// ===== Request Body Parsing =====
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ===== Input Sanitization (NoSQL Injection + XSS Prevention) =====
app.use(mongoSanitize()); // Blocks $ and . in payloads
app.use(xss()); // Sanitizes HTML/script tags

// ===== Request Logging Middleware =====
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.originalUrl} from ${req.ip || req.socket.remoteAddress}`);
  next();
});

// ===== Rate Limiting =====

// General API limiter (100 requests per 15 minutes)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', apiLimiter);

// Stricter limiter for auth/OTP endpoints (5 attempts per 10 minutes)
const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  message: { success: false, message: 'Too many login attempts. Wait 10 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/auth/', authLimiter);

// ===== ROUTES =====
console.log('📦 Loading routes...');
console.log('');

// Auth routes (MUST be loaded first)
try {
  const authRoutes = require('./routes/auth');
  app.use('/api/auth', authRoutes);
  console.log('✅ Auth routes loaded: /api/auth');
  console.log('   → POST /api/auth/admin/request-otp');
  console.log('   → POST /api/auth/admin/login');
  console.log('   → POST /api/auth/register');
  console.log('   → POST /api/auth/login');
  console.log('   → GET  /api/auth/me');
} catch (error) {
  console.error('❌ Failed to load auth routes:', error.message);
}
console.log('');

// Catering routes
try {
  const cateringRoutes = require('./routes/catering');
  app.use('/api/catering', cateringRoutes);
  console.log('✅ Catering routes loaded: /api/catering');
} catch (error) {
  console.error('❌ Failed to load catering routes:', error.message);
}

// Events routes (FIXED: Removed duplicate registration)
try {
  const eventsRoutes = require('./routes/events');
  app.use('/api/events', eventsRoutes);
  console.log('✅ Events routes loaded: /api/events');
  console.log('   → POST /api/events/submit');
  console.log('   → GET  /api/events');
} catch (error) {
  console.error('❌ Failed to load events routes:', error.message);
}

// Contact routes
try {
  const contactRoutes = require('./routes/contact');
  app.use('/api/contact', contactRoutes);
  console.log('✅ Contact routes loaded: /api/contact');
} catch (error) {
  console.error('❌ Failed to load contact routes:', error.message);
}

// Admin routes
try {
  const adminRoutes = require('./routes/admin');
  app.use('/api/admin', adminRoutes);
  console.log('✅ Admin routes loaded: /api/admin');
} catch (error) {
  console.error('❌ Failed to load admin routes:', error.message);
}
console.log('');

// ===== HEALTH CHECK ENDPOINT =====
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Charmenar Next Catering Events API is running',
    port: process.env.PORT || 5010,
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    routes: {
      auth: '/api/auth',
      catering: '/api/catering',
      events: '/api/events',
      contact: '/api/contact',
      admin: '/api/admin',
      health: '/api/health'
    }
  });
});

// ===== ROOT ENDPOINT =====
app.get('/', (req, res) => {
  res.json({
    name: 'Charmenar Next API',
    version: '1.0.0',
    documentation: 'https://github.com/charmenarnext/charmenar_next',
    status: 'running',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      catering: '/api/catering',
      events: '/api/events',
      contact: '/api/contact',
      admin: '/api/admin'
    }
  });
});

// ===== DEBUG ENDPOINTS (Production-Safe: Only in Development) =====
if (process.env.NODE_ENV !== 'production') {
  app.get('/api/debug/check', (req, res) => {
    console.log('🧪 [DEBUG] Check endpoint hit');
    res.json({
      success: true,
      message: 'Backend is alive and responding!',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      port: process.env.PORT || 5010
    });
  });

  app.post('/api/debug/test', (req, res) => {
    console.log('🧪 [DEBUG] Test endpoint hit!', req.body);
    res.json({
      success: true,
      message: 'Backend received your request!',
      received: req.body,
      timestamp: new Date().toISOString()
    });
  });
}

// ===== 404 HANDLER (MUST be after all routes) =====
app.use((req, res, next) => {
  console.warn(`⚠️  404: Route not found - ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    path: req.originalUrl,
    method: req.method,
    availableRoutes: [
      'GET  /',
      'GET  /api/health',
      'POST /api/auth/admin/request-otp',
      'POST /api/auth/admin/login',
      'POST /api/auth/register',
      'POST /api/auth/login',
      'GET  /api/auth/me',
      'POST /api/catering/submit',
      'GET  /api/catering',
      'POST /api/events/submit',
      'GET  /api/events',
      'POST /api/contact/submit',
      'GET  /api/admin/stats',
      'GET  /api/admin/bookings',
      'PATCH /api/admin/bookings/:id/status',
      'DELETE /api/admin/bookings/:id'
    ]
  });
});

// ===== GLOBAL ERROR HANDLER (MUST be last) =====
app.use((err, req, res, next) => {
  console.error('');
  console.error('🔥 Global Error Handler:');
  console.error('   Message:', err.message);
  console.error('   Name:', err.name);
  console.error('   Code:', err.code);
  console.error('   Path:', req.path);
  console.error('   Method:', req.method);
  console.error('');

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: Object.values(err.errors).map(e => e.message)
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    return res.status(400).json({
      success: false,
      message: 'Duplicate entry. This record already exists.'
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }

  // Default error - hide stack in production
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// ===== MONGODB CONNECTION =====
const PORT = process.env.PORT || 5010;
const MONGO_URI = process.env.MONGODB_URI;

console.log('🔌 Connecting to MongoDB...');

if (!MONGO_URI) {
  console.error('');
  console.error('❌ FATAL ERROR: MONGODB_URI environment variable is NOT set!');
  console.error('💡 Add MONGODB_URI in Render Dashboard → Environment');
  console.error('');
  process.exit(1);
}

// Mask password in logs for security
const maskedUri = MONGO_URI.replace(/:[^:]+@/, ':****@');
console.log('📊 Connection String:', maskedUri);
console.log('');

mongoose.connect(MONGO_URI, {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  maxPoolSize: 10,
})
  .then(() => {
    console.log('');
    console.log('✅ MongoDB Connected Successfully');
    console.log(`📊 Database: ${mongoose.connection.name}`);
    console.log(`🌐 Host: ${mongoose.connection.host}`);
    console.log('');
    
    // Start server AFTER successful DB connection
    app.listen(PORT, '0.0.0.0', () => {
      console.log('');
      console.log('═══════════════════════════════════════════════════════');
      console.log('✅ SERVER RUNNING SUCCESSFULLY');
      console.log('═══════════════════════════════════════════════════════');
      console.log(`🚀 Port: ${PORT}`);
      console.log(`📡 API Base: http://localhost:${PORT}/api`);
      console.log(`🌐 Health: http://localhost:${PORT}/api/health`);
      console.log(`🔐 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌍 Listening on: 0.0.0.0:${PORT}`);
      console.log('');
      console.log('📦 Available Endpoints:');
      console.log('   GET  /api/health');
      console.log('   POST /api/auth/admin/request-otp');
      console.log('   POST /api/auth/admin/login');
      console.log('   POST /api/auth/register');
      console.log('   POST /api/auth/login');
      console.log('   GET  /api/auth/me');
      console.log('   POST /api/catering/submit');
      console.log('   GET  /api/catering');
      console.log('   POST /api/events/submit');
      console.log('   GET  /api/events');
      console.log('   POST /api/contact/submit');
      console.log('   GET  /api/admin/stats');
      console.log('   GET  /api/admin/bookings');
      console.log('   PATCH /api/admin/bookings/:id/status');
      console.log('   DELETE /api/admin/bookings/:id');
      console.log('═══════════════════════════════════════════════════════');
      console.log('');
    });
  })
  .catch(err => {
    console.error('');
    console.error('❌ MongoDB Connection Error:');
    console.error('   Message:', err.message);
    console.error('   Name:', err.name);
    console.error('   Code:', err.code);
    console.error('');
    console.log('⏳ Retrying connection in 10 seconds...');
    setTimeout(() => {
      mongoose.connect(MONGO_URI).catch(() => {
        console.error('❌ Failed to reconnect. Exiting...');
        process.exit(1);
      });
    }, 10000);
  });

// ===== GRACEFUL SHUTDOWN =====
process.on('SIGINT', async () => {
  console.log('');
  console.log('🛑 Received SIGINT. Shutting down gracefully...');
  await mongoose.connection.close();
  console.log('✅ MongoDB connection closed');
  console.log('👋 Goodbye!');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('');
  console.log('🛑 Received SIGTERM. Shutting down gracefully...');
  await mongoose.connection.close();
  console.log('✅ MongoDB connection closed');
  console.log('👋 Goodbye!');
  process.exit(0);
});

// Handle unhandled promise rejections (don't crash the server)
process.on('unhandledRejection', (reason, promise) => {
  console.error('');
  console.error('💥 Unhandled Promise Rejection:');
  console.error('   Reason:', reason);
  console.error('');
  // Don't exit - let the app continue running
});

// Export app for testing
module.exports = app;