import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FiMail, FiLock, FiShield, FiArrowRight } from 'react-icons/fi';
import './AdminLogin.css';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1); // 1 = Email, 2 = OTP
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [timer, setTimer] = useState(0);
  
  const { adminLogin, sendAdminOTP } = useAuth();
  const navigate = useNavigate();

  // Handle OTP Request
  const handleRequestOTP = async (e) => {
    e.preventDefault();
    
    // Validate email
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    setLoading(true);
    
    try {
      await sendAdminOTP(email);
      toast.success('OTP sent to your email!');
      setOtpSent(true);
      setStep(2);
      
      // Start countdown timer for resend
      setTimer(30);
      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
    } catch (error) {
      console.error('OTP Request Error:', error);
      toast.error(error.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP Verification & Login
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    
    // Validate OTP
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
      console.error('Login Error:', error);
      toast.error(error.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Resend OTP
  const handleResendOTP = async () => {
    if (timer > 0) return;
    
    setLoading(true);
    
    try {
      await sendAdminOTP(email);
      toast.success('OTP resent successfully!');
      setTimer(30);
      
      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
    } catch (error) {
      toast.error('Failed to resend OTP');
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

          {/* Step 1: Email Input */}
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

          {/* Step 2: OTP Input */}
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
                {timer > 0 ? (
                  <p className="timer">Resend OTP in {timer}s</p>
                ) : (
                  <button 
                    type="button" 
                    className="resend-btn" 
                    onClick={handleResendOTP}
                    disabled={loading}
                  >
                    Resend OTP
                  </button>
                )}
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
                    setOtpSent(false);
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