const mongoose = require('mongoose');

const eventCateringSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  eventType: {
    type: String,
    required: true,
    // ✅ UPDATED: Added all event types from frontend forms
    enum: [
      'Wedding',
      'Corporate',
      'Birthday',
      'Anniversary',
      'Baby Shower',
      'Catering',
      'Other'
    ]
  },
  eventName: {
    type: String,
    required: true
  },
  eventDate: {
    type: Date,
    required: true
  },
  eventTime: {
    type: String,
    required: true
  },
  venue: {
    type: String,
    required: true
  },
  numberOfGuests: {
    type: Number,
    required: true,
    min: 1
  },
  menuPreferences: {
    type: String,
    required: true
  },
  specialRequests: {
    type: String,
    default: ''
  },
  budget: {
    type: String,
    required: true
  },
  contactPerson: {
    name: String,
    phone: String,
    email: String
  },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'In Progress', 'Completed', 'Cancelled'],
    default: 'Pending'
  },
  adminNotes: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('EventCatering', eventCateringSchema);