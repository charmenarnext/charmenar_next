import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCalendar, FiUsers, FiAward, FiStar } from 'react-icons/fi';
import HeroSlider from '../components/HeroSlider';
import './Home.css';

const Home = () => {
  return (
    <div className="home">
      {/* Hero Slider Section */}
      <HeroSlider />

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="section-header"
          >
            <h2>Why Choose <span className="premium-gradient-text">Charmenar Next</span></h2>
            <p>Experience excellence in every detail</p>
          </motion.div>

          <div className="features-grid">
            {[
              { icon: FiStar, title: 'Expert Chefs', desc: 'World-class culinary professionals' },
              { icon: FiAward, title: 'Premium Quality', desc: 'Only the finest ingredients' },
              { icon: FiCalendar, title: 'Custom Planning', desc: 'Tailored to your vision' },
              { icon: FiUsers, title: 'Dedicated Team', desc: 'Personalized service guaranteed' }
            ].map((feature, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="feature-card"
              >
                <div className="feature-icon">
                  <feature.icon />
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Preview Section */}
      <section className="services-preview">
        <div className="container">
          <div className="section-header">
            <h2>Our Premium Services</h2>
            <p>Discover what makes us special</p>
          </div>

          <div className="services-grid">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="service-item"
            >
              <img 
                src="https://images.unsplash.com/photo-1555244162-803834f70033?w=800&h=600&fit=crop" 
                alt="Wedding Catering" 
              />
              <div className="service-overlay">
                <h3>Wedding Catering</h3>
                <p>Make your special day unforgettable</p>
                <Link to="/catering" className="service-link">Learn More →</Link>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="service-item"
            >
              <img 
                src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&h=600&fit=crop" 
                alt="Corporate Events" 
              />
              <div className="service-overlay">
                <h3>Corporate Events</h3>
                <p>Impress your clients and team</p>
                <Link to="/events" className="service-link">Learn More →</Link>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="service-item"
            >
              <img 
                src="https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&h=600&fit=crop" 
                alt="Private Parties" 
              />
              <div className="service-overlay">
                <h3>Private Parties</h3>
                <p>Celebrate in style</p>
                <Link to="/events" className="service-link">Learn More →</Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials">
        <div className="container">
          <div className="section-header">
            <h2>What Our Clients Say</h2>
            <p>Real experiences from real customers</p>
          </div>

          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="testimonial-stars">★★★★★</div>
              <p className="testimonial-text">
                "Charmenar Next made our wedding absolutely perfect! The food was exquisite and the service was impeccable."
              </p>
              <div className="testimonial-author">
                <h4>Sarah & Michael</h4>
                <span>Wedding Client</span>
              </div>
            </div>

            <div className="testimonial-card">
              <div className="testimonial-stars">★★★★★</div>
              <p className="testimonial-text">
                "Our corporate gala was a huge success thanks to their team. Professional, punctual, and delicious!"
              </p>
              <div className="testimonial-author">
                <h4>James Thompson</h4>
                <span>Corporate Event Manager</span>
              </div>
            </div>

            <div className="testimonial-card">
              <div className="testimonial-stars">★★★★★</div>
              <p className="testimonial-text">
                "Best catering service we've ever used. The attention to detail and quality is unmatched."
              </p>
              <div className="testimonial-author">
                <h4>Emily Rodriguez</h4>
                <span>Birthday Celebration</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="cta-content"
          >
            <h2>Ready to Create Something Amazing?</h2>
            <p>Let's bring your vision to life with our premium catering and event services</p>
            <div className="cta-buttons">
              <Link to="/catering" className="premium-btn">
                Explore Catering
              </Link>
              <Link to="/events" className="premium-btn premium-btn-outline">
                Plan Your Event
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;