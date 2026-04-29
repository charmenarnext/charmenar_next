const mongoose = require('mongoose');
const crypto = require('crypto');

const adminOTPSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  otp: {
    type: String,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 3600 // Auto-delete after 1 hour
  }
});

adminOTPSchema.methods.generateOTP = function() {
  this.otp = crypto.randomInt(100000, 999999).toString();
  this.expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  return this.otp;
};

module.exports = mongoose.model('AdminOTP', adminOTPSchema);