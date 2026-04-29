const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://charmenarnext.github.io', 'http://localhost:3003']
    : 'http://localhost:3003',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/events', require('./routes/events'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Charmenar Next Catering Events API is running',
    port: process.env.PORT || 5010
  });
});

// MongoDB Connection with your database name
const PORT = process.env.PORT || 5010;
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/charmenar-next-catering-events';

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => {
    console.log(`✅ MongoDB Connected: charmenar-next-catering-events`);
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📡 API Base: http://localhost:${PORT}/api`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err.message);
    process.exit(1);
  });

module.exports = app;