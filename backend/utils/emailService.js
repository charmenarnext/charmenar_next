const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    // ✅ Uses your EMAIL_USER and EMAIL_PASS from .env
    user: process.env.EMAIL_USER || 'charmenarnext@gmail.com',
    pass: process.env.EMAIL_PASS // Required for emails to work
  }
});

const sendAdminNotification = async (eventData, userData) => {
  // Skip in dev if no EMAIL_PASS (prevents crashes)
  if (!process.env.EMAIL_PASS && process.env.NODE_ENV !== 'production') {
    console.log('📧 [DEV] Email notification skipped:', {
      to: process.env.EMAIL_USER || 'charmenarnext@gmail.com',
      event: eventData.eventName,
      customer: userData.name
    });
    return { messageId: 'dev-mode' };
  }

  const mailOptions = {
    from: process.env.EMAIL_USER || 'charmenarnext@gmail.com',
    to: 'charmenarnext@gmail.com',
    subject: `New ${eventData.eventType} Booking - ${eventData.eventName}`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px;">
        <div style="background: white; border-radius: 15px; padding: 30px; box-shadow: 0 10px 40px rgba(0,0,0,0.2);">
          <h1 style="color: #667eea; text-align: center; margin-bottom: 30px; font-size: 28px;">✨ New Event Booking</h1>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
            <h2 style="color: #333; margin-top: 0;">Event Details</h2>
            <p><strong>Type:</strong> ${eventData.eventType}</p>
            <p><strong>Name:</strong> ${eventData.eventName}</p>
            <p><strong>Date:</strong> ${new Date(eventData.eventDate).toLocaleDateString()}</p>
            <p><strong>Guests:</strong> ${eventData.numberOfGuests}</p>
          </div>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 10px;">
            <h2 style="color: #333; margin-top: 0;">Customer</h2>
            <p><strong>Name:</strong> ${userData.name}</p>
            <p><strong>Email:</strong> ${userData.email}</p>
            <p><strong>Phone:</strong> ${userData.phone}</p>
          </div>
          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3003'}/admin/dashboard" 
               style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 30px; font-weight: bold;">
              View in Admin Panel
            </a>
          </div>
        </div>
      </div>
    `
  };

  return await transporter.sendMail(mailOptions);
};

const sendAdminLoginOTP = async (email, otp) => {
  if (!process.env.EMAIL_PASS && process.env.NODE_ENV !== 'production') {
    console.log(`🔐 [DEV] Admin OTP: ${otp}`);
    return { messageId: 'dev-mode' };
  }

  const mailOptions = {
    from: process.env.EMAIL_USER || 'charmenarnext@gmail.com',
    to: email,
    subject: 'Charmenar Next - Admin Login OTP',
    html: `
      <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="background: white; border-radius: 15px; padding: 40px 30px; text-align: center;">
          <h1 style="color: #667eea;">Admin Login</h1>
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; font-size: 48px; font-weight: bold; padding: 20px 40px; border-radius: 10px; margin: 20px 0; letter-spacing: 5px;">
            ${otp}
          </div>
          <p style="color: #999;">Valid for 10 minutes</p>
        </div>
      </div>
    `
  };

  return await transporter.sendMail(mailOptions);
};

const sendWelcomeEmail = async (email, name) => {
  if (!process.env.EMAIL_PASS && process.env.NODE_ENV !== 'production') {
    console.log(`👋 [DEV] Welcome email to: ${email}`);
    return { messageId: 'dev-mode' };
  }

  const mailOptions = {
    from: process.env.EMAIL_USER || 'charmenarnext@gmail.com',
    to: email,
    subject: 'Welcome to Charmenar Next!',
    html: `
      <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="background: white; border-radius: 15px; padding: 40px 30px; text-align: center;">
          <h1 style="color: #667eea;">Welcome to Charmenar Next! 🎉</h1>
          <p style="color: #555; font-size: 18px;">Dear ${name},<br>Thank you for registering!</p>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3003'}/catering-events" 
             style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 30px; margin-top: 20px;">
            Book Now
          </a>
        </div>
      </div>
    `
  };

  return await transporter.sendMail(mailOptions);
};

module.exports = {
  sendAdminNotification,
  sendAdminLoginOTP,
  sendWelcomeEmail
};