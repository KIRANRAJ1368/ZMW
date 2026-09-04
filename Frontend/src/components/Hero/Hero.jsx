import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import "./Hero.css";

const HERO_BANNERS = [
  {
    id: 1,
    badge: "NEW DROP 2026 · OVERSIZED SERIES",
    titlePrefix: "Oversized Graphics,",
    titleHighlight: "Deliberately Cut.",
    subtitle: "Heavyweight cotton, drop-shoulder fits, modern artwork.",
    primaryBtn: {
      text: "Shop Oversized Tees",
      link: "/men?category=Oversized%20T-Shirts",
    },
    secondaryBtn: {
      text: "Explore Men's Edit",
      link: "/men",
    },
    image: "/images/hero-mens-oversized-tee.jpg",
    alt: "Male model wearing an oversized graphic T-shirt in a modern architectural space",
    imagePosition: "84% 20%",
  },
  {
    id: 2,
    badge: "NEW SEASON · GRAPHIC ARCHITECTURE",
    titlePrefix: "Urban Streetwear,",
    titleHighlight: "Architectural Cuts.",
    subtitle: "Heavyweight 280 GSM cotton, modern graphics, and relaxed boxy fits.",
    primaryBtn: {
      text: "Shop Graphic Tees",
      link: "/men?category=Oversized%20T-Shirts",
    },
    secondaryBtn: {
      text: "Explore Men's Edit",
      link: "/men",
    },
    image: "/images/hero-mens-tshirt-banner-2.jpg",
    alt: "Male model wearing a washed charcoal architectural graphic T-shirt",
    imagePosition: "78% 20%",
  },
  {
    id: 3,
    badge: "SUMMER DROP · MINIMALIST CAPSULE",
    titlePrefix: "Modern Silhouettes,",
    titleHighlight: "Signature Comfort.",
    subtitle: "Pure combed cotton, relaxed drop shoulders, and clean contemporary aesthetics.",
    primaryBtn: {
      text: "Shop Premium Tees",
      link: "/men?category=Oversized%20T-Shirts",
    },
    secondaryBtn: {
      text: "Explore Men's Edit",
      link: "/men",
    },
    image: "/images/hero-mens-tshirt-banner-3.jpg",
    alt: "Male model wearing a premium cream minimalist oversized T-shirt",
    imagePosition: "82% 20%",
  },
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

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 5500);
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
    const minSwipeDistance = 45;
    if (distance > minSwipeDistance) {
      nextSlide();
    } else if (distance < -minSwipeDistance) {
      prevSlide();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowLeft") {
      prevSlide();
    } else if (e.key === "ArrowRight") {
      nextSlide();
    }
  };

  return (
    <section
      id="home"
      className="hero-section hero-single-banner hero-carousel-section"
      aria-label="New Season Hero Banners"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div className="hero-slides-wrapper">
        {HERO_BANNERS.map((banner, index) => {
          const isActive = index === currentSlide;
          return (
            <div
              key={banner.id}
              className={`hero-slide-item ${isActive ? "active" : ""}`}
              aria-hidden={!isActive}
            >
              {/* Full-bleed background with male model in attractive men's t-shirt */}
              <div className="hero-backdrop">
                <img
                  src={banner.image}
                  alt={banner.alt}
                  className="hero-backdrop-img"
                  style={{ objectPosition: banner.imagePosition }}
                  loading={index === 0 ? "eager" : "lazy"}
                />
                <div className="hero-backdrop-scrim" />
                <div className="hero-radial-glow" />
              </div>

              {/* Hero Content — Perfectly aligned editorial typography & buttons */}
              <div className="container hero-container">
                <div className="hero-content">
                  {/* Eyebrow badge */}
                  <div className="hero-kicker-wrapper">
                    <span className="hero-kicker-badge">
                      <span className="kicker-pulse-dot" />
                      {banner.badge}
                    </span>
                  </div>

                  {/* Headline */}
                  <h1 className="hero-title">
                    {banner.titlePrefix} <br />
                    <span className="hero-title-highlight">{banner.titleHighlight}</span>
                  </h1>

                  {/* Subtitle — Clean and minimal */}
                  <p className="hero-subtitle">{banner.subtitle}</p>

                  {/* Properly aligned Action Buttons */}
                  <div className="hero-cta-group">
                    <Link
                      to={banner.primaryBtn.link}
                      className="btn btn-hero-primary btn-lg"
                      tabIndex={isActive ? 0 : -1}
                    >
                      {banner.primaryBtn.text}
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        aria-hidden="true"
                      >
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                        <polyline points="12 5 19 12 12 19"></polyline>
                      </svg>
                    </Link>

                    <Link
                      to={banner.secondaryBtn.link}
                      className="btn btn-hero-secondary btn-lg"
                      tabIndex={isActive ? 0 : -1}
                    >
                      {banner.secondaryBtn.text}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Slider Navigation Arrows */}
      <button
        type="button"
        className="hero-nav-arrow hero-nav-prev"
        onClick={prevSlide}
        aria-label="Previous banner"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>

      <button
        type="button"
        className="hero-nav-arrow hero-nav-next"
        onClick={nextSlide}
        aria-label="Next banner"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>

      {/* Slider Dot Indicators */}
      <div className="hero-dots-container" role="tablist" aria-label="Banner slides">
        {HERO_BANNERS.map((banner, index) => (
          <button
            key={banner.id}
            type="button"
            role="tab"
            aria-selected={index === currentSlide}
            aria-label={`Go to slide ${index + 1}: ${banner.titlePrefix} ${banner.titleHighlight}`}
            className={`hero-dot ${index === currentSlide ? "active" : ""}`}
            onClick={() => setCurrentSlide(index)}
          />
        ))}
      </div>
    </section>
  );
}
