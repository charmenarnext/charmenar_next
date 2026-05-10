import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FiPhone, FiLock, FiLogIn } from 'react-icons/fi';
import './Login.css';

const Login = () => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!phone || !password) {
      toast.error('Please enter both phone number and password');
      return;
    }

    // Validate phone (Indian format)
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
      toast.error('Please enter a valid 10-digit Indian phone number');
      return;
    }

    setLoading(true);
    
    try {
      console.log('🔐 Attempting login...');
      
      const response = await login(phone, password);
      
      console.log('✅ Login successful:', response);
      
      toast.success(`Welcome back, ${response.user.name}!`);
      
      setTimeout(() => {
        navigate('/');
        window.location.reload();
      }, 1000);
      
    } catch (error) {
      console.error('❌ Login failed:', error);
      toast.error(error.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <h1>Welcome <span className="gradient-text">Back</span></h1>
            <p>Login to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {/* Phone */}
            <div className="form-group">
              <label htmlFor="phone">
                <FiPhone /> Phone Number <span className="required">*</span>
              </label>
              <input
                type="tel"
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter 10-digit mobile number"
                required
                disabled={loading}
                className="input-premium"
                maxLength="10"
                pattern="[6-9]\d{9}"
              />
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  disabled={loading}
                  className="input-premium"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="form-options">
              <Link to="/forgot-password" className="forgot-password">
                Forgot Password?
              </Link>
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
                  Logging in...
                </>
              ) : (
                <>
                  <FiLogIn /> Login
                </>
              )}
            </button>

            {/* Register Link */}
            <div className="login-footer">
              <p>Don't have an account? <Link to="/register">Register here</Link></p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;