import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiLock } from 'react-icons/fi';
import './ResetPassword.css';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    token: searchParams.get('token') || '',
    email: searchParams.get('email') || '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (!formData.token || !formData.email) {
      toast.error('Invalid or expired reset link');
      setTimeout(() => navigate('/forgot-password'), 2000);
    }
  }, [formData.token, formData.email, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.newPassword || !formData.confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (formData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    
    try {
      console.log(' Resetting password...');
      
      const response = await fetch('https://charmenar-next-api.onrender.com/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        console.log('✅ Password reset successful');
        toast.success('Password reset successful! Please login.');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        throw new Error(data.message || 'Failed to reset password');
      }
      
    } catch (error) {
      console.error('❌ Password reset failed:', error);
      toast.error(error.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-password-page">
      <div className="reset-password-container">
        <div className="reset-password-card">
          <div className="reset-password-header">
            <h1>Create New <span className="gradient-text">Password</span></h1>
            <p>Enter your new password below</p>
          </div>

          <form onSubmit={handleSubmit} className="reset-password-form">
            <div className="form-group">
              <label htmlFor="newPassword">
                <FiLock /> New Password <span className="required">*</span>
              </label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="newPassword"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  placeholder="Enter new password"
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
                  placeholder="Confirm new password"
                  required
                  disabled={loading}
                  className="input-premium"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? '👁️' : '👁️🗨️'}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              className="submit-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Resetting...
                </>
              ) : (
                <>
                  Reset Password
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;