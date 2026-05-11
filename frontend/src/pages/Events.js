import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { FiCalendar, FiMapPin, FiUsers, FiDollarSign, FiMail, FiPhone, FiUser, FiMessageSquare, FiSend } from 'react-icons/fi';
import './Events.css';

const Events = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    eventType: '',
    eventDate: '',
    venue: '',
    guestCount: '',
    budget: '',
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
      const response = await fetch('https://charmenar-next-api.onrender.com/api/events/submit', {
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
          venue: '',
          guestCount: '',
          budget: '',
          services: '',
          message: ''
        });
      } else {
        toast.error(data.message || 'Failed to submit booking');
      }
    } catch (error) {
      console.error('Events submit error:', error);
      toast.error('Failed to submit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="events-page">
      {/* Page Header */}
      <section className="page-header">
        <div className="container">
          <h1>
            Our <span className="gradient-text">Events</span>
          </h1>
          <p>Creating unforgettable moments for every occasion</p>
        </div>
      </section>

      {/* Events Grid */}
      <section className="events-section">
        <div className="container">
          <h2>
            Event <span className="gradient-text">Packages</span>
          </h2>
          
          <div className="events-grid">
            <div className="event-card">
              <img 
                src="https://images.unsplash.com/photo-1519741497674-611481863552?w=600" 
                alt="Wedding" 
                className="event-image"
              />
              <div className="event-content">
                <span className="event-category">Wedding</span>
                <h3 className="event-title">Grand Wedding Package</h3>
                <p className="event-description">
                  Complete wedding planning and execution with premium catering, decor, and coordination
                </p>
                <div className="event-details">
                  <div className="event-detail">
                    <FiUsers /> 100-500 guests
                  </div>
                  <div className="event-detail">
                    <FiCalendar /> Full day event
                  </div>
                </div>
                <p className="event-price">₹50,000 <span>onwards</span></p>
              </div>
            </div>

            <div className="event-card">
              <img 
                src="https://images.unsplash.com/photo-1511578314322-379afb476865?w=600" 
                alt="Corporate" 
                className="event-image"
              />
              <div className="event-content">
                <span className="event-category">Corporate</span>
                <h3 className="event-title">Corporate Event</h3>
                <p className="event-description">
                  Professional corporate event management for conferences, seminars, and team building
                </p>
                <div className="event-details">
                  <div className="event-detail">
                    <FiUsers /> 50-1000 guests
                  </div>
                  <div className="event-detail">
                    <FiCalendar /> Half/Full day
                  </div>
                </div>
                <p className="event-price">₹30,000 <span>onwards</span></p>
              </div>
            </div>

            <div className="event-card">
              <img 
                src="https://images.unsplash.com/photo-1530103862676-de3c9da59af7?w=600" 
                alt="Birthday" 
                className="event-image"
              />
              <div className="event-content">
                <span className="event-category">Birthday</span>
                <h3 className="event-title">Birthday Celebration</h3>
                <p className="event-description">
                  Memorable birthday party planning with theme-based decor and entertainment
                </p>
                <div className="event-details">
                  <div className="event-detail">
                    <FiUsers /> 20-200 guests
                  </div>
                  <div className="event-detail">
                    <FiCalendar /> 4-8 hours
                  </div>
                </div>
                <p className="event-price">₹15,000 <span>onwards</span></p>
              </div>
            </div>

            <div className="event-card">
              <img 
                src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600" 
                alt="Engagement" 
                className="event-image"
              />
              <div className="event-content">
                <span className="event-category">Engagement</span>
                <h3 className="event-title">Engagement Ceremony</h3>
                <p className="event-description">
                  Beautiful engagement ceremony planning with elegant decor and catering
                </p>
                <div className="event-details">
                  <div className="event-detail">
                    <FiUsers /> 50-300 guests
                  </div>
                  <div className="event-detail">
                    <FiCalendar /> Evening event
                  </div>
                </div>
                <p className="event-price">₹25,000 <span>onwards</span></p>
              </div>
            </div>

            <div className="event-card">
              <img 
                src="https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=600" 
                alt="Anniversary" 
                className="event-image"
              />
              <div className="event-content">
                <span className="event-category">Anniversary</span>
                <h3 className="event-title">Anniversary Celebration</h3>
                <p className="event-description">
                  Special anniversary celebration with romantic decor and personalized touches
                </p>
                <div className="event-details">
                  <div className="event-detail">
                    <FiUsers /> 20-150 guests
                  </div>
                  <div className="event-detail">
                    <FiCalendar /> 4-6 hours
                  </div>
                </div>
                <p className="event-price">₹20,000 <span>onwards</span></p>
              </div>
            </div>

            <div className="event-card">
              <img 
                src="https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=600" 
                alt="Social" 
                className="event-image"
              />
              <div className="event-content">
                <span className="event-category">Social</span>
                <h3 className="event-title">Social Gatherings</h3>
                <p className="event-description">
                  Family functions, reunions, and social events with customized planning
                </p>
                <div className="event-details">
                  <div className="event-detail">
                    <FiUsers /> 30-500 guests
                  </div>
                  <div className="event-detail">
                    <FiCalendar /> Flexible timing
                  </div>
                </div>
                <p className="event-price">₹10,000 <span>onwards</span></p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Event Booking Form */}
      <section className="event-form-section">
        <div className="container">
          <div className="form-container">
            <h2>
              Book Your <span className="gradient-text">Event</span>
            </h2>
            <p className="form-subtitle">Let us make your special day memorable. Fill in the details below.</p>

            <form onSubmit={handleSubmit} className="event-form">
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
                    <option value="social">Social Gathering</option>
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
                  <label htmlFor="venue">
                    <FiMapPin /> Venue/Location
                  </label>
                  <input
                    type="text"
                    id="venue"
                    name="venue"
                    value={formData.venue}
                    onChange={handleChange}
                    placeholder="Event venue or location"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="form-row">
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

                <div className="form-group">
                  <label htmlFor="budget">
                    <FiDollarSign /> Budget Range
                  </label>
                  <select
                    id="budget"
                    name="budget"
                    value={formData.budget}
                    onChange={handleChange}
                    disabled={loading}
                  >
                    <option value="">Select Budget Range</option>
                    <option value="10000-25000">₹10,000 - ₹25,000</option>
                    <option value="25000-50000">₹25,000 - ₹50,000</option>
                    <option value="50000-100000">₹50,000 - ₹1,00,000</option>
                    <option value="100000+">₹1,00,000+</option>
                  </select>
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
                  <option value="event-planning">Event Planning Only</option>
                  <option value="catering">Catering Only</option>
                  <option value="decor">Decor Only</option>
                  <option value="full-package">Full Package (Planning + Catering + Decor)</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="message">
                  <FiMessageSquare /> Additional Details
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us more about your event, theme preferences, special requirements, etc."
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
                    <FiSend /> Submit Booking Request
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

export default Events;