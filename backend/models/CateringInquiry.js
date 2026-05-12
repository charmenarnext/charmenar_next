const mongoose = require('mongoose');

const cateringInquirySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  phone: { type: String, required: true, trim: true },
  eventType: { type: String, required: true },
  eventDate: { type: Date, required: true },
  guestCount: { type: Number, required: true },
  services: { type: String, trim: true },
  message: { type: String, trim: true },
  status: { 
    type: String, 
    enum: ['new', 'contacted', 'confirmed', 'cancelled'], 
    default: 'new' 
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CateringInquiry', cateringInquirySchema);