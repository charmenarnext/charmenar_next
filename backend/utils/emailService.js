const sgMail = require('@sendgrid/mail');

if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

const sendAdminNotification = async (type, data) => {
  try {
    const fromEmail = process.env.SENDGRID_FROM_EMAIL || 'charmenarnext@gmail.com';
    const fromName = process.env.SENDGRID_FROM_NAME || 'Charmenar Next';
    const adminEmail = process.env.ADMIN_EMAIL || 'charmenarnext@gmail.com';

    let subject, html;

    switch (type) {
      case 'catering':
        subject = `🍽️ New Catering Inquiry - ${data.eventType}`;
        html = `
          <div style="font-family: Arial, sans-serif; padding: 20px; background: #f4f4f4;">
            <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px;">
              <h2 style="color: #667eea; text-align: center;">New Catering Inquiry</h2>
              <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                <tr><td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Name</strong></td><td style="padding: 10px; border-bottom: 1px solid #eee;">${data.name}</td></tr>
                <tr><td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Email</strong></td><td style="padding: 10px; border-bottom: 1px solid #eee;">${data.email}</td></tr>
                <tr><td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Phone</strong></td><td style="padding: 10px; border-bottom: 1px solid #eee;">${data.phone}</td></tr>
                <tr><td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Event Type</strong></td><td style="padding: 10px; border-bottom: 1px solid #eee;">${data.eventType}</td></tr>
                <tr><td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Event Date</strong></td><td style="padding: 10px; border-bottom: 1px solid #eee;">${new Date(data.eventDate).toLocaleDateString()}</td></tr>
                <tr><td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Guest Count</strong></td><td style="padding: 10px; border-bottom: 1px solid #eee;">${data.guestCount}</td></tr>
                ${data.services ? `<tr><td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Services</strong></td><td style="padding: 10px; border-bottom: 1px solid #eee;">${data.services}</td></tr>` : ''}
                ${data.message ? `<tr><td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Message</strong></td><td style="padding: 10px; border-bottom: 1px solid #eee;">${data.message}</td></tr>` : ''}
              </table>
              <p style="text-align: center; color: #999; font-size: 12px;">Received: ${new Date().toLocaleString()}</p>
            </div>
          </div>
        `;
        break;

      case 'event':
        subject = `🎉 New Event Booking - ${data.eventType}`;
        html = `
          <div style="font-family: Arial, sans-serif; padding: 20px; background: #f4f4f4;">
            <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px;">
              <h2 style="color: #764ba2; text-align: center;">New Event Booking</h2>
              <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                <tr><td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Name</strong></td><td style="padding: 10px; border-bottom: 1px solid #eee;">${data.name}</td></tr>
                <tr><td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Email</strong></td><td style="padding: 10px; border-bottom: 1px solid #eee;">${data.email}</td></tr>
                <tr><td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Phone</strong></td><td style="padding: 10px; border-bottom: 1px solid #eee;">${data.phone}</td></tr>
                <tr><td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Event Type</strong></td><td style="padding: 10px; border-bottom: 1px solid #eee;">${data.eventType}</td></tr>
                <tr><td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Event Date</strong></td><td style="padding: 10px; border-bottom: 1px solid #eee;">${new Date(data.eventDate).toLocaleDateString()}</td></tr>
                ${data.venue ? `<tr><td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Venue</strong></td><td style="padding: 10px; border-bottom: 1px solid #eee;">${data.venue}</td></tr>` : ''}
                <tr><td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Guest Count</strong></td><td style="padding: 10px; border-bottom: 1px solid #eee;">${data.guestCount}</td></tr>
                ${data.budget ? `<tr><td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Budget</strong></td><td style="padding: 10px; border-bottom: 1px solid #eee;">${data.budget}</td></tr>` : ''}
                ${data.services ? `<tr><td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Services</strong></td><td style="padding: 10px; border-bottom: 1px solid #eee;">${data.services}</td></tr>` : ''}
                ${data.message ? `<tr><td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Message</strong></td><td style="padding: 10px; border-bottom: 1px solid #eee;">${data.message}</td></tr>` : ''}
              </table>
              <p style="text-align: center; color: #999; font-size: 12px;">Received: ${new Date().toLocaleString()}</p>
            </div>
          </div>
        `;
        break;

      case 'contact':
        subject = `📬 New Contact Message - ${data.subject}`;
        html = `
          <div style="font-family: Arial, sans-serif; padding: 20px; background: #f4f4f4;">
            <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px;">
              <h2 style="color: #667eea; text-align: center;">New Contact Message</h2>
              <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                <tr><td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Name</strong></td><td style="padding: 10px; border-bottom: 1px solid #eee;">${data.name}</td></tr>
                <tr><td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Email</strong></td><td style="padding: 10px; border-bottom: 1px solid #eee;">${data.email}</td></tr>
                ${data.phone ? `<tr><td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Phone</strong></td><td style="padding: 10px; border-bottom: 1px solid #eee;">${data.phone}</td></tr>` : ''}
                <tr><td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Subject</strong></td><td style="padding: 10px; border-bottom: 1px solid #eee;">${data.subject}</td></tr>
                <tr><td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Message</strong></td><td style="padding: 10px; border-bottom: 1px solid #eee;">${data.message}</td></tr>
              </table>
              <p style="text-align: center; color: #999; font-size: 12px;">Received: ${new Date().toLocaleString()}</p>
            </div>
          </div>
        `;
        break;

      default:
        return;
    }

    const msg = {
      to: adminEmail,
      from: { email: fromEmail, name: fromName },
      subject,
      html,
      text: subject // Fallback plain text
    };

    await sgMail.send(msg);
    console.log(`✅ Email sent to admin: ${subject}`);
    return true;

  } catch (error) {
    console.error('❌ Failed to send admin email:', error.message);
    if (error.response) {
      console.error('SendGrid error body:', error.response.body);
    }
    return false;
  }
};

module.exports = { sendAdminNotification };