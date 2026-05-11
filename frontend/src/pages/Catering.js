import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { FiCalendar, FiUsers, FiMail, FiPhone, FiUser, FiMessageSquare, FiSend } from 'react-icons/fi';
import './Catering.css';

const Catering = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    eventType: '',
    eventDate: '',
    guestCount: '',
    services: '',
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
      const response = await fetch('https://charmenar-next-api.onrender.com/api/catering/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
        setFormData({
          name: '',
          email: '',
          phone: '',
          eventType: '',
          eventDate: '',
          guestCount: '',
          services: '',
          message: ''
        });
      } else {
        toast.error(data.message || 'Failed to submit inquiry');
      }
    } catch (error) {
      console.error('Catering submit error:', error);
      toast.error('Failed to submit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="catering-page">
      {/* Page Header */}
      <section className="page-header">
        <div className="glow-orb glow-orb-1"></div>
        <div className="glow-orb glow-orb-2"></div>
        <div className="glow-orb glow-orb-3"></div>
        
        <div className="container">
          <h1>
            Our <span className="gradient-text">Catering</span>
          </h1>
          <div className="divider"></div>
          <p>Delicious food crafted with passion for your special occasions</p>
        </div>
      </section>

      {/* Menu Section */}
      <section className="menu-section">
        <div className="container">
          <h2>Our <span className="gradient-text">Menu Packages</span></h2>
          
          <div className="menu-grid">
            <div className="menu-item">
              <img 
                src="https://images.unsplash.com/photo-1555244162-803834f70033?w=600" 
                alt="Basic Package" 
                className="menu-item-image"
              />
              <div className="menu-item-content">
                <h3 className="menu-item-title">Basic Package</h3>
                <p className="menu-item-description">
                  Perfect for small gatherings and intimate celebrations
                </p>
                <ul className="menu-items-list">
                  <li>✓ Starter (2 varieties)</li>
                  <li>✓ Main Course (4 varieties)</li>
                  <li>✓ Dessert (2 varieties)</li>
                  <li>✓ Basic Setup</li>
                </ul>
                <p className="menu-item-price">₹500 <span>per person</span></p>
              </div>
            </div>

            <div className="menu-item featured">
              <div className="featured-badge">Most Popular</div>
              <img 
                src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600" 
                alt="Premium Package" 
                className="menu-item-image"
              />
              <div className="menu-item-content">
                <h3 className="menu-item-title">Premium Package</h3>
                <p className="menu-item-description">
                  Ideal for medium-sized events and celebrations
                </p>
                <ul className="menu-items-list">
                  <li>✓ Starter (4 varieties)</li>
                  <li>✓ Main Course (6 varieties)</li>
                  <li>✓ Dessert (3 varieties)</li>
                  <li>✓ Beverages</li>
                  <li>✓ Premium Setup & Decor</li>
                </ul>
                <p className="menu-item-price">₹1,000 <span>per person</span></p>
              </div>
            </div>

            <div className="menu-item">
              <img 
                src="https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=600" 
                alt="Royal Package" 
                className="menu-item-image"
              />
              <div className="menu-item-content">
                <h3 className="menu-item-title">Royal Package</h3>
                <p className="menu-item-description">
                  For grand celebrations and luxury events
                </p>
                <ul className="menu-items-list">
                  <li>✓ Starter (6 varieties)</li>
                  <li>✓ Main Course (8 varieties)</li>
                  <li>✓ Dessert (5 varieties)</li>
                  <li>✓ Premium Beverages</li>
                  <li>✓ Special Live Counters</li>
                  <li>✓ Luxury Setup & Decor</li>
                </ul>
                <p className="menu-item-price">₹2,000 <span>per person</span></p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Catering Form Section */}
      <section className="catering-form-section">
        <div className="container">
          <div className="form-container">
            <h2>
              Book Your <span className="gradient-text">Catering</span>
            </h2>
            <p className="form-subtitle">Fill in the details below and we'll get back to you within 24 hours</p>

            <form onSubmit={handleSubmit} className="catering-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">
                    <FiUser /> Full Name <span className="required">*</span>
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
                    <FiMail /> Email Address <span className="required">*</span>
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
                    <FiPhone /> Phone Number <span className="required">*</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter your phone number"
                    required
                    disabled={loading}
                    pattern="[0-9]{10}"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="eventType">
                    <FiCalendar /> Event Type <span className="required">*</span>
                  </label>
                  <select
                    id="eventType"
                    name="eventType"
                    value={formData.eventType}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  >
                    <option value="">Select Event Type</option>
                    <option value="wedding">Wedding</option>
                    <option value="corporate">Corporate Event</option>
                    <option value="birthday">Birthday Party</option>
                    <option value="anniversary">Anniversary</option>
                    <option value="engagement">Engagement</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="eventDate">
                    <FiCalendar /> Event Date <span className="required">*</span>
                  </label>
                  <input
                    type="date"
                    id="eventDate"
                    name="eventDate"
                    value={formData.eventDate}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="guestCount">
                    <FiUsers /> Guest Count <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    id="guestCount"
                    name="guestCount"
                    value={formData.guestCount}
                    onChange={handleChange}
                    placeholder="Approximate number of guests"
                    required
                    disabled={loading}
                    min="1"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="services">
                  Services Required
                </label>
                <select
                  id="services"
                  name="services"
                  value={formData.services}
                  onChange={handleChange}
                  disabled={loading}
                >
                  <option value="">Select Services</option>
                  <option value="catering-only">Catering Only</option>
                  <option value="catering-decor">Catering + Decor</option>
                  <option value="full-service">Full Service (Catering + Decor + Planning)</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="message">
                  <FiMessageSquare /> Additional Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us more about your event, special requirements, menu preferences, etc."
                  rows="4"
                  disabled={loading}
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
                    Submitting...
                  </>
                ) : (
                  <>
                    <FiSend /> Submit Inquiry
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Catering;