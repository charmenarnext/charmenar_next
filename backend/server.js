const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// ===== LOGGING =====
console.log('🚀 Starting Charmenar Next Backend...');
console.log('📦 Environment:', process.env.NODE_ENV || 'development');

// ===== CORS Configuration =====
const allowedOrigins = [
  'https://charmenarnext.github.io',
  'https://charmenarnext.github.io/charmenar_next',
  'http://localhost:3003',
  'http://localhost:3000'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'CORS policy: This origin is not allowed';
      console.warn('⚠️', msg, origin);
      return callback(new Error(msg), false);
    }
    return callback(null, true);
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
  console.log(`📥 ${req.method} ${req.path} from ${req.ip}`);
  next();
});

// ===== Routes =====
console.log('📦 Loading routes...');
app.use('/api/auth', require('./routes/auth'));
app.use('/api/events', require('./routes/events'));
app.use('/api/catering', require('./routes/catering')); // Add if you have this route

// ===== Health Check =====
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Charmenar Next Catering Events API is running',
    port: process.env.PORT || 5010,
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// ===== Root Route =====
app.get('/', (req, res) => {
  res.json({
    name: 'Charmenar Next API',
    version: '1.0.0',
    documentation: 'https://github.com/charmenarnext/charmenar_next',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      events: '/api/events',
      catering: '/api/catering'
    }
  });
});

// ===== 404 Handler (Must be after all routes) =====
app.use((req, res, next) => {
  console.warn(`⚠️ 404: Route not found - ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    path: req.originalUrl
  });
});

// ===== Global Error Handler (Must be last) =====
app.use((err, req, res, next) => {
  console.error('🔥 Global Error Handler:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method
  });

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

if (!MONGO_URI) {
  console.error('❌ MONGODB_URI environment variable is not set!');
  process.exit(1);
}

console.log('🔌 Connecting to MongoDB...');

mongoose.connect(MONGO_URI, {
  // Modern Mongoose options (v7+)
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
})
  .then(() => {
    console.log('✅ MongoDB Connected Successfully');
    console.log(`📊 Database: ${mongoose.connection.name}`);
    
    // Start server AFTER successful DB connection
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📡 API Base: http://localhost:${PORT}/api`);
      console.log(`🌐 Health Check: http://localhost:${PORT}/api/health`);
      console.log(`🔐 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', {
      message: err.message,
      name: err.name,
      code: err.code
    });
    
    // Don't exit immediately - let Render handle restarts
    console.log('⏳ Retrying connection in 10 seconds...');
    setTimeout(() => {
      mongoose.connect(MONGO_URI).catch(() => process.exit(1));
    }, 10000);
  });

// ===== Graceful Shutdown =====
process.on('SIGINT', async () => {
  console.log('🛑 Received SIGINT. Shutting down gracefully...');
  await mongoose.connection.close();
  console.log('✅ MongoDB connection closed');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('🛑 Received SIGTERM. Shutting down gracefully...');
  await mongoose.connection.close();
  console.log('✅ MongoDB connection closed');
  process.exit(0);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('💥 Unhandled Promise Rejection:', err);
  // Don't exit - let the app continue running
});

module.exports = app;