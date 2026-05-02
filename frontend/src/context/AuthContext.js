import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import config from '../config';

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

  console.log('🔧 AuthContext - API_BASE_URL:', API_BASE_URL);

  // Send OTP to admin email
  const sendAdminOTP = async (email) => {
    console.log('📤 sendAdminOTP called');
    console.log('   Email:', email);
    console.log('   URL:', `${API_BASE_URL}/auth/admin/request-otp`);
    
    try {
      const response = await axios.post(
        `${API_BASE_URL}/auth/admin/request-otp`,
        { email },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 60000,  // Increased to 60 seconds
          withCredentials: false
        }
      );
      
      console.log('✅ sendAdminOTP success:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ sendAdminOTP failed:');
      console.error('   Message:', error.message);
      console.error('   Code:', error.code);
      console.error('   Response:', error.response?.status, error.response?.data);
      
      if (error.code === 'ECONNABORTED') {
        throw new Error('Request timeout. Backend is not responding.');
      }
      if (error.response?.status === 404) {
        throw new Error('Endpoint not found. Check backend deployment.');
      }
      if (error.response?.status === 500) {
        throw new Error('Backend server error. Check logs.');
      }
      
      throw error;
    }
  };

  // Admin login with OTP
  const adminLogin = async (email, otp) => {
    console.log('📤 adminLogin called');
    
    try {
      const response = await axios.post(
        `${API_BASE_URL}/auth/admin/login`,
        { email, otp },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 60000,
          withCredentials: false
        }
      );
      
      console.log('✅ adminLogin success:', response.data);
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        setUser(response.data.user);
      }
      
      return response.data;
    } catch (error) {
      console.error('❌ adminLogin failed:', error.message);
      throw error;
    }
  };

  // Regular user login
  const login = async (email, password) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/auth/login`,
        { email, password },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 30000
        }
      );
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        setUser(response.data.user);
      }
      
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  // Register
  const register = async (name, email, password) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/auth/register`,
        { name, email, password },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 30000
        }
      );
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        setUser(response.data.user);
      }
      
      return response.data;
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const isAuthenticated = !!localStorage.getItem('token');
  const isAdmin = user?.role === 'admin';

  // Load user on mount
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await axios.get(`${API_BASE_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 10000
          });
          setUser(response.data.user);
        } catch (error) {
          console.error('Failed to load user:', error);
          logout();
        }
      }
      setLoading(false);
    };
    loadUser();
  }, [API_BASE_URL]);

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      logout,
      sendAdminOTP,
      adminLogin,
      isAuthenticated,
      isAdmin
    }}>
      {children}
    </AuthContext.Provider>
  );
};