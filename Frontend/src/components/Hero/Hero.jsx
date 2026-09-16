import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import "./Hero.css";

const HERO_BANNERS = [
  {
    id: 1,
    tag: "NEW STREETWEAR DROP · 240+ GSM COTTON",
    title: "Oversized Streetwear Tees",
    subtitle: "Architectural boxy cuts, drop shoulder seams, and breathable bio-washed combed cotton.",
    badgePromo: "STARTING AT ₹899 · BIO-WASHED",
    primaryBtn: {
      text: "Shop Oversized",
      link: "/men?category=Oversized%20T-Shirts"
    },
    secondaryBtn: {
      text: "Explore Men",
      link: "/men"
    },
    image: "/images/hero-mens-oversized-tee.jpg",
    alt: "ZMW oversized streetwear graphic tee model"
  },
  {
    id: 2,
    tag: "LIMITED DROP · ARCHITECTONICS SERIES",
    title: "Heavyweight Graphic Drops",
    subtitle: "Precision high-density screen prints on 240 GSM combed cotton jersey for effortless everyday presence.",
    badgePromo: "FLAT ₹1,199 · LIMITED DROP",
    primaryBtn: {
      text: "Shop Graphic Tees",
      link: "/men?category=T-Shirts"
    },
    secondaryBtn: {
      text: "New Arrivals",
      link: "/collection?collection=new-arrivals"
    },
    image: "/images/hero-mens-tshirt-banner-2.jpg",
    alt: "ZMW heavyweight graphic streetwear drop model"
  },
  {
    id: 3,
    tag: "SIGNATURE CAPSULE · MINIMALIST SILHOUETTES",
    title: "Fluid Cuts & Modern Drapes",
    subtitle: "Pure combed cotton separates, relaxed drop shoulders, and effortless contemporary aesthetics.",
    badgePromo: "NEW SEASON · EDITORIAL EDIT",
    primaryBtn: {
      text: "Shop Women",
      link: "/women"
    },
    secondaryBtn: {
      text: "Explore Collection",
      link: "/collection?category=women"
    },
    image: "/images/cat-banner-womens.jpg",
    alt: "ZMW women's signature oversized graphic tee fashion model"
  }
];

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % HERO_BANNERS.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + HERO_BANNERS.length) % HERO_BANNERS.length);
  }, []);

  // 5-second clean automatic slide transition without layout jump
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused, nextSlide]);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = null;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    if (distance > 45) {
      nextSlide();
    } else if (distance < -45) {
      prevSlide();
    }
  };

  return (
    <section
      id="home"
      className="hero-section hero-clean-banner"
      aria-label="Featured Streetwear Banners"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="hero-slides-wrapper">
        {HERO_BANNERS.map((banner, index) => {
          const isActive = index === currentSlide;
          return (
            <div
              key={banner.id}
              className={`hero-slide-item ${isActive ? "active" : ""} hero-slide-${banner.id}`}
              aria-hidden={!isActive}
            >
              {/* Full-bleed background image with clear model visibility */}
              <div className="hero-backdrop">
                <img
                  src={banner.image}
                  alt={banner.alt}
                  className="hero-backdrop-img"
                  loading={index === 0 ? "eager" : "lazy"}
                />
                {/* Subtle scrim ensuring clothing details stay bright and text is crisp */}
                <div className="hero-backdrop-scrim" />
              </div>

              {/* Clean, balanced content container */}
              <div className="container hero-container">
                <div className="hero-content-box">
                  {/* Category / Collection Tag & Promo Pill */}
                  <div className="hero-tag-wrap">
                    <span className="hero-tag-badge">{banner.tag}</span>
                    <span className="hero-promo-pill">{banner.badgePromo}</span>
                  </div>

                  {/* Clean, bold product headline */}
                  <h1 className="hero-headline">{banner.title}</h1>

                  {/* Short product description */}
                  <p className="hero-subtitle">{banner.subtitle}</p>

                  {/* Clean, professional CTA buttons */}
                  <div className="hero-cta-group">
                    <Link to={banner.primaryBtn.link} className="hero-btn-primary">
                      {banner.primaryBtn.text}
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="7" y1="17" x2="17" y2="7" />
                        <polyline points="7 7 17 7 17 17" />
                      </svg>
                    </Link>
                    <Link to={banner.secondaryBtn.link} className="hero-btn-secondary">
                      {banner.secondaryBtn.text}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Slide Navigation Arrows — vertically centered, one on each side */}
      <button
        type="button"
        className="hero-nav-arrow hero-nav-arrow-prev"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          prevSlide();
        }}
        aria-label="Previous Slide"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <button
        type="button"
        className="hero-nav-arrow hero-nav-arrow-next"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          nextSlide();
        }}
        aria-label="Next Slide"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>

      {/* Slide Dot Indicators */}
      <div className="hero-dots-wrap" role="tablist" aria-label="Hero slide indicators">
        {HERO_BANNERS.map((banner, index) => (
          <button
            key={banner.id}
            type="button"
            role="tab"
            aria-selected={index === currentSlide}
            aria-label={`Go to slide ${index + 1}: ${banner.title}`}
            className={`hero-dot-btn ${index === currentSlide ? "active" : ""}`}
            onClick={() => setCurrentSlide(index)}
          />
        ))}
      </div>
    </section>
  );
}
