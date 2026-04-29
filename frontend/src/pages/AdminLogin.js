import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import './AdminLogin.css';

const AdminLogin = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const { requestAdminOTP, adminLogin } = useAuth();
  const navigate = useNavigate();

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    try {
      await requestAdminOTP(email);
      toast.success('OTP sent to your email!');
      setStep(2);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send OTP');
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    try {
      await adminLogin(email, otp);
      toast.success('Admin login successful!');
      navigate('/admin/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid OTP');
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-container">
        <h2>Admin Login</h2>
        <p>Charmenar Next Administration</p>

        {step === 1 ? (
          <form onSubmit={handleRequestOTP} className="admin-form">
            <div className="form-group">
              <label>Admin Email</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="charmenarnext@gmail.com"
                required 
              />
            </div>
            <button type="submit" className="premium-btn">Request OTP</button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="admin-form">
            <div className="form-group">
              <label>Enter OTP</label>
              <input 
                type="text" 
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="6-digit OTP"
                maxLength="6"
                required 
              />
            </div>
            <button type="submit" className="premium-btn">Verify & Login</button>
            <button type="button" className="premium-btn premium-btn-outline" onClick={() => setStep(1)}>
              Back
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AdminLogin;