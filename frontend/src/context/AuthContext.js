import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

// ✅ API Base URL using your PORT 5010 and FRONTEND_URL 3003
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5010/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set axios default base URL
    axios.defaults.baseURL = API_BASE_URL;
    axios.defaults.headers.common['Content-Type'] = 'application/json';
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const res = await axios.get('/auth/me');
        setUser(res.data.user);
      } catch (error) {
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
      }
    }
    setLoading(false);
  };

  const login = async (email, password) => {
    const res = await axios.post('/auth/login', { email, password });
    localStorage.setItem('token', res.data.token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
    setUser(res.data.user);
    return res.data;
  };

  const register = async (userData) => {
    const res = await axios.post('/auth/register', userData);
    localStorage.setItem('token', res.data.token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
    setUser(res.data.user);
    return res.data;
  };

  const adminLogin = async (email, otp) => {
    const res = await axios.post('/auth/admin/verify-otp', { email, otp });
    localStorage.setItem('token', res.data.token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
    setUser(res.data.user);
    return res.data;
  };

  const requestAdminOTP = async (email) => {
    return await axios.post('/auth/admin/request-otp', { email });
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      register, 
      adminLogin, 
      requestAdminOTP, 
      logout,
      isAuthenticated: !!user,
      isAdmin: user?.isAdmin 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);