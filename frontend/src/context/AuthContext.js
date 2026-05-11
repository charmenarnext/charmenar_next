import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import config from '../config';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = config.API_URL;

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      if (token && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (error) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  // User Register
  const register = async (name, email, phone, password) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register`, { name, email, phone, password });
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        setUser(response.data.user);
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Registration failed' };
    }
  };

  // User Login
  const login = async (phone, password) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, { phone, password });
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        setUser(response.data.user);
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Login failed' };
    }
  };

  // ✅ Admin Send OTP
  const sendAdminOTP = async (email) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/admin/request-otp`, { email });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to send OTP' };
    }
  };

  // ✅ Admin Verify OTP (Login)
  const verifyAdminOTP = async (email, otp) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/admin/login`, { email, otp });
      if (response.data.token && response.data.user) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        setUser(response.data.user);
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Invalid OTP' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    toast.info('Logged out successfully');
  };

  return (
    <AuthContext.Provider value={{
      user, loading, register, login, sendAdminOTP, verifyAdminOTP, logout, isAuthenticated: !!localStorage.getItem('token'), isAdmin: user?.role === 'admin', setUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};