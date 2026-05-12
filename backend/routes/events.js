const express = require('express');
const router = express.Router();
const EventBooking = require('../models/EventBooking');
const { sendAdminNotification } = require('../utils/emailService');

// POST /api/events/submit
router.post('/submit', async (req, res) => {
  try {
    const { name, email, phone, eventType, eventDate, venue, guestCount, budget, message, services } = req.body;

    console.log('🎉 [EVENTS] New booking:', { name, email, phone });

    // Validate
    if (!name || !email || !phone || !eventType || !eventDate || !guestCount) {
      return res.status(400).json({ success: false, message: 'Please fill in all required fields' });
    }

    // Save to database
    const booking = new EventBooking({
      name,
      email,
      phone,
      eventType,
      eventDate,
      venue: venue || '',
      guestCount,
      budget: budget || '',
      message: message || '',
      services: services || ''
    });

    await booking.save();
    console.log('✅ [EVENTS] Saved to database:', booking._id);

    // Send email to admin (non-blocking)
    sendAdminNotification('event', { ...booking.toObject(), eventDate: booking.eventDate.toISOString() })
      .then(() => console.log('✅ [EVENTS] Admin email sent'))
      .catch(err => console.error('❌ [EVENTS] Email failed:', err.message));

    res.json({
      success: true,
      message: 'Thank you! Your booking request has been submitted. We will contact you within 24 hours.',
      bookingId: booking._id
    });

  } catch (error) {
    console.error('❌ [EVENTS] Error:', error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to submit booking. Please try again.',
      error: error.message 
    });
  }
});

// GET /api/events/list (keep existing)
router.get('/list', async (req, res) => {
  try {
    const events = [
      { id: 1, name: 'Grand Wedding Package', category: 'Wedding', price: 50000 },
      { id: 2, name: 'Corporate Event', category: 'Corporate', price: 30000 },
      { id: 3, name: 'Birthday Celebration', category: 'Birthday', price: 15000 }
    ];
    res.json({ success: true, events });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch events' });
  }
});

module.exports = router;