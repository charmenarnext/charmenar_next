const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

// POST /api/catering/submit
router.post('/submit', async (req, res) => {
  try {
    const { name, email, phone, eventType, eventDate, guestCount, message, services } = req.body;

    console.log('🍽️ [CATERING] New inquiry received:', { name, email, phone });

    // Validate required fields
    if (!name || !email || !phone || !eventType || !eventDate || !guestCount) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please fill in all required fields' 
      });
    }

    // Try to send Email (Wrap in try-catch so it doesn't crash the request)
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
          subject: `🍽️ New Catering Inquiry - ${eventType}`,
          html: `
            <div style="font-family: Arial; padding: 20px;">
              <h2>New Catering Inquiry</h2>
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
        console.log('✅ [CATERING] Email sent to admin');
      } else {
        console.warn('⚠️ [CATERING] Email credentials missing. Skipping email.');
      }
    } catch (emailError) {
      console.error('❌ [CATERING] Email sending failed:', emailError.message);
      // Continue so user still gets success response
    }

    // Send Success Response
    res.json({
      success: true,
      message: 'Thank you! Your inquiry has been submitted. We will contact you soon.'
    });

  } catch (error) {
    console.error('❌ [CATERING] Critical Error:', error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to submit inquiry. Please try again.',
      error: error.message 
    });
  }
});

// GET /api/catering/packages
router.get('/packages', async (req, res) => {
  try {
    const packages = [
      { id: 1, name: 'Basic Package', price: 500, description: 'Perfect for small gatherings' },
      { id: 2, name: 'Premium Package', price: 1000, description: 'Ideal for medium events' },
      { id: 3, name: 'Royal Package', price: 2000, description: 'For grand celebrations' }
    ];
    res.json({ success: true, packages });
  } catch (error) {
    console.error('❌ [CATERING] Packages error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch packages' });
  }
});

module.exports = router;