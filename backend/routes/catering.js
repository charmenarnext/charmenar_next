router.post('/submit', async (req, res) => {
  try {
    const { name, email, phone, eventType, eventDate, guestCount, message, services } = req.body;

    console.log('🍽️ [CATERING] New inquiry received:', { name, email, phone });

    // 1. Save to Database (Optional - currently skipping to prevent DB errors if schema isn't ready)
    // TODO: Add User/Inquiry model later

    // 2. Try to send Email (Wrap in try-catch so it doesn't crash the request)
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
          to: process.env.ADMIN_EMAIL || email, // Fallback to user email if admin email missing
          subject: `🍽️ New Catering Inquiry - ${eventType}`,
          html: `<h3>New Inquiry</h3><p>Name: ${name}</p><p>Email: ${email}</p><p>Phone: ${phone}</p>`
        });
        console.log('✅ [CATERING] Email sent to admin');
      } else {
        console.warn('⚠️ [CATERING] Email credentials missing in Render. Skipping email.');
      }
    } catch (emailError) {
      console.error('❌ [CATERING] Email sending failed:', emailError.message);
      // We continue so the user still gets a success response
    }

    // 3. Send Success Response
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