import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiMail, FiArrowLeft } from 'react-icons/fi';
import './ForgotPassword.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    setLoading(true);
    
    try {
      console.log('📧 Requesting password reset...');
      
      const response = await fetch('https://charmenar-next-api.onrender.com/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      const data = await response.json();
      
      if (data.success) {
        console.log('✅ Reset link sent');
        setSent(true);
        toast.success('Reset link sent to your email!');
      } else {
        throw new Error(data.message || 'Failed to send reset link');
      }
      
    } catch (error) {
      console.error('❌ Reset request failed:', error);
      toast.error(error.message || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="forgot-password-page">
        <div className="forgot-password-container">
          <div className="forgot-password-card">
            <div className="success-icon">✅</div>
            <h1>Check Your <span className="gradient-text">Email</span></h1>
            <p>We've sent a password reset link to <strong>{email}</strong></p>
            <div className="success-info">
              <p>📧 Check your inbox (and spam folder)</p>
              <p>⏰ Link expires in 1 hour</p>
              <p>🔒 Didn't request this? Ignore this email</p>
            </div>
            <button 
              className="submit-btn"
              onClick={() => navigate('/login')}
            >
              <FiArrowLeft /> Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="forgot-password-page">
      <div className="forgot-password-container">
        <div className="forgot-password-card">
          <div className="forgot-password-header">
            <h1>Reset <span className="gradient-text">Password</span></h1>
            <p>Enter your email to receive a reset link</p>
          </div>

          <form onSubmit={handleSubmit} className="forgot-password-form">
            <div className="form-group">
              <label htmlFor="email">
                <FiMail /> Email Address <span className="required">*</span>
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your registered email"
                required
                disabled={loading}
                className="input-premium"
              />
            </div>

            <button 
              type="submit" 
              className="submit-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Sending...
                </>
              ) : (
                <>
                  Send Reset Link
                </>
              )}
            </button>

            <div className="forgot-password-footer">
              <Link to="/login" className="back-link">
                <FiArrowLeft /> Back to Login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;