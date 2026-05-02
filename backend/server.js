const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
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

// ===== CORS Configuration =====
const allowedOrigins = [
  'https://charmenarnext.github.io',
  'https://charmenarnext.github.io/charmenar_next',
  'http://localhost:3003',
  'http://localhost:3000',
  undefined  // Allow requests with no origin (curl, mobile, etc.)
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    console.warn('⚠️  CORS blocked origin:', origin);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// ===== Middleware =====
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.originalUrl} from ${req.ip}`);
  next();
});

// ===== Routes =====
console.log('📦 Loading routes...');
console.log('');

// Auth routes - MUST be loaded first
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
  console.error('   Stack:', error.stack);
}

console.log('');

// Events routes
try {
  const eventsRoutes = require('./routes/events');
  app.use('/api/events', eventsRoutes);
  console.log('✅ Events routes loaded: /api/events');
  console.log('   → POST /api/events/submit');
  console.log('   → GET  /api/events');
} catch (error) {
  console.error('❌ Failed to load events routes:', error.message);
}

console.log('');

// ===== Health Check Endpoint =====
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Charmenar Next Catering Events API is running',
    port: process.env.PORT || 5010,
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    routes: {
      auth: '/api/auth',
      events: '/api/events',
      health: '/api/health'
    }
  });
});

// ===== Root Endpoint =====
app.get('/', (req, res) => {
  res.json({
    name: 'Charmenar Next API',
    version: '1.0.0',
    documentation: 'https://github.com/charmenarnext/charmenar_next',
    status: 'running',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      events: '/api/events'
    }
  });
});

// ===== 404 Handler (MUST be after all routes) =====
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
      'POST /api/events/submit',
      'GET  /api/events'
    ]
  });
});

// ===== Global Error Handler (MUST be last) =====
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

  // Default error
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// ===== MongoDB Connection =====
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

// Mask password in logs
const maskedUri = MONGO_URI.replace(/:[^:]+@/, ':****@');
console.log('📊 Connection String:', maskedUri);
console.log('');

mongoose.connect(MONGO_URI, {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
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
      console.log('   POST /api/events/submit');
      console.log('   GET  /api/events');
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

// ===== Graceful Shutdown =====
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

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('');
  console.error('💥 Unhandled Promise Rejection:');
  console.error('   Promise:', promise);
  console.error('   Reason:', reason);
  console.error('');
  // Don't exit - let the app continue running
});

module.exports = app;