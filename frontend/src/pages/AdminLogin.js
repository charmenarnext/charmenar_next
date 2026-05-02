import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FiMail, FiLock, FiShield, FiArrowRight } from 'react-icons/fi';
import './AdminLogin.css';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const { adminLogin, sendAdminOTP } = useAuth();
  const navigate = useNavigate();

  // Handle OTP Request
  const handleRequestOTP = async (e) => {
    e.preventDefault();
    
    console.log('🔐 Requesting OTP for:', email);
    
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    setLoading(true);
    
    try {
      console.log('📤 Calling sendAdminOTP...');
      await sendAdminOTP(email);
      console.log('✅ OTP sent successfully');
      toast.success('OTP sent to your email!');
      setStep(2);
    } catch (error) {
      console.error('❌ OTP Request Error:', error);
      console.error('Response:', error.response);
      
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Failed to send OTP. Please try again.';
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP Verification
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    
    if (!otp || otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    
    try {
      await adminLogin(email, otp);
      toast.success('Login successful!');
      navigate('/admin/dashboard');
    } catch (error) {
      console.error('❌ Login Error:', error);
      toast.error(error.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-container">
        <div className="admin-login-card">
          <div className="admin-login-header">
            <div className="admin-logo">
              <FiShield size={48} />
            </div>
            <h1>Admin Portal</h1>
            <p>Charmenar Next</p>
          </div>

          {step === 1 && (
            <form onSubmit={handleRequestOTP} className="admin-login-form">
              <div className="form-group">
                <label htmlFor="email">
                  <FiMail /> Admin Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@charmenarnext.com"
                  required
                  disabled={loading}
                />
              </div>

              <button 
                type="submit" 
                className="submit-btn"
                disabled={loading || !email}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Sending OTP...
                  </>
                ) : (
                  <>
                    Request OTP
                    <FiArrowRight />
                  </>
                )}
              </button>

              <div className="login-footer">
                <Link to="/" className="back-link">← Back to Home</Link>
              </div>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyOTP} className="admin-login-form">
              <div className="form-group">
                <label htmlFor="otp">
                  <FiLock /> Enter OTP
                </label>
                <input
                  type="text"
                  id="otp"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Enter 6-digit OTP"
                  maxLength="6"
                  required
                  disabled={loading}
                  className="otp-input"
                />
              </div>

              <div className="otp-info">
                <p>OTP sent to <strong>{email}</strong></p>
                <button 
                  type="button" 
                  className="resend-btn" 
                  onClick={handleRequestOTP}
                  disabled={loading}
                >
                  Resend OTP
                </button>
              </div>

              <button 
                type="submit" 
                className="submit-btn"
                disabled={loading || otp.length !== 6}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Verifying...
                  </>
                ) : (
                  <>
                    Verify & Login
                    <FiArrowRight />
                  </>
                )}
              </button>

              <div className="login-footer">
                <button 
                  type="button" 
                  className="back-link" 
                  onClick={() => {
                    setStep(1);
                    setOtp('');
                  }}
                >
                  ← Change Email
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;