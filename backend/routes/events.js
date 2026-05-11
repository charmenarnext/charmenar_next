const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

// POST /api/events/submit
router.post('/submit', async (req, res) => {
  try {
    const { name, email, phone, eventType, eventDate, venue, guestCount, budget, message, services } = req.body;

    console.log('🎉 [EVENTS] New booking request:', { name, email, phone });

    // Validate required fields
    if (!name || !email || !phone || !eventType || !eventDate || !guestCount) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please fill in all required fields' 
      });
    }

    // Try to send Email (Wrap in try-catch)
    try {
      if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
          },
          tls: { rejectUnauthorized: false }
        });

        await transporter.sendMail({
          from: `"Charmenar Next" <${process.env.EMAIL_USER}>`,
          to: process.env.ADMIN_EMAIL || email,
          subject: `🎉 New Event Booking - ${eventType}`,
          html: `
            <div style="font-family: Arial; padding: 20px;">
              <h2>New Event Booking</h2>
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Phone:</strong> ${phone}</p>
              <p><strong>Event Type:</strong> ${eventType}</p>
              <p><strong>Date:</strong> ${eventDate}</p>
              <p><strong>Guests:</strong> ${guestCount}</p>
              <p><strong>Message:</strong> ${message || 'None'}</p>
            </div>
          `
        });
        console.log('✅ [EVENTS] Email sent to admin');
      } else {
        console.warn('⚠️ [EVENTS] Email credentials missing. Skipping email.');
      }
    } catch (emailError) {
      console.error('❌ [EVENTS] Email sending failed:', emailError.message);
    }

    // Send Success Response
    res.json({
      success: true,
      message: 'Thank you! Your booking request has been submitted. We will contact you soon.'
    });

  } catch (error) {
    console.error('❌ [EVENTS] Critical Error:', error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to submit booking. Please try again.',
      error: error.message 
    });
  }
});

// GET /api/events/list
router.get('/list', async (req, res) => {
  try {
    const events = [
      { id: 1, name: 'Grand Wedding Package', category: 'Wedding', price: 50000 },
      { id: 2, name: 'Corporate Event', category: 'Corporate', price: 30000 },
      { id: 3, name: 'Birthday Celebration', category: 'Birthday', price: 15000 }
    ];
    res.json({ success: true, events });
  } catch (error) {
    console.error('❌ [EVENTS] List error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch events' });
  }
});

module.exports = router;