const express = require('express');
const router = express.Router();
const CateringInquiry = require('../models/CateringInquiry');
const { sendAdminNotification } = require('../utils/emailService');

// POST /api/catering/submit
router.post('/submit', async (req, res) => {
  try {
    const { name, email, phone, eventType, eventDate, guestCount, message, services } = req.body;

    console.log('🍽️ [CATERING] New inquiry:', { name, email, phone });

    // Validate
    if (!name || !email || !phone || !eventType || !eventDate || !guestCount) {
      return res.status(400).json({ success: false, message: 'Please fill in all required fields' });
    }

    // Save to database
    const inquiry = new CateringInquiry({
      name,
      email,
      phone,
      eventType,
      eventDate,
      guestCount,
      message: message || '',
      services: services || ''
    });

    await inquiry.save();
    console.log('✅ [CATERING] Saved to database:', inquiry._id);

    // Send email to admin (non-blocking)
    sendAdminNotification('catering', { ...inquiry.toObject(), eventDate: inquiry.eventDate.toISOString() })
      .then(() => console.log('✅ [CATERING] Admin email sent'))
      .catch(err => console.error('❌ [CATERING] Email failed:', err.message));

    res.json({
      success: true,
      message: 'Thank you! Your inquiry has been submitted. We will contact you within 24 hours.',
      inquiryId: inquiry._id
    });

  } catch (error) {
    console.error('❌ [CATERING] Error:', error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to submit inquiry. Please try again.',
      error: error.message 
    });
  }
});

// GET /api/catering/packages (keep existing)
router.get('/packages', async (req, res) => {
  try {
    const packages = [
      { id: 1, name: 'Basic Package', price: 500, description: 'Perfect for small gatherings' },
      { id: 2, name: 'Premium Package', price: 1000, description: 'Ideal for medium events' },
      { id: 3, name: 'Royal Package', price: 2000, description: 'For grand celebrations' }
    ];
    res.json({ success: true, packages });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch packages' });
  }
});

module.exports = router;