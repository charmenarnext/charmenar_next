import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiMenu, FiX } from 'react-icons/fi';
import './Navbar.css';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/catering', label: 'Catering' },
    { path: '/events', label: 'Events' },
    { path: '/about', label: 'About' },
    { path: '/contact', label: 'Contact Us' }
  ];

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        {/* ===== LOGO ===== */}
        <Link to="/" className="navbar-logo" onClick={() => window.scrollTo(0, 0)}>
          <img 
            src={`./logo.png?v=${Date.now()}`} 
            alt="Charmenar Next" 
            className="navbar-logo-img"
          />
          <span className="navbar-logo-text">
            Charmenar <span className="gradient-text">Next</span>
          </span>
        </Link>

        {/* Desktop Menu */}
        <ul className={`navbar-menu ${isMobileMenuOpen ? 'active' : ''}`}>
          {navLinks.map((link) => (
            <li key={link.path}>
              <Link
                to={link.path}
                className={`navbar-link ${location.pathname === link.path ? 'active' : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            </li>
          ))}
          <li>
            <Link to="/login" className="navbar-btn">Login</Link>
          </li>
          <li>
            <Link to="/register" className="navbar-btn register-btn">Register</Link>
          </li>
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