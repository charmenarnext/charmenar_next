import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import config from '../config';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // API base URL from config
  const API_BASE_URL = config.API_URL;

  // Send OTP to admin email
  const sendAdminOTP = async (email) => {
    console.log('📤 Sending OTP request to:', `${API_BASE_URL}/auth/admin/request-otp`);
    
    const response = await axios.post(
      `${API_BASE_URL}/auth/admin/request-otp`,
      { email },
      {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true
      }
    );
    return response.data;
  };

  // Admin login with OTP
  const adminLogin = async (email, otp) => {
    const response = await axios.post(
      `${API_BASE_URL}/auth/admin/login`,
      { email, otp },
      {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true
      }
    );
    
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setUser(response.data.user);
    }
    return response.data;
  };

  // Regular user login
  const login = async (email, password) => {
    const response = await axios.post(
      `${API_BASE_URL}/auth/login`,
      { email, password },
      {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true
      }
    );
    
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setUser(response.data.user);
    }
    return response.data;
  };

  // Register
  const register = async (name, email, password) => {
    const response = await axios.post(
      `${API_BASE_URL}/auth/register`,
      { name, email, password },
      {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true
      }
    );
    
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setUser(response.data.user);
    }
    return response.data;
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  // Check if user is authenticated
  const isAuthenticated = !!localStorage.getItem('token');
  const isAdmin = user?.role === 'admin';

  // Load user on mount
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await axios.get(`${API_BASE_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` }
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
  }, []);

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