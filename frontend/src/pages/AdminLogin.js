import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FiMail, FiLock, FiShield, FiRefreshCw } from 'react-icons/fi';
import './AdminLogin.css';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const [fallbackOtp, setFallbackOtp] = useState(''); // State for fallback OTP
  
  const { sendAdminOTP, verifyAdminOTP } = useAuth();
  const navigate = useNavigate();

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    if (!email) return toast.error('Please enter admin email');
    
    setLoading(true);
    setFallbackOtp(''); // Clear previous
    
    try {
      const response = await sendAdminOTP(email);
      
      // ✅ FIX: If backend returns OTP (fallback mode), show it
      if (response.otp) {
        setFallbackOtp(response.otp);
        toast.info('Email service unavailable. Using generated OTP.');
      } else {
        toast.success('OTP sent to your email');
      }
      
      setStep(2);
      setTimer(60);
      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) clearInterval(interval);
          return prev - 1;
        });
      }, 1000);
      
    } catch (error) {
      toast.error(error.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otp) return toast.error('Please enter OTP');
    
    setLoading(true);
    try {
      await verifyAdminOTP(email, otp);
      toast.success('Welcome back, Admin!');
      navigate('/admin/dashboard');
    } catch (error) {
      toast.error(error.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-container">
        <div className="admin-login-card">
          <div className="admin-header">
            <FiShield className="admin-icon" />
            <h1>Admin <span className="gradient-text">Portal</span></h1>
            <p>Secure access for administrators only</p>
          </div>

          {step === 1 ? (
            <form onSubmit={handleRequestOTP} className="admin-form">
              <div className="form-group">
                <label><FiMail /> Admin Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@gmail.com" required />
              </div>
              <button type="submit" className="admin-btn" disabled={loading}>
                {loading ? 'Sending OTP...' : 'Get OTP'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="admin-form">
              <div className="otp-info">
                <p>OTP sent to <strong>{email}</strong></p>
                
                {/* ✅ FIX: Display Fallback OTP */}
                {fallbackOtp && (
                  <div style={{ background: 'rgba(255, 215, 0, 0.1)', border: '1px solid #D4AF37', padding: '10px', borderRadius: '8px', marginTop: '10px' }}>
                    <p style={{ color: '#D4AF37', fontWeight: 'bold', margin: 0, fontSize: '1.2rem' }}>
                      🔑 Generated OTP: {fallbackOtp}
                    </p>
                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', margin: '5px 0 0 0' }}>
                      (Email failed to send, use this code instead)
                    </p>
                  </div>
                )}

                {timer > 0 ? (
                  <p className="timer">Resend in {timer}s</p>
                ) : (
                  <button type="button" className="resend-link" onClick={handleRequestOTP}><FiRefreshCw /> Resend</button>
                )}
              </div>
              <div className="form-group">
                <label><FiLock /> Enter OTP</label>
                <input 
                  type="text" 
                  value={otp} 
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setOtp(val);
                    if (fallbackOtp && val.length === 6) {
                      // Auto-submit if it matches fallback (optional convenience)
                    }
                  }} 
                  placeholder="123456" 
                  maxLength="6" 
                  className="otp-input" 
                  required 
                />
              </div>
              <button type="submit" className="admin-btn" disabled={loading}>
                {loading ? 'Verifying...' : 'Verify & Login'}
              </button>
              <button type="button" className="back-link" onClick={() => { setStep(1); setOtp(''); setFallbackOtp(''); }}>Back</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;