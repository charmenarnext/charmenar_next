router.post('/submit', async (req, res) => {
  try {
    const { name, email, phone, eventType, eventDate, venue, guestCount, budget, message, services } = req.body;

    console.log('🎉 [EVENTS] New booking request:', { name, email, phone });

    // 1. Try to send Email (Wrap in try-catch)
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
          html: `<h3>New Booking</h3><p>Name: ${name}</p><p>Email: ${email}</p><p>Phone: ${phone}</p>`
        });
        console.log('✅ [EVENTS] Email sent to admin');
      } else {
        console.warn('⚠️ [EVENTS] Email credentials missing. Skipping email.');
      }
    } catch (emailError) {
      console.error('❌ [EVENTS] Email sending failed:', emailError.message);
    }

    // 2. Send Success Response
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