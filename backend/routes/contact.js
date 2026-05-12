const express = require('express');
const router = express.Router();
const ContactMessage = require('../models/ContactMessage');
const { sendAdminNotification } = require('../utils/emailService');

// POST /api/contact/submit
router.post('/submit', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    console.log('📬 [CONTACT] New message:', { name, email, subject });

    // Validate
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ success: false, message: 'Please fill in all required fields' });
    }

    // Save to database
    const contactMsg = new ContactMessage({
      name,
      email,
      phone: phone || '',
      subject,
      message
    });

    await contactMsg.save();
    console.log('✅ [CONTACT] Saved to database:', contactMsg._id);

    // Send email to admin (non-blocking)
    sendAdminNotification('contact', contactMsg.toObject())
      .then(() => console.log('✅ [CONTACT] Admin email sent'))
      .catch(err => console.error('❌ [CONTACT] Email failed:', err.message));

    res.json({
      success: true,
      message: 'Thank you! Your message has been sent. We will respond within 24 hours.',
      messageId: contactMsg._id
    });

  } catch (error) {
    console.error('❌ [CONTACT] Error:', error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send message. Please try again.',
      error: error.message 
    });
  }
});

module.exports = router;