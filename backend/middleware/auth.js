const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ✅ Use your JWT_SECRET from .env
const JWT_SECRET = process.env.JWT_SECRET || 'charmenar-next-catering-events-fallback-secret-key-do-not-use-in-production';

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // Verify with YOUR JWT_SECRET
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth error:', error.message);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

const adminAuth = async (req, res, next) => {
  try {
    await auth(req, res, () => {
      if (!req.user.isAdmin) {
        return res.status(403).json({ message: 'Access denied. Admin only.' });
      }
      next();
    });
  } catch (error) {
    res.status(403).json({ message: 'Access denied' });
  }
};

module.exports = { auth, adminAuth };