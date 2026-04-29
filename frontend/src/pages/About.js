import React from 'react';
import './About.css';

const About = () => {
  return (
    <div className="about-page">
      <div className="page-header">
        <h1>About Charmenar Next</h1>
        <p>Crafting exceptional culinary experiences since 2020</p>
      </div>

      <div className="container">
        <div className="about-content">
          <div className="about-section">
            <h2>Our Story</h2>
            <p>
              Charmenar Next was founded with a vision to redefine luxury catering and event management. 
              We believe that every celebration deserves to be extraordinary, and every meal should be 
              a memorable experience.
            </p>
            <p>
              Our team of world-class chefs and event planners work tirelessly to bring your vision to life, 
              ensuring every detail is perfect, from the menu selection to the final presentation.
            </p>
          </div>

          <div className="about-section">
            <h2>Our Mission</h2>
            <p>
              To deliver unparalleled catering and event services that exceed expectations, 
              creating lasting memories through exceptional food, impeccable service, and 
              attention to every detail.
            </p>
          </div>

          <div className="about-section">
            <h2>Why Choose Us</h2>
            <ul className="about-list">
              <li>✓ Award-winning culinary team</li>
              <li>✓ Customized menus for every occasion</li>
              <li>✓ Premium, locally-sourced ingredients</li>
              <li>✓ Professional event coordination</li>
              <li>✓ Exceptional customer service</li>
              <li>✓ Competitive pricing without compromising quality</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;