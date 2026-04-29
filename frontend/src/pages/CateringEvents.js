import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import axios from 'axios';
import './CateringEvents.css';

const CateringEvents = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    eventType: 'Wedding',
    eventName: '',
    eventDate: '',
    eventTime: '',
    venue: '',
    numberOfGuests: '',
    menuPreferences: '',
    specialRequests: '',
    budget: '',
    contactPerson: {
      name: '',
      phone: '',
      email: ''
    }
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
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
      await axios.post('http://localhost:5000/api/events/submit', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Event submitted successfully! We will contact you soon.');
      setFormData({
        eventType: 'Wedding',
        eventName: '',
        eventDate: '',
        eventTime: '',
        venue: '',
        numberOfGuests: '',
        menuPreferences: '',
        specialRequests: '',
        budget: '',
        contactPerson: { name: '', phone: '', email: '' }
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit event');
    }
  };

  return (
    <div className="catering-events">
      <div className="page-header">
        <h1>Catering & Events</h1>
        <p>Book our premium services for your special occasion</p>
      </div>

      <div className="container">
        <div className="form-container">
          <form onSubmit={handleSubmit} className="event-form">
            <h2>Event Details</h2>
            
            <div className="form-row">
              <div className="form-group">
                <label>Event Type *</label>
                <select name="eventType" value={formData.eventType} onChange={handleChange} required>
                  <option>Wedding</option>
                  <option>Corporate</option>
                  <option>Birthday</option>
                  <option>Anniversary</option>
                  <option>Other</option>
                </select>
              </div>

              <div className="form-group">
                <label>Event Name *</label>
                <input type="text" name="eventName" value={formData.eventName} onChange={handleChange} required />
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

            <div className="form-group">
              <label>Venue *</label>
              <input type="text" name="venue" value={formData.venue} onChange={handleChange} required />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Number of Guests *</label>
                <input type="number" name="numberOfGuests" value={formData.numberOfGuests} onChange={handleChange} min="1" required />
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
              <label>Menu Preferences *</label>
              <textarea name="menuPreferences" value={formData.menuPreferences} onChange={handleChange} rows="3" required />
            </div>

            <div className="form-group">
              <label>Special Requests</label>
              <textarea name="specialRequests" value={formData.specialRequests} onChange={handleChange} rows="3" />
            </div>

            <h3>Contact Person</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Name</label>
                <input type="text" name="contactPerson.name" value={formData.contactPerson.name} onChange={handleChange} />
              </div>

              <div className="form-group">
                <label>Phone</label>
                <input type="tel" name="contactPerson.phone" value={formData.contactPerson.phone} onChange={handleChange} />
              </div>
            </div>

            <button type="submit" className="premium-btn">
              Submit Event Request
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CateringEvents;