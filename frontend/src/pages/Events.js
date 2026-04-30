import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import axios from 'axios';
import { FiCalendar, FiUsers, FiMapPin, FiClock, FiAward, FiStar, FiHeart } from 'react-icons/fi';
import './Events.css';

const Events = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    eventType: 'Wedding',
    eventName: '',
    eventDate: '',
    eventTime: '',
    venue: '',
    numberOfGuests: '',
    eventTheme: '',
    specialRequirements: '',
    budget: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast.info('Please login to submit your event request');
      navigate('/login');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post('${config.API_URL}/events/submit', {
        eventType: formData.eventType,
        eventName: formData.eventName,
        eventDate: formData.eventDate,
        eventTime: formData.eventTime,
        venue: formData.venue,
        numberOfGuests: parseInt(formData.numberOfGuests),
        menuPreferences: formData.eventTheme,
        specialRequests: formData.specialRequirements,
        budget: formData.budget
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Event request submitted successfully! We will contact you soon.');
      setFormData({
        eventType: 'Wedding',
        eventName: '',
        eventDate: '',
        eventTime: '',
        venue: '',
        numberOfGuests: '',
        eventTheme: '',
        specialRequirements: '',
        budget: ''
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit request');
    }
  };

  return (
    <div className="events-page">
      {/* Hero Section */}
      <section className="events-hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1>Event Planning & Management</h1>
          <p>Creating unforgettable experiences from start to finish</p>
        </div>
      </section>

      {/* Event Types */}
      <section className="event-types">
        <div className="container">
          <div className="section-header">
            <h2>We Specialize In</h2>
            <p>Every event is unique, and so is our approach</p>
          </div>

          <div className="types-grid">
            <div className="type-card">
              <div className="type-image-wrapper">
                <img src="https://images.unsplash.com/photo-1519741497674-611481863552?w=600&h=400&fit=crop" alt="Wedding" />
              </div>
              <div className="type-content">
                <h3>Weddings</h3>
                <p>From intimate ceremonies to grand celebrations, we make your dream wedding a reality</p>
              </div>
            </div>

            <div className="type-card">
              <div className="type-image-wrapper">
                <img src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&h=400&fit=crop" alt="Corporate" />
              </div>
              <div className="type-content">
                <h3>Corporate Events</h3>
                <p>Conferences, galas, and team-building events executed with professionalism</p>
              </div>
            </div>

            <div className="type-card">
              <div className="type-image-wrapper">
                <img src="https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=600&h=400&fit=crop" alt="Private" />
              </div>
              <div className="type-content">
                <h3>Private Celebrations</h3>
                <p>Birthdays, anniversaries, and milestone events tailored to your vision</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="event-features">
        <div className="container">
          <div className="section-header">
            <h2>Our Event Services Include</h2>
            <p>Comprehensive planning and execution for flawless events</p>
          </div>

          <div className="features-grid-new">
            <div className="feature-box">
              <div className="feature-box-icon"><FiCalendar /></div>
              <h3>Complete Event Planning</h3>
              <p>From concept to execution, we handle every detail</p>
            </div>
            <div className="feature-box">
              <div className="feature-box-icon"><FiUsers /></div>
              <h3>Vendor Coordination</h3>
              <p>Trusted network of florists, decorators, and entertainers</p>
            </div>
            <div className="feature-box">
              <div className="feature-box-icon"><FiMapPin /></div>
              <h3>Venue Selection</h3>
              <p>Help finding the perfect location for your event</p>
            </div>
            <div className="feature-box">
              <div className="feature-box-icon"><FiClock /></div>
              <h3>Day-of Coordination</h3>
              <p>Seamless execution so you can enjoy your event</p>
            </div>
            <div className="feature-box">
              <div className="feature-box-icon"><FiAward /></div>
              <h3>Premium Quality</h3>
              <p>Only the best vendors and services for your special day</p>
            </div>
            <div className="feature-box">
              <div className="feature-box-icon"><FiHeart /></div>
              <h3>Personalized Service</h3>
              <p>Custom solutions tailored to your unique vision</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="event-stats">
        <div className="container">
          <div className="stats-grid-events">
            <div className="stat-box">
              <h3>300+</h3>
              <p>Events Planned</p>
            </div>
            <div className="stat-box">
              <h3>98%</h3>
              <p>Client Satisfaction</p>
            </div>
            <div className="stat-box">
              <h3>15+</h3>
              <p>Expert Planners</p>
            </div>
            <div className="stat-box">
              <h3>100%</h3>
              <p>On-Time Delivery</p>
            </div>
          </div>
        </div>
      </section>

      {/* Booking Form */}
      <section className="event-booking">
        <div className="container">
          <div className="form-container">
            <h2>Plan Your Event With Us</h2>
            <form onSubmit={handleSubmit} className="event-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Event Type *</label>
                  <select name="eventType" value={formData.eventType} onChange={handleChange} required>
                    <option>Wedding</option>
                    <option>Corporate</option>
                    <option>Birthday</option>
                    <option>Anniversary</option>
                    <option>Baby Shower</option>
                    <option>Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Event Name *</label>
                  <input type="text" name="eventName" value={formData.eventName} onChange={handleChange} required placeholder="e.g., Annual Gala 2026" />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Event Date *</label>
                  <input type="date" name="eventDate" value={formData.eventDate} onChange={handleChange} required />
                </div>

                <div className="form-group">
                  <label>Event Time *</label>
                  <input type="time" name="eventTime" value={formData.eventTime} onChange={handleChange} required />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Venue/Location *</label>
                  <input type="text" name="venue" value={formData.venue} onChange={handleChange} required placeholder="Venue name or address" />
                </div>

                <div className="form-group">
                  <label>Number of Guests *</label>
                  <input type="number" name="numberOfGuests" value={formData.numberOfGuests} onChange={handleChange} min="1" required placeholder="Expected attendees" />
                </div>
              </div>

              <div className="form-group">
                <label>Budget Range *</label>
                <select name="budget" value={formData.budget} onChange={handleChange} required>
                  <option value="">Select Budget</option>
                  <option>$1,000 - $5,000</option>
                  <option>$5,000 - $10,000</option>
                  <option>$10,000 - $25,000</option>
                  <option>$25,000 - $50,000</option>
                  <option>$50,000+</option>
                </select>
              </div>

              <div className="form-group">
                <label>Event Theme/Style</label>
                <input type="text" name="eventTheme" value={formData.eventTheme} onChange={handleChange} placeholder="e.g., Rustic, Modern, Vintage, Beach" />
              </div>

              <div className="form-group">
                <label>Special Requirements</label>
                <textarea name="specialRequirements" value={formData.specialRequirements} onChange={handleChange} rows="4" placeholder="Tell us about your vision, special requests, or any specific needs" />
              </div>

              <button type="submit" className="premium-btn">Submit Event Request</button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Events;