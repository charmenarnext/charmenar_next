import React from 'react';
import { Link } from 'react-router-dom';
import { FiPhone, FiMail, FiMapPin, FiFacebook, FiTwitter, FiInstagram, FiLinkedin } from 'react-icons/fi';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          {/* Logo & About */}
          <div className="footer-section">
            <div className="footer-logo">
              <img 
                src={`${process.env.PUBLIC_URL}/logo.png`} 
                alt="Charmenar Next" 
                className="footer-logo-img"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              <div className="footer-logo-text">
                <h3>Charmenar <span className="gradient-text">Next</span></h3>
                <p className="footer-tagline">Food • Fun • Service</p>
              </div>
            </div>
            <p className="footer-description">
              Creating memorable experiences with premium catering and event services.
            </p>
            <div className="footer-social">
              <a href="https://facebook.com" className="social-link" target="_blank" rel="noopener noreferrer"><FiFacebook /></a>
              <a href="https://twitter.com" className="social-link" target="_blank" rel="noopener noreferrer"><FiTwitter /></a>
              <a href="https://instagram.com" className="social-link" target="_blank" rel="noopener noreferrer"><FiInstagram /></a>
              <a href="https://linkedin.com" className="social-link" target="_blank" rel="noopener noreferrer"><FiLinkedin /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-section">
            <h3>Quick Links</h3>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/catering">Catering</Link></li>
              <li><Link to="/events">Events</Link></li>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div className="footer-section">
            <h3>Services</h3>
            <ul>
              <li>Wedding Catering</li>
              <li>Corporate Events</li>
              <li>Private Parties</li>
              <li>Event Planning</li>
              <li>Venue Decoration</li>
            </ul>
          </div>

          {/* Contact Info - UPDATED */}
          <div className="footer-section">
            <h3>Contact Us</h3>
            <ul className="contact-list">
              <li>
                <FiPhone /> 
                <a href="tel:+9124470079" className="contact-link">+91 24470079</a>
              </li>
              <li>
                <FiMail /> 
                <a href="mailto:charmenarnext@gmail.com" className="contact-link">charmenarnext@gmail.com</a>
              </li>
              <li>
                <FiMapPin /> 
                <span className="contact-address">
                  Plot No.533, K7, Vipul Garden Road,<br />
                  Bhubaneswar 751003
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Charmenar Next. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;