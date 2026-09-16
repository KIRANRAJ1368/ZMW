import React from "react";
import { Link } from "react-router-dom";
import "./CategoryVisuals.css";

const CATEGORIES_DATA = [
  {
    id: "cat-men",
    title: "Men",
    subtitle: "Oversized Tees, Polos & Hoodies",
    itemCount: "44+ Styles",
    badge: "TRENDING",
    image: "/images/dept-mens.jpg",
    imagePosition: "center 18%",
    link: "/men"
  },
  {
    id: "cat-women",
    title: "Women",
    subtitle: "Crop Tops, Tees & Chic Fits",
    itemCount: "58+ Styles",
    badge: "HOT DROP",
    image: "/images/dept-womens.jpg",
    imagePosition: "center 18%",
    link: "/women"
  },
  {
    id: "cat-boys",
    title: "Boys",
    subtitle: "Skate Tees, Sets & Shorts",
    itemCount: "32+ Styles",
    badge: "POPULAR",
    image: "/images/dept-boys.jpg",
    imagePosition: "center 10%",
    link: "/kids?category=Boys"
  },
  {
    id: "cat-girls",
    title: "Girls",
    subtitle: "Dresses, Sets & Pretty Tees",
    itemCount: "30+ Styles",
    badge: "NEW",
    image: "/images/dept-girls.jpg",
    imagePosition: "center 18%",
    link: "/kids?category=Girls"
  },
  {
    id: "cat-babies",
    title: "Babies",
    subtitle: "Rompers, Pyjamas & Soft Knits",
    itemCount: "26+ Styles",
    badge: "100% SOFT",
    image: "/images/dept-babies.jpg",
    imagePosition: "center 15%",
    link: "/kids?category=Babies"
  }
];

export default function CategoryVisuals() {
  return (
    <section className="category-visuals-section" aria-label="Shop by Department">
      <div className="container">
        {/* Left-Aligned Section Header */}
        <div className="section-header-left">
          <div className="section-eyebrow-badge">
            <span className="eyebrow-dot" />
            <span className="eyebrow-text">DISCOVER APPAREL</span>
          </div>
          <h2 className="section-heading-title">Explore by Department</h2>
          <p className="section-heading-subtitle">
            Curated wardrobe essentials crafted for iconic style — Men, Women, Boys, Girls &amp; Babies.
          </p>
        </div>

        {/* 5-Card Grid: Men, Women, Boys, Kids, Babies */}
        <div className="category-visuals-grid">
          {CATEGORIES_DATA.map((cat) => (
            <Link key={cat.id} to={cat.link} className="category-visual-card">
              <div className="visual-card-image-wrap">
                <img
                  src={cat.image}
                  alt={`${cat.title} Clothing Collection`}
                  className="visual-card-img"
                  style={cat.imagePosition ? { objectPosition: cat.imagePosition } : undefined}
                  loading="lazy"
                />
                <div className="visual-card-gradient" />
                <span className="visual-badge">{cat.badge}</span>
              </div>

              <div className="visual-card-info">
                <div className="visual-card-text">
                  <span className="visual-count">{cat.itemCount}</span>
                  <h3 className="visual-dept-name">{cat.title}</h3>
                  <p className="visual-dept-desc">{cat.subtitle}</p>
                </div>
                <div className="visual-arrow-circle">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8">
                    <line x1="7" y1="17" x2="17" y2="7" />
                    <polyline points="7 7 17 7 17 17" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
