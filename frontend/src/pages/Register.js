import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FiUser, FiMail, FiPhone, FiLock, FiUserPlus } from 'react-icons/fi';
import './Register.css';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name || !formData.email || !formData.phone || !formData.password || !formData.confirmPassword) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Validate name
    if (formData.name.trim().length < 2) {
      toast.error('Name must be at least 2 characters');
      return;
    }

    // Validate email
    if (!formData.email.includes('@') || !formData.email.includes('.')) {
      toast.error('Please enter a valid email address');
      return;
    }

    // Validate phone (Indian format)
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
      toast.error('Please enter a valid 10-digit Indian phone number');
      return;
    }

    // Validate password
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    // Validate password match
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    
    try {
      console.log('📝 Attempting registration...');
      
      const response = await register(
        formData.name,
        formData.email,
        formData.phone,
        formData.password
      );
      
      console.log('✅ Registration successful:', response);
      
      toast.success('Registration successful! Welcome aboard!');
      
      setTimeout(() => {
        navigate('/login');
      }, 1500);
      
    } catch (error) {
      console.error('❌ Registration failed:', error);
      toast.error(error.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-card">
          <div className="register-header">
            <h1>Create <span className="gradient-text">Account</span></h1>
            <p>Fill in the details below to get started</p>
          </div>

          <form onSubmit={handleSubmit} className="register-form">
            {/* Name */}
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
                className="input-premium"
              />
            </div>

            {/* Email */}
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
                placeholder="Enter your email address"
                required
                disabled={loading}
                className="input-premium"
              />
            </div>

            {/* Phone */}
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
                placeholder="Enter 10-digit mobile number"
                required
                disabled={loading}
                className="input-premium"
                maxLength="10"
                pattern="[6-9]\d{9}"
              />
              <small className="form-hint">Example: 9876543210</small>
            </div>

            {/* Password */}
            <div className="form-group">
              <label htmlFor="password">
                <FiLock /> Password <span className="required">*</span>
              </label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a password"
                  required
                  disabled={loading}
                  className="input-premium"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? '👁️' : '👁️🗨️'}
                </button>
              </div>
              <small className="form-hint">Minimum 6 characters</small>
            </div>

            {/* Confirm Password */}
            <div className="form-group">
              <label htmlFor="confirmPassword">
                <FiLock /> Confirm Password <span className="required">*</span>
              </label>
              <div className="password-input-wrapper">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter your password"
                  required
                  disabled={loading}
                  className="input-premium"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              className="submit-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Creating Account...
                </>
              ) : (
                <>
                  <FiUserPlus /> Create Account
                </>
              )}
            </button>

            {/* Login Link */}
            <div className="register-footer">
              <p>Already have an account? <Link to="/login">Login here</Link></p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;