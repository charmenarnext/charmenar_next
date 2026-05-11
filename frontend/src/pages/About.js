import React from 'react';
import { Link } from 'react-router-dom';
import { FiTarget, FiHeart, FiStar, FiShield, FiUsers, FiClock, FiAward, FiCamera } from 'react-icons/fi';
import './About.css';

const About = () => {
  return (
    <div className="about-page">
      {/* Page Header */}
      <section className="page-header">
        <div className="glow-orb glow-orb-1"></div>
        <div className="glow-orb glow-orb-2"></div>
        
        <div className="container">
          <h1>
            About <span className="gradient-text">Us</span>
          </h1>
          <div className="divider"></div>
          <p>Crafting unforgettable experiences with passion, precision, and premium quality since 2015</p>
        </div>
      </section>

      {/* Our Story */}
      <section className="about-story">
        <div className="story-container">
          <div className="story-image">
            <img 
              src="https://images.unsplash.com/photo-1555244162-803834f70033?w=800" 
              alt="Our Story" 
            />
          </div>
          <div className="story-content">
            <h2>Our <span className="gradient-text">Story</span></h2>
            <p>
              Founded in 2015, Charmenar Next began with a simple vision: to transform ordinary gatherings into extraordinary celebrations. What started as a small catering service in the heart of Hyderabad has grown into a premier events and catering company trusted by thousands.
            </p>
            <p>
              Our journey is built on a foundation of authenticity, culinary excellence, and meticulous attention to detail. From intimate family gatherings to grand corporate galas, we bring the same level of passion and professionalism to every event we touch.
            </p>
            <p>
              Today, we are proud to be one of the most sought-after event partners in the region, known for our innovative menus, stunning décor, and flawless execution.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="about-mission">
        <div className="mission-grid">
          <div className="mission-card">
            <div className="mission-icon">
              <FiTarget />
            </div>
            <h3>Our Mission</h3>
            <p>To deliver exceptional catering and event experiences that exceed expectations, create lasting memories, and set new standards of excellence in the industry.</p>
          </div>

          <div className="mission-card">
            <div className="mission-icon">
              <FiHeart />
            </div>
            <h3>Our Vision</h3>
            <p>To become the most trusted and innovative events company in India, recognized for our creativity, reliability, and unwavering commitment to client satisfaction.</p>
          </div>

          <div className="mission-card">
            <div className="mission-icon">
              <FiStar />
            </div>
            <h3>Our Values</h3>
            <p>Integrity, excellence, creativity, and customer-centricity form the core of everything we do. We believe in building relationships, not just delivering services.</p>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="about-features">
        <h2>Why Choose <span className="gradient-text">Charmenar Next</span>?</h2>
        <div className="features-grid">
          <div className="feature-item">
            <FiAward />
            <h4>Premium Quality</h4>
            <p>We use only the finest ingredients and materials to ensure every detail meets our high standards.</p>
          </div>

          <div className="feature-item">
            <FiUsers />
            <h4>Expert Team</h4>
            <p>Our experienced chefs, planners, and coordinators bring decades of combined expertise to your event.</p>
          </div>

          <div className="feature-item">
            <FiClock />
            <h4>Timely Delivery</h4>
            <p>We understand the importance of punctuality and ensure every event runs seamlessly on schedule.</p>
          </div>

          <div className="feature-item">
            <FiShield />
            <h4>Customized Solutions</h4>
            <p>Every event is unique. We tailor our services to match your vision, budget, and preferences.</p>
          </div>

          <div className="feature-item">
            <FiCamera />
            <h4>Stunning Décor</h4>
            <p>From elegant minimalism to grand opulence, our design team creates breathtaking atmospheres.</p>
          </div>

          <div className="feature-item">
            <FiStar />
            <h4>5-Star Service</h4>
            <p>Dedicated support from planning to execution, ensuring a stress-free and memorable experience.</p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="about-stats">
        <div className="stats-container">
          <div className="stat-item">
            <h3>8+</h3>
            <p>Years Experience</p>
          </div>
          <div className="stat-item">
            <h3>1,200+</h3>
            <p>Events Completed</p>
          </div>
          <div className="stat-item">
            <h3>50K+</h3>
            <p>Happy Clients</p>
          </div>
          <div className="stat-item">
            <h3>100%</h3>
            <p>Client Satisfaction</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="about-cta">
        <div className="cta-box">
          <h2>Ready to Create Something <span className="gradient-text">Amazing?</span></h2>
          <p>Let's turn your vision into reality. Contact us today to discuss your next event and discover how Charmenar Next can make it unforgettable.</p>
          <Link to="/contact" className="cta-btn">
            Get In Touch →
          </Link>
        </div>
      </section>
    </div>
  );
};

export default About;