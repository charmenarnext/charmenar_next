import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './HeroSlider.css';

const HeroSlider = () => {
  const slides = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=1920&q=80',
      title: 'Crafting Memorable Events',
      subtitle: 'Premium Catering & Event Services for Life\'s Special Moments',
      ctaText: 'Book Your Event',
      ctaLink: '/events'  // ✅ FIXED: Now redirects to Events page
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1920&q=80',
      title: 'Exquisite Wedding Catering',
      subtitle: 'Make Your Dream Wedding a Reality',
      ctaText: 'Explore Wedding Packages',
      ctaLink: '/catering'
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1920&q=80',
      title: 'Corporate Events Excellence',
      subtitle: 'Impress Your Clients with Professional Service',
      ctaText: 'Corporate Services',
      ctaLink: '/events'
    },
    {
      id: 4,
      image: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=1920&q=80',
      title: 'Private Celebrations',
      subtitle: 'Birthdays, Anniversaries & Special Occasions',
      ctaText: 'Plan Your Party',
      ctaLink: '/events'
    }
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="hero-slider">
      {/* Background Images */}
      <div className="slider-backgrounds">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`bg-slide ${index === currentSlide ? 'active' : ''}`}
            style={{
              backgroundImage: `url(${slide.image})`,
            }}
          />
        ))}
      </div>

      {/* Fixed Content */}
      <div className="hero-content-fixed">
        <h1 className="hero-title">Crafting Memorable Events</h1>
        <p className="hero-subtitle">
          Premium Catering & Event Services for Life's Special Moments
        </p>
        <div className="hero-buttons">
          {/* ✅ Primary Button - Now redirects to Events page */}
          <Link to="/events" className="premium-btn">
            Book Your Event
          </Link>
          {/* ✅ Secondary Button - Redirects to Catering page */}
          <Link to="/catering" className="premium-btn premium-btn-outline">
            Catering Services
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HeroSlider;