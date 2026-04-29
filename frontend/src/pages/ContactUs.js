import React, { useState } from 'react';
import { toast } from 'react-toastify';
import './ContactUs.css';

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success('Thank you for your message! We will get back to you soon.');
    setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
  };

  return (
    <div className="contact-page">
      <div className="page-header">
        <h1>Contact Us</h1>
        <p>We'd love to hear from you</p>
      </div>

      <div className="container">
        <div className="contact-grid">
          <div className="contact-info">
            <h2>Get In Touch</h2>
            <div className="info-item">
              <h3>Email</h3>
              <p>charmenarnext@gmail.com</p>
            </div>
            <div className="info-item">
              <h3>Phone</h3>
              <p>+1 (555) 123-4567</p>
            </div>
            <div className="info-item">
              <h3>Address</h3>
              <p>123 Luxury Lane<br />Premium City, PC 12345</p>
            </div>
            <div className="info-item">
              <h3>Business Hours</h3>
              <p>Monday - Saturday: 9:00 AM - 8:00 PM<br />Sunday: 10:00 AM - 6:00 PM</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="contact-form">
            <h2>Send Us a Message</h2>
            <div className="form-group">
              <label>Your Name</label>
              <input 
                type="text" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required 
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input 
                type="email" 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required 
              />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input 
                type="tel" 
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Subject</label>
              <input 
                type="text" 
                value={formData.subject}
                onChange={(e) => setFormData({...formData, subject: e.target.value})}
                required 
              />
            </div>
            <div className="form-group">
              <label>Message</label>
              <textarea 
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                rows="5"
                required
              />
            </div>
            <button type="submit" className="premium-btn">Send Message</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;