import React from 'react';
import { Link } from 'react-router-dom';
import { FiStar, FiClock, FiAward, FiUsers, FiCalendar, FiPhone, FiArrowRight } from 'react-icons/fi';
import './Home.css';

const Home = () => {
  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="glow-orb glow-orb-1"></div>
        <div className="glow-orb glow-orb-2"></div>
        <div className="glow-orb glow-orb-3"></div>
        
        <div className="hero-content">
          <h1 className="hero-title">
            Crafting <span>Memorable</span> Events
          </h1>
          <div className="hero-divider"></div>
          <p className="hero-subtitle">
            Premium Catering & Event Services for Life's Special Moments. From intimate gatherings to grand celebrations, we bring your vision to life with elegance and excellence.
          </p>
          <div className="hero-buttons">
            <Link to="/events" className="hero-btn-primary">
              Book Your Event <FiArrowRight />
            </Link>
            <Link to="/catering" className="hero-btn-secondary">
              Catering Services
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <h2>
            Why Choose <span>Charmenar Next</span>?
          </h2>
          <p>We deliver exceptional experiences with attention to every detail</p>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <FiStar />
              </div>
              <h3 className="feature-title">Premium Quality</h3>
              <p className="feature-description">
                We use only the finest ingredients and materials to ensure every event meets our high standards of excellence.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <FiClock />
              </div>
              <h3 className="feature-title">Timely Delivery</h3>
              <p className="feature-description">
                Punctuality is our promise. We ensure every event runs seamlessly on schedule without compromising quality.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <FiAward />
              </div>
              <h3 className="feature-title">Expert Team</h3>
              <p className="feature-description">
                Our experienced chefs, planners, and coordinators bring decades of combined expertise to your special day.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <FiUsers />
              </div>
              <h3 className="feature-title">Personalized Service</h3>
              <p className="feature-description">
                Every event is unique. We tailor our services to match your vision, budget, and preferences perfectly.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <FiCalendar />
              </div>
              <h3 className="feature-title">Full Planning</h3>
              <p className="feature-description">
                From concept to execution, we handle every detail so you can focus on enjoying your special occasion.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <FiPhone />
              </div>
              <h3 className="feature-title">24/7 Support</h3>
              <p className="feature-description">
                Our dedicated team is always available to assist you, ensuring peace of mind throughout the planning process.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Preview Section */}
      <section className="about-preview">
        <div className="container">
          <div className="about-preview-image">
            <img 
              src="https://images.unsplash.com/photo-1555244162-803834f70033?w=800" 
              alt="About Charmenar Next" 
            />
          </div>
          <div className="about-preview-content">
            <h2>
              About <span>Charmenar Next</span>
            </h2>
            <p>
              Founded in 2015, Charmenar Next has grown from a small catering service into one of Hyderabad's most trusted event partners. Our journey is built on passion, authenticity, and an unwavering commitment to excellence.
            </p>
            <p>
              From intimate family gatherings to grand corporate galas, we bring the same level of dedication and creativity to every event we touch. Our team of experienced professionals ensures that every detail is perfect.
            </p>
            <Link to="/about" className="btn-primary">
              Learn More About Us <FiArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
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
            <p>Satisfaction Rate</p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials">
        <div className="container">
          <h2>
            What Our <span>Clients Say</span>
          </h2>
          <p>Don't just take our word for it - hear from our satisfied clients</p>
          
          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="testimonial-quote">"</div>
              <p className="testimonial-text">
                Charmenar Next made our wedding absolutely magical! The food was incredible, the décor was stunning, and their team handled everything flawlessly. Highly recommended!
              </p>
              <div className="testimonial-author">
                <img 
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100" 
                  alt="Client" 
                  className="testimonial-avatar"
                />
                <div>
                  <p className="testimonial-name">Priya Sharma</p>
                  <p className="testimonial-role">Wedding Client</p>
                </div>
              </div>
            </div>

            <div className="testimonial-card">
              <div className="testimonial-quote">"</div>
              <p className="testimonial-text">
                We've used Charmenar Next for multiple corporate events and they never disappoint. Professional, punctual, and the food is always outstanding. They're our go-to event partner.
              </p>
              <div className="testimonial-author">
                <img 
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100" 
                  alt="Client" 
                  className="testimonial-avatar"
                />
                <div>
                  <p className="testimonial-name">Rajesh Kumar</p>
                  <p className="testimonial-role">Corporate Client</p>
                </div>
              </div>
            </div>

            <div className="testimonial-card">
              <div className="testimonial-quote">"</div>
              <p className="testimonial-text">
                From the initial consultation to the last guest leaving, everything was perfect. The attention to detail and personalized service made our anniversary celebration truly special.
              </p>
              <div className="testimonial-author">
                <img 
                  src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100" 
                  alt="Client" 
                  className="testimonial-avatar"
                />
                <div>
                  <p className="testimonial-name">Anita Reddy</p>
                  <p className="testimonial-role">Anniversary Client</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="cta-content">
          <h2>
            Ready to Create Something <span>Amazing?</span>
          </h2>
          <p>
            Let's turn your vision into reality. Contact us today to discuss your next event and discover how Charmenar Next can make it unforgettable.
          </p>
          <div className="cta-buttons">
            <Link to="/contact" className="hero-btn-primary">
              Get In Touch <FiArrowRight />
            </Link>
            <Link to="/events" className="hero-btn-secondary">
              View Our Packages
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;