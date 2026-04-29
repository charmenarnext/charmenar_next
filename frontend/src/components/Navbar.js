import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiMenu, FiX, FiUser, FiLogOut } from 'react-icons/fi';
import './Navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
  };

  const closeMenu = () => setIsOpen(false);

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        <Link to="/" className="navbar-logo" onClick={closeMenu}>
          <span className="logo-text">Charmenar</span>
          <span className="logo-next">Next</span>
        </Link>

        <div className={`navbar-menu ${isOpen ? 'active' : ''}`}>
          <Link to="/" className={`navbar-link ${location.pathname === '/' ? 'active' : ''}`} onClick={closeMenu}>Home</Link>
          <Link to="/catering" className={`navbar-link ${location.pathname === '/catering' ? 'active' : ''}`} onClick={closeMenu}>Catering</Link>
          <Link to="/events" className={`navbar-link ${location.pathname === '/events' ? 'active' : ''}`} onClick={closeMenu}>Events</Link>
          <Link to="/about" className={`navbar-link ${location.pathname === '/about' ? 'active' : ''}`} onClick={closeMenu}>About</Link>
          <Link to="/contact" className={`navbar-link ${location.pathname === '/contact' ? 'active' : ''}`} onClick={closeMenu}>Contact Us</Link>

          {user ? (
            <>
              {isAdmin && (
                <Link to="/admin/dashboard" className={`navbar-link admin-link ${location.pathname === '/admin/dashboard' ? 'active' : ''}`} onClick={closeMenu}>
                  Admin Panel
                </Link>
              )}
              <div className="navbar-user">
                <div className="user-avatar"><FiUser /></div>
                <span className="user-name">{user.name}</span>
                <button onClick={handleLogout} className="logout-btn" title="Logout">
                  <FiLogOut />
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className={`navbar-link ${location.pathname === '/login' ? 'active' : ''}`} onClick={closeMenu}>Login</Link>
              <Link to="/register" className="navbar-btn premium-btn" onClick={closeMenu}>Register</Link>
            </>
          )}
        </div>

        <button className="navbar-toggle" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle menu">
          {isOpen ? <FiX /> : <FiMenu />}
        </button>
      </div>
      
      {/* Mobile backdrop overlay */}
      {isOpen && <div className="menu-backdrop" onClick={closeMenu}></div>}
    </nav>
  );
};

export default Navbar;