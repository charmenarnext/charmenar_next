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

  // Check if user is already logged in on page load
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      console.log('🔍 Checking auth on load...', { 
        hasToken: !!token, 
        hasUser: !!storedUser 
      });
      
      if (token && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          console.log('✅ User already logged in:', parsedUser);
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

  // Register function
  const register = async (name, email, phone, password) => {
    try {
      console.log('📝 Register attempt:', { name, email, phone });
      
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
        // Save to localStorage IMMEDIATELY
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        // Update state
        setUser(response.data.user);
        
        console.log('✅ Registration successful, user saved:', response.data.user);
        
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

  // Login function
  const login = async (phone, password) => {
    try {
      console.log('🔐 Login attempt:', { phone });
      
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
        // CRITICAL: Save to localStorage FIRST
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        // THEN update state
        setUser(response.data.user);
        
        console.log('✅ Login successful, user saved to localStorage:', response.data.user);
        console.log('🔑 Token saved:', response.data.token.substring(0, 20) + '...');
        
        // Verify it was saved
        console.log('📦 Verifying localStorage:', {
          tokenExists: !!localStorage.getItem('token'),
          userExists: !!localStorage.getItem('user')
        });
        
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

  // Logout function
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