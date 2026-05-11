import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiMenu, FiUser, FiLogOut } from 'react-icons/fi';
import './Navbar.css';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        {/* Logo - FIXED PATH */}
        <Link to="/" className="navbar-logo">
          {/* Use process.env.PUBLIC_URL to fix GitHub Pages path issue */}
          <img 
            src={`${process.env.PUBLIC_URL}/logo.png`} 
            alt="Charmenar Next" 
            className="navbar-logo-img" 
          />
          <span className="navbar-logo-text">
            Charmenar <span style={{ color: '#D4AF37' }}>Next</span>
          </span>
        </Link>

        {/* Navigation Menu */}
        <ul className={`navbar-menu ${isMobileMenuOpen ? 'active' : ''}`}>
          <li><Link to="/" onClick={() => setIsMobileMenuOpen(false)}>Home</Link></li>
          <li><Link to="/catering" onClick={() => setIsMobileMenuOpen(false)}>Catering</Link></li>
          <li><Link to="/events" onClick={() => setIsMobileMenuOpen(false)}>Events</Link></li>
          <li><Link to="/about" onClick={() => setIsMobileMenuOpen(false)}>About</Link></li>
          <li><Link to="/contact" onClick={() => setIsMobileMenuOpen(false)}>Contact Us</Link></li>
          
          {/* Admin Dashboard Link */}
          {isAdmin && (
            <li><Link to="/admin/dashboard" onClick={() => setIsMobileMenuOpen(false)}>Dashboard</Link></li>
          )}
          
          {/* Auth Buttons - Premium Design Classes */}
          {isAuthenticated && user ? (
            <>
              <li>
                <div className="user-greeting">
                  <FiUser /> {user.name}
                </div>
              </li>
              <li>
                <button onClick={handleLogout} className="navbar-btn logout-btn">
                  <FiLogOut /> Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to="/login" className="navbar-btn login-btn" onClick={() => setIsMobileMenuOpen(false)}>
                  Login
                </Link>
              </li>
              <li>
                <Link to="/register" className="navbar-btn register-btn" onClick={() => setIsMobileMenuOpen(false)}>
                  Register
                </Link>
              </li>
            </>
          )}
        </ul>

        {/* Mobile Hamburger */}
        <div 
          className={`hamburger ${isMobileMenuOpen ? 'active' : ''}`}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;