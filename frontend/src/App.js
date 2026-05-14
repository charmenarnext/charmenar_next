import React from 'react';
// ✅ FIX: Use HashRouter instead of BrowserRouter for reliable routing
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider, useAuth } from './context/AuthContext';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import Catering from './pages/Catering';
import Events from './pages/Events';
import About from './pages/About';
import ContactUs from './pages/ContactUs';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';

// ==========================================
// PROTECTED ROUTE COMPONENT
// ==========================================
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// ==========================================
// MAIN APP COMPONENT
// ==========================================
function App() {
  // ✅ HashRouter works on ALL environments without basename
  // Custom domain: https://charmenarnext.com/#/admin/login
  // GitHub Pages: https://charmenarnext.github.io/charmenar_next/#/admin/login
  // Local: http://localhost:3003/#/admin/login
  
  return (
    <AuthProvider>
      {/* ✅ No basename prop needed with HashRouter */}
      <Router>
        <div className="App">
          <Navbar />
          
          <Routes>
            {/* ===== PUBLIC ROUTES ===== */}
            <Route path="/" element={<Home />} />
            <Route path="/catering" element={<Catering />} />
            <Route path="/events" element={<Events />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            
            {/* ===== PROTECTED ADMIN ROUTES ===== */}
            <Route 
              path="/admin/dashboard" 
              element={
                <ProtectedRoute adminOnly={true}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* ===== 404 FALLBACK ===== */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          
          <Footer />
          
          <ToastContainer 
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="dark"
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;