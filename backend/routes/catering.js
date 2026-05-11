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

    // ✅ Send response to user IMMEDIATELY (don't wait for email)
    res.json({
      success: true,
      message: 'Thank you! Your inquiry has been submitted. We will contact you soon.'
    });

    // 🔥 Send email in background (non-blocking)
    sendCateringEmail({ name, email, phone, eventType, eventDate, guestCount, message, services });

  } catch (error) {
    console.error('❌ [CATERING] Critical Error:', error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to submit inquiry. Please try again.',
      error: error.message 
    });
  }
});

// Helper function to send email (non-blocking)
async function sendCateringEmail(data) {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn('⚠️ [CATERING] Email credentials missing');
      return;
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      tls: { rejectUnauthorized: false },
      connectionTimeout: 5000 // 5 second timeout
    });

    await transporter.sendMail({
      from: `"Charmenar Next" <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL || data.email,
      subject: `🍽️ New Catering Inquiry - ${data.eventType}`,
      html: `
        <div style="font-family: Arial; padding: 20px; background: #f4f4f4;">
          <div style="background: white; padding: 30px; border-radius: 10px; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #667eea;">New Catering Inquiry</h2>
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <tr style="background: #f8f9fa;"><td style="padding: 12px; border: 1px solid #dee2e6; font-weight: bold;">Name</td><td style="padding: 12px; border: 1px solid #dee2e6;">${data.name}</td></tr>
              <tr><td style="padding: 12px; border: 1px solid #dee2e6; font-weight: bold;">Email</td><td style="padding: 12px; border: 1px solid #dee2e6;">${data.email}</td></tr>
              <tr style="background: #f8f9fa;"><td style="padding: 12px; border: 1px solid #dee2e6; font-weight: bold;">Phone</td><td style="padding: 12px; border: 1px solid #dee2e6;">${data.phone}</td></tr>
              <tr><td style="padding: 12px; border: 1px solid #dee2e6; font-weight: bold;">Event Type</td><td style="padding: 12px; border: 1px solid #dee2e6;">${data.eventType}</td></tr>
              <tr style="background: #f8f9fa;"><td style="padding: 12px; border: 1px solid #dee2e6; font-weight: bold;">Date</td><td style="padding: 12px; border: 1px solid #dee2e6;">${data.eventDate}</td></tr>
              <tr><td style="padding: 12px; border: 1px solid #dee2e6; font-weight: bold;">Guests</td><td style="padding: 12px; border: 1px solid #dee2e6;">${data.guestCount}</td></tr>
              <tr style="background: #f8f9fa;"><td style="padding: 12px; border: 1px solid #dee2e6; font-weight: bold;">Message</td><td style="padding: 12px; border: 1px solid #dee2e6;">${data.message || 'None'}</td></tr>
            </table>
          </div>
        </div>
      `
    });

    console.log('✅ [CATERING] Email sent successfully');
  } catch (error) {
    console.error('❌ [CATERING] Email failed (non-blocking):', error.message);
    // Don't throw - we already sent success to user
  }
}