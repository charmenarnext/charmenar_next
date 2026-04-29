import React from 'react';
import { Link } from 'react-router-dom';
import { FiFacebook, FiTwitter, FiInstagram, FiLinkedin } from 'react-icons/fi';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3 className="footer-logo">
            <span className="logo-text">Charmenar</span>
            <span className="logo-next">Next</span>
          </h3>
          <p className="footer-description">
            Creating unforgettable culinary experiences for your special moments. Premium catering and event services.
          </p>
          <div className="footer-social">
            <a href="#" className="social-link" aria-label="Facebook"><FiFacebook /></a>
            <a href="#" className="social-link" aria-label="Twitter"><FiTwitter /></a>
            <a href="#" className="social-link" aria-label="Instagram"><FiInstagram /></a>
            <a href="#" className="social-link" aria-label="LinkedIn"><FiLinkedin /></a>
          </div>
        </div>

        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul className="footer-links">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/catering">Catering</Link></li>
            <li><Link to="/events">Events</Link></li>
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Services</h4>
          <ul className="footer-links">
            <li>Wedding Catering</li>
            <li>Corporate Events</li>
            <li>Birthday Parties</li>
            <li>Private Dinners</li>
            <li>Special Occasions</li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Contact Info</h4>
          <ul className="footer-contact">
            <li>📧 charmenarnext@gmail.com</li>
            <li>📞 +1 (555) 123-4567</li>
            <li>📍 123 Luxury Lane, Premium City</li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; 2026 Charmenar Next. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;