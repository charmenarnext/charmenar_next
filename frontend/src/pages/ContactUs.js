import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { FiMail, FiPhone, FiMapPin, FiClock, FiSend, FiFacebook, FiTwitter, FiInstagram, FiLinkedin } from 'react-icons/fi';
import './ContactUs.css';

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('https://charmenar-next-api.onrender.com/api/contact/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      } else {
        toast.error(data.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('Contact submit error:', error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-page">
      {/* Page Header */}
      <section className="page-header">
        <div className="glow-orb glow-orb-1"></div>
        <div className="glow-orb glow-orb-2"></div>
        
        <div className="container">
          <h1>
            Contact <span className="gradient-text">Us</span>
          </h1>
          <div className="divider"></div>
          <p>We'd love to hear from you! Get in touch with us for inquiries, bookings, or any questions.</p>
        </div>
      </section>

      {/* Contact Container */}
      <div className="contact-container">
        <div className="contact-grid">
          {/* Contact Info */}
          <div className="contact-info">
            <div className="contact-card">
              <div className="contact-icon">
                <FiMapPin />
              </div>
              <div className="contact-details">
                <h3>Visit Us</h3>
                <p>
                  Plot No.533, K7, Vipul Garden Road,<br />
                  Bhubaneswar,Odisha 751003<br />
                  India
                </p>
              </div>
            </div>

            <div className="contact-card">
              <div className="contact-icon">
                <FiPhone />
              </div>
              <div className="contact-details">
                <h3>Call Us</h3>
                <p>
                  <a href="tel:+9124470079">+9124470079</a><br />
                  Mon - Sat: 9:00 AM - 8:00 PM
                </p>
              </div>
            </div>

            <div className="contact-card">
              <div className="contact-icon">
                <FiMail />
              </div>
              <div className="contact-details">
                <h3>Email Us</h3>
                <p>
                  <a href="mailto:charmenarnext@gmail.com">charmenarnext@gmail.com</a><br />
                </p>
              </div>
            </div>

            <div className="contact-card">
              <div className="contact-icon">
                <FiClock />
              </div>
              <div className="contact-details">
                <h3>Business Hours</h3>
                <p>
                  Monday - Saturday: 9:00 AM - 8:00 PM<br />
                  Sunday: 10:00 AM - 6:00 PM<br />
                  Emergency support available 24/7
                </p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="contact-form-wrapper">
            <h2>Send Us a <span className="gradient-text">Message</span></h2>
            <p className="form-subtitle">Fill out the form below and we'll get back to you within 24 hours</p>

            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">
                    Full Name <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">
                    Email Address <span className="required">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="phone">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter your phone number"
                    disabled={loading}
                    pattern="[0-9]{10}"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="subject">
                    Subject <span className="required">*</span>
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  >
                    <option value="">Select a subject</option>
                    <option value="catering">Catering Inquiry</option>
                    <option value="events">Event Booking</option>
                    <option value="general">General Inquiry</option>
                    <option value="feedback">Feedback</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="message">
                  Message <span className="required">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us about your event or inquiry..."
                  required
                  disabled={loading}
                  rows="5"
                ></textarea>
              </div>

              <button 
                type="submit" 
                className="form-submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Sending...
                  </>
                ) : (
                  <>
                    <FiSend /> Send Message
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Map Section */}
        <section className="contact-map-section">
          <h2 className="map-title">Find Us <span className="gradient-text">Here</span></h2>
          <div className="map-container">
            <iframe
              title="Charmenar Next Location"
              src="https://maps.google.com/maps?width=600&height=400&hl=en&q=plot%20no%20533%2CK7%2Cvipul%20garden%20Road%2CBhubaneswar&t=&z=15&ie=UTF8&iwloc=B&output=embed"
              width="100%"
              height="450"
              style={{ border: 0, borderRadius: '20px' }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
          <div className="map-address">
            <FiMapPin className="map-icon" />
            <p>Plot no 533, K7,Vipul Garden Road, Bhubaneswar, Odisha 751003, India</p>
          </div>
        </section>

        {/* Social Media Section */}
        <section className="contact-social">
          <h2>Follow Us on <span className="gradient-text">Social Media</span></h2>
          <p>Stay connected for the latest updates, offers, and inspiration</p>
          
          <div className="social-links">
            <a href="https://facebook.com/charmenarnext" target="_blank" rel="noopener noreferrer" className="social-link">
              <FiFacebook />
            </a>
            <a href="https://twitter.com/charmenarnext" target="_blank" rel="noopener noreferrer" className="social-link">
              <FiTwitter />
            </a>
            <a href="https://instagram.com/charmenarnext" target="_blank" rel="noopener noreferrer" className="social-link">
              <FiInstagram />
            </a>
            <a href="https://linkedin.com/company/charmenarnext" target="_blank" rel="noopener noreferrer" className="social-link">
              <FiLinkedin />
            </a>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ContactUs;