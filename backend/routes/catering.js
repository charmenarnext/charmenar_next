const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

// POST /api/catering/submit
router.post('/submit', async (req, res) => {
  try {
    const { 
      name, 
      email, 
      phone, 
      eventType, 
      eventDate, 
      guestCount, 
      message,
      services 
    } = req.body;

    console.log('🍽️ [CATERING] New inquiry received:', { name, email, phone });

    // Validate required fields
    if (!name || !email || !phone || !eventType || !eventDate || !guestCount) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please fill in all required fields' 
      });
    }

    // Send email notification to admin
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
      to: process.env.ADMIN_EMAIL || 'charmenarnext@gmail.com',
      subject: `🍽️ New Catering Inquiry - ${eventType}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background: #f4f4f4;">
          <div style="background: white; padding: 30px; border-radius: 10px; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #667eea;">New Catering Inquiry</h2>
            
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <tr style="background: #f8f9fa;">
                <td style="padding: 12px; border: 1px solid #dee2e6; font-weight: bold;">Name</td>
                <td style="padding: 12px; border: 1px solid #dee2e6;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 12px; border: 1px solid #dee2e6; font-weight: bold;">Email</td>
                <td style="padding: 12px; border: 1px solid #dee2e6;">${email}</td>
              </tr>
              <tr style="background: #f8f9fa;">
                <td style="padding: 12px; border: 1px solid #dee2e6; font-weight: bold;">Phone</td>
                <td style="padding: 12px; border: 1px solid #dee2e6;">${phone}</td>
              </tr>
              <tr>
                <td style="padding: 12px; border: 1px solid #dee2e6; font-weight: bold;">Event Type</td>
                <td style="padding: 12px; border: 1px solid #dee2e6;">${eventType}</td>
              </tr>
              <tr style="background: #f8f9fa;">
                <td style="padding: 12px; border: 1px solid #dee2e6; font-weight: bold;">Event Date</td>
                <td style="padding: 12px; border: 1px solid #dee2e6;">${eventDate}</td>
              </tr>
              <tr>
                <td style="padding: 12px; border: 1px solid #dee2e6; font-weight: bold;">Guest Count</td>
                <td style="padding: 12px; border: 1px solid #dee2e6;">${guestCount}</td>
              </tr>
              <tr style="background: #f8f9fa;">
                <td style="padding: 12px; border: 1px solid #dee2e6; font-weight: bold;">Services</td>
                <td style="padding: 12px; border: 1px solid #dee2e6;">${services || 'Not specified'}</td>
              </tr>
              <tr>
                <td style="padding: 12px; border: 1px solid #dee2e6; font-weight: bold;">Message</td>
                <td style="padding: 12px; border: 1px solid #dee2e6;">${message || 'No message'}</td>
              </tr>
            </table>
            
            <p style="color: #999; font-size: 12px;">Received on ${new Date().toLocaleString()}</p>
          </div>
        </div>
      `
    });

    console.log('✅ [CATERING] Inquiry email sent to admin');

    res.json({
      success: true,
      message: 'Thank you! Your catering inquiry has been submitted. We will contact you within 24 hours.'
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

// GET /api/catering/packages
router.get('/packages', async (req, res) => {
  try {
    // Sample packages - replace with database query
    const packages = [
      {
        id: 1,
        name: 'Basic Package',
        price: 500,
        description: 'Perfect for small gatherings',
        items: ['Starter', 'Main Course', 'Dessert']
      },
      {
        id: 2,
        name: 'Premium Package',
        price: 1000,
        description: 'Ideal for medium events',
        items: ['Starter', 'Main Course', 'Dessert', 'Beverages']
      },
      {
        id: 3,
        name: 'Royal Package',
        price: 2000,
        description: 'For grand celebrations',
        items: ['Starter', 'Main Course', 'Dessert', 'Beverages', 'Special Dishes']
      }
    ];

    res.json({ success: true, packages });
  } catch (error) {
    console.error('❌ [CATERING] Packages error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch packages' });
  }
});

module.exports = router;