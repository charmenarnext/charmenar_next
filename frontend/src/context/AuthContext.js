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

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (token && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          console.log('✅ User already logged in:', JSON.parse(storedUser));
        } catch (error) {
          console.error('❌ Error parsing stored user:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };
    
    checkAuth();
  }, []);

  // Register (Name, Email, Phone, Password)
  const register = async (name, email, phone, password) => {
    console.log('📝 Register attempt:', { name, email, phone });
    
    try {
      const response = await axios.post(
        `${API_BASE_URL}/auth/register`,
        { name, email, phone, password },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 30000
        }
      );
      
      console.log('✅ Register response:', response.data);
      
      if (response.data.token && response.data.user) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        setUser(response.data.user);
        
        return response.data;
      } else {
        throw new Error('Invalid response from server');
      }
      
    } catch (error) {
      console.error('❌ Register error:', error);
      
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Registration failed. Please try again.';
      
      throw new Error(errorMessage);
    }
  };

  // Login (Phone + Password)
  const login = async (phone, password) => {
    console.log('🔐 Login attempt:', { phone });
    
    try {
      const response = await axios.post(
        `${API_BASE_URL}/auth/login`,
        { phone, password },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 30000
        }
      );
      
      console.log('✅ Login response:', response.data);
      
      if (response.data.token && response.data.user) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        setUser(response.data.user);
        
        return response.data;
      } else {
        throw new Error('Invalid response from server');
      }
      
    } catch (error) {
      console.error('❌ Login error:', error);
      
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Login failed. Please check your credentials.';
      
      throw new Error(errorMessage);
    }
  };

  // Logout
  const logout = () => {
    console.log('🚪 Logging out...');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    toast.info('Logged out successfully');
  };

  // Check if authenticated
  const isAuthenticated = !!localStorage.getItem('token');
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      register,
      login,
      logout,
      isAuthenticated,
      isAdmin,
      setUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};