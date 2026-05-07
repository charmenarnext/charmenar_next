import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { FiPhone, FiMail, FiMapPin, FiClock, FiSend, FiFacebook, FiTwitter, FiInstagram, FiLinkedin } from 'react-icons/fi';
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
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Message sent successfully! We will contact you soon.');
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (error) {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-page">
      {/* Page Header */}
      <section className="page-header">
        <div className="container">
          <h1>Contact <span className="gradient-text">Us</span></h1>
          <p>Get in touch with us for catering inquiries, event bookings, or general questions.</p>
        </div>
      </section>

      {/* Contact Content */}
      <section className="contact-content">
        <div className="container">
          <div className="contact-grid">
            
            {/* Contact Info - UPDATED */}
            <div className="contact-info">
              <h3>Get in Touch</h3>
              
              <div className="info-item">
                <div className="info-icon">
                  <FiPhone />
                </div>
                <div className="info-text">
                  <h4>Call Us</h4>
                  <p>
                    <a href="tel:+9124470079" className="contact-link">+91 24470079</a>
                  </p>
                </div>
              </div>

              <div className="info-item">
                <div className="info-icon">
                  <FiMail />
                </div>
                <div className="info-text">
                  <h4>Email Us</h4>
                  <p>
                    <a href="mailto:charmenarnext@gmail.com" className="contact-link">charmenarnext@gmail.com</a>
                  </p>
                </div>
              </div>

              <div className="info-item">
                <div className="info-icon">
                  <FiMapPin />
                </div>
                <div className="info-text">
                  <h4>Visit Us</h4>
                  <p className="contact-address">
                    Plot No.533, K7,<br /> Vipul Garden Road,<br />
                    Bhubaneswar 751003
                  </p>
                </div>
              </div>

              <div className="info-item">
                <div className="info-icon">
                  <FiClock />
                </div>
                <div className="info-text">
                  <h4>Working Hours</h4>
                  <p>
                    Mon - Sat: 9:00 AM - 8:00 PM<br />
                    Sunday: 10:00 AM - 6:00 PM
                  </p>
                </div>
              </div>

              {/* Social Links */}
              <div className="social-links">
                <a href="https://facebook.com" className="social-link" target="_blank" rel="noopener noreferrer"><FiFacebook /></a>
                <a href="https://twitter.com" className="social-link" target="_blank" rel="noopener noreferrer"><FiTwitter /></a>
                <a href="https://instagram.com" className="social-link" target="_blank" rel="noopener noreferrer"><FiInstagram /></a>
                <a href="https://linkedin.com" className="social-link" target="_blank" rel="noopener noreferrer"><FiLinkedin /></a>
              </div>
            </div>

            {/* Contact Form */}
            <div className="contact-form-container">
              <h3>Send us a Message</h3>
              <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name">Your Name *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your name"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="email">Email Address *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="phone">Phone Number</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Enter your phone"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="subject">Subject *</label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="What is this about?"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="message">Message *</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us about your event or inquiry..."
                    rows="5"
                    required
                  ></textarea>
                </div>

                <button type="submit" className="form-submit" disabled={loading}>
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
        </div>
      </section>

      {/* Map Section */}
      <section className="map-section">
        <div className="container">
          <div className="map-container">
            <iframe
              title="Charmenar Next Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3720.5!2d85.8245!3d20.2961!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjDCsDE3JzQ2LjAiTiA4NcKwNDknMjguMCJF!5e0!3m2!1sen!2sin!4v1234567890"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactUs;