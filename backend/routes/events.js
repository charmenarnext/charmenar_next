const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const EventCatering = require('../models/EventCatering');
const User = require('../models/User');
const { auth, adminAuth } = require('../middleware/auth');
const { sendAdminNotification } = require('../utils/emailService');

// Submit Event/Catering Form (Authenticated users only)
router.post('/submit', auth, [
  body('eventType').notEmpty().withMessage('Event type is required'),
  body('eventName').trim().notEmpty().withMessage('Event name is required'),
  body('eventDate').notEmpty().withMessage('Event date is required'),
  body('eventTime').notEmpty().withMessage('Event time is required'),
  body('venue').trim().notEmpty().withMessage('Venue is required'),
  body('numberOfGuests').notEmpty().withMessage('Number of guests is required'),
  body('menuPreferences').trim().notEmpty().withMessage('Menu preferences are required'),
  body('budget').trim().notEmpty().withMessage('Budget is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Validation errors:', errors.array());
    return res.status(400).json({ 
      success: false,
      errors: errors.array() 
    });
  }

  try {
    console.log('📝 Received booking request:', req.body);
    console.log('👤 User ID:', req.user._id);

    // Parse and validate data
    const {
      eventType,
      eventName,
      eventDate,
      eventTime,
      venue,
      numberOfGuests,
      menuPreferences,
      specialRequests,
      budget
    } = req.body;

    // Create new booking
    const eventData = new EventCatering({
      userId: req.user._id,
      eventType,
      eventName,
      eventDate: new Date(eventDate),
      eventTime,
      venue,
      numberOfGuests: parseInt(numberOfGuests) || 1,
      menuPreferences,
      specialRequests: specialRequests || '',
      budget
    });

    await eventData.save();
    console.log('✅ Booking saved successfully:', eventData._id);

    // Send notification to admin (don't fail if email fails)
    try {
      await sendAdminNotification(eventData, req.user);
      console.log('📧 Admin notification sent');
    } catch (emailError) {
      console.warn('⚠️ Email notification failed:', emailError.message);
      // Don't fail the request if email fails
    }

    res.status(201).json({
      success: true,
      message: 'Event booking submitted successfully! We will contact you soon.',
      data: eventData
    });
  } catch (error) {
    console.error('❌ Event submission error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      success: false,
      message: 'Failed to submit booking. Please try again.',
      error: error.message
    });
  }
});

// Get user's bookings
router.get('/my-bookings', auth, async (req, res) => {
  try {
    const bookings = await EventCatering.find({ userId: req.user._id })
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      bookings
    });
  } catch (error) {
    console.error('Fetch bookings error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

// Admin - Get all bookings
// Admin - Get all bookings (WITH FILTERS)
// Admin - Get all bookings (WITH FILTERS)
router.get('/admin/all-bookings', adminAuth, async (req, res) => {
  try {
    const {
      eventType,
      status,
      startDate,
      endDate,
      bookingType,
      search
    } = req.query;

    // Build filter object
    const filter = {};

    // Filter by booking type (Catering vs Events)
    if (bookingType && bookingType !== 'All') {
      if (bookingType === 'Catering') {
        filter.eventType = 'Catering';
      } else if (bookingType === 'Events') {
        // Events = all event types EXCEPT Catering
        filter.eventType = { 
          $in: ['Wedding', 'Corporate', 'Birthday', 'Anniversary', 'Baby Shower', 'Other'] 
        };
      }
    }

    // Filter by specific event type (overrides bookingType if both selected)
    if (eventType && eventType !== 'All') {
      filter.eventType = eventType;
    }

    // Filter by status
    if (status && status !== 'All') {
      filter.status = status;
    }

    // Filter by date range
    if (startDate || endDate) {
      filter.eventDate = {};
      if (startDate) {
        filter.eventDate.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.eventDate.$lte = new Date(endDate);
      }
    }

    // Search by event name or customer name
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      const userSearch = await User.find({
        $or: [
          { name: searchRegex },
          { email: searchRegex }
        ]
      }).select('_id');
      
      const userIds = userSearch.map(u => u._id);
      
      filter.$or = [
        { eventName: searchRegex },
        { venue: searchRegex },
        { userId: { $in: userIds } }
      ];
    }

    console.log('🔍 Filter:', filter);

    const bookings = await EventCatering.find(filter)
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: bookings,
      total: bookings.length,
      filters: {
        eventType,
        status,
        startDate,
        endDate,
        bookingType,
        search
      }
    });
  } catch (error) {
    console.error('Fetch all bookings error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

// Admin - Update booking status
router.put('/admin/update-booking/:id', adminAuth, async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    
    const booking = await EventCatering.findByIdAndUpdate(
      req.params.id,
      { status, adminNotes },
      { new: true }
    ).populate('userId', 'name email phone');

    if (!booking) {
      return res.status(404).json({ 
        success: false,
        message: 'Booking not found' 
      });
    }

    res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error('Update booking error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

// Admin - Delete booking
router.delete('/admin/delete-booking/:id', adminAuth, async (req, res) => {
  try {
    const booking = await EventCatering.findByIdAndDelete(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ 
        success: false,
        message: 'Booking not found' 
      });
    }

    res.json({
      success: true,
      message: 'Booking deleted successfully'
    });
  } catch (error) {
    console.error('Delete booking error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

module.exports = router;