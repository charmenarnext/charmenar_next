import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import axios from 'axios';
import { FiCoffee, FiAward, FiHeart, FiStar, FiCheck, FiUsers, FiClock, FiMapPin, FiShield, FiTrendingUp } from 'react-icons/fi';
import './Catering.css';

const Catering = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    cateringType: 'Wedding',
    eventName: '',
    eventDate: '',
    numberOfGuests: '',
    menuType: 'Vegetarian',
    specialDietary: '',
    venue: '',
    budget: '',
    additionalNotes: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast.info('Please login to submit your catering request');
      navigate('/login');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5010/api/events/submit', {
        eventType: 'Catering',
        eventName: formData.eventName,
        eventDate: formData.eventDate,
        eventTime: '12:00',
        venue: formData.venue,
        numberOfGuests: parseInt(formData.numberOfGuests),
        menuPreferences: `${formData.menuType} - ${formData.specialDietary}`,
        specialRequests: formData.additionalNotes,
        budget: formData.budget
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Catering request submitted successfully! We will contact you soon.');
      setFormData({
        cateringType: 'Wedding',
        eventName: '',
        eventDate: '',
        numberOfGuests: '',
        menuType: 'Vegetarian',
        specialDietary: '',
        venue: '',
        budget: '',
        additionalNotes: ''
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit request');
    }
  };

  return (
    <div className="catering-page">
      {/* Hero Section */}
      <section className="catering-hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1>Premium Catering Services</h1>
          <p>Exquisite culinary experiences tailored to your taste</p>
        </div>
      </section>

      {/* Services Section */}
      <section className="catering-services">
        <div className="container">
          <div className="section-header">
            <h2>Our Catering Specialties</h2>
            <p>From intimate gatherings to grand celebrations</p>
          </div>

          <div className="services-grid">
            <div className="service-card">
              <div className="service-icon"><FiCoffee /></div>
              <h3>Wedding Catering</h3>
              <p>Make your special day unforgettable with our gourmet wedding menus</p>
            </div>
            <div className="service-card">
              <div className="service-icon"><FiUsers /></div>
              <h3>Corporate Events</h3>
              <p>Impress clients and team with professional catering services</p>
            </div>
            <div className="service-card">
              <div className="service-icon"><FiAward /></div>
              <h3>Private Parties</h3>
              <p>Celebrate milestones with customized menu options</p>
            </div>
            <div className="service-card">
              <div className="service-icon"><FiHeart /></div>
              <h3>Special Occasions</h3>
              <p>Birthdays, anniversaries, and all life's celebrations</p>
            </div>
          </div>
        </div>
      </section>

      {/* ✅ REDESIGNED: Why Choose Us Section */}
      <section className="why-choose-section">
        <div className="container">
          <div className="section-header">
            <h2>Why Choose Charmenar Catering</h2>
            <p>Experience the difference that makes us the preferred choice</p>
          </div>

          <div className="why-choose-grid">
            <div className="why-card">
              <div className="why-card-icon">
                <FiCheck />
              </div>
              <h3>Premium Ingredients</h3>
              <p>Only the freshest, locally-sourced ingredients from trusted suppliers</p>
              <ul className="why-list">
                <li>✓ Organic produce</li>
                <li>✓ Farm-fresh dairy</li>
                <li>✓ Premium meats & seafood</li>
              </ul>
            </div>

            <div className="why-card featured">
              <div className="featured-badge">Most Popular</div>
              <div className="why-card-icon">
                <FiStar />
              </div>
              <h3>Expert Chefs</h3>
              <p>World-class culinary professionals with years of experience</p>
              <ul className="why-list">
                <li>✓ Certified master chefs</li>
                <li>✓ 10+ years experience</li>
                <li>✓ International cuisine expertise</li>
              </ul>
            </div>

            <div className="why-card">
              <div className="why-card-icon">
                <FiClock />
              </div>
              <h3>On-Time Service</h3>
              <p>Punctual delivery and setup guaranteed for your peace of mind</p>
              <ul className="why-list">
                <li>✓ Early setup available</li>
                <li>✓ Timely food service</li>
                <li>✓ Flexible scheduling</li>
              </ul>
            </div>

            <div className="why-card">
              <div className="why-card-icon">
                <FiMapPin />
              </div>
              <h3>Flexible Venues</h3>
              <p>We cater at your location or recommend our partner venues</p>
              <ul className="why-list">
                <li>✓ Home catering</li>
                <li>✓ Event halls</li>
                <li>✓ Outdoor venues</li>
              </ul>
            </div>

            <div className="why-card">
              <div className="why-card-icon">
                <FiShield />
              </div>
              <h3>Hygiene Certified</h3>
              <p>Food safety and hygiene standards you can trust completely</p>
              <ul className="why-list">
                <li>✓ FSSAI certified</li>
                <li>✓ Regular health checks</li>
                <li>✓ Sanitized equipment</li>
              </ul>
            </div>

            <div className="why-card">
              <div className="why-card-icon">
                <FiTrendingUp />
              </div>
              <h3>Best Value</h3>
              <p>Premium quality catering at competitive and transparent pricing</p>
              <ul className="why-list">
                <li>✓ No hidden charges</li>
                <li>✓ Customizable packages</li>
                <li>✓ Budget-friendly options</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Menu Preview */}
      <section className="menu-preview">
        <div className="container">
          <div className="section-header">
            <h2>Menu Options</h2>
            <p>Choose from our diverse culinary offerings</p>
          </div>

          <div className="menu-grid">
            <div className="menu-item">
              <div className="menu-emoji">🥗</div>
              <h3>Vegetarian Delights</h3>
              <p>Fresh, organic vegetarian dishes crafted with seasonal ingredients</p>
            </div>
            <div className="menu-item">
              <div className="menu-emoji">🍖</div>
              <h3>Premium Non-Vegetarian</h3>
              <p>Exquisite meat and seafood selections prepared to perfection</p>
            </div>
            <div className="menu-item">
              <div className="menu-emoji">🌿</div>
              <h3>Vegan Options</h3>
              <p>Plant-based cuisine that doesn't compromise on flavor</p>
            </div>
            <div className="menu-item">
              <div className="menu-emoji">🍰</div>
              <h3>Dessert Bar</h3>
              <p>Artisan desserts and custom cakes for any occasion</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="catering-stats">
        <div className="container">
          <div className="stats-grid-new">
            <div className="stat-item">
              <h3>500+</h3>
              <p>Events Catered</p>
            </div>
            <div className="stat-item">
              <h3>50K+</h3>
              <p>Happy Guests</p>
            </div>
            <div className="stat-item">
              <h3>10+</h3>
              <p>Years Experience</p>
            </div>
            <div className="stat-item">
              <h3>100%</h3>
              <p>Satisfaction Rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* Booking Form */}
      <section className="catering-booking">
        <div className="container">
          <div className="form-container">
            <h2>Request Catering Services</h2>
            <form onSubmit={handleSubmit} className="catering-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Event Type *</label>
                  <select name="cateringType" value={formData.cateringType} onChange={handleChange} required>
                    <option>Wedding</option>
                    <option>Corporate</option>
                    <option>Birthday</option>
                    <option>Anniversary</option>
                    <option>Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Event Name *</label>
                  <input 
                    type="text" 
                    name="eventName" 
                    value={formData.eventName} 
                    onChange={handleChange} 
                    required 
                    placeholder="e.g., Smith Wedding Reception" 
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Event Date *</label>
                  <input 
                    type="date" 
                    name="eventDate" 
                    value={formData.eventDate} 
                    onChange={handleChange} 
                    required 
                  />
                </div>

                <div className="form-group">
                  <label>Number of Guests *</label>
                  <input 
                    type="number" 
                    name="numberOfGuests" 
                    value={formData.numberOfGuests} 
                    onChange={handleChange} 
                    min="10" 
                    required 
                    placeholder="Minimum 10 guests" 
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Menu Type *</label>
                  <select name="menuType" value={formData.menuType} onChange={handleChange} required>
                    <option>Vegetarian</option>
                    <option>Non-Vegetarian</option>
                    <option>Vegan</option>
                    <option>Mixed</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Budget Range *</label>
                  <select name="budget" value={formData.budget} onChange={handleChange} required>
                    <option value="">Select Budget</option>
                    <option>$1,000 - $5,000</option>
                    <option>$5,000 - $10,000</option>
                    <option>$10,000 - $25,000</option>
                    <option>$25,000+</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Venue/Location *</label>
                <input 
                  type="text" 
                  name="venue" 
                  value={formData.venue} 
                  onChange={handleChange} 
                  required 
                  placeholder="Event location or venue name" 
                />
              </div>

              <div className="form-group">
                <label>Special Dietary Requirements</label>
                <input 
                  type="text" 
                  name="specialDietary" 
                  value={formData.specialDietary} 
                  onChange={handleChange} 
                  placeholder="Allergies, restrictions, preferences" 
                />
              </div>

              <div className="form-group">
                <label>Additional Notes</label>
                <textarea 
                  name="additionalNotes" 
                  value={formData.additionalNotes} 
                  onChange={handleChange} 
                  rows="4" 
                  placeholder="Tell us more about your event, theme, or specific requirements" 
                />
              </div>

              <button type="submit" className="premium-btn">Submit Catering Request</button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Catering;