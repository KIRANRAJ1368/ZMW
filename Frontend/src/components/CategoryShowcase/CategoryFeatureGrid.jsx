import React from "react";
import { Link } from "react-router-dom";
import "./CategoryFeatureGrid.css";

const MEN_CARDS = [
  {
    id: "men-round-neck",
    title: "Round Neck T-shirt",
    tag: "100% COMBED COTTON",
    image: "/images/cat-men-round-neck.jpg",
    imagePosition: "center 22%",
    link: "/collection?category=mens&type=round%20neck%20t-shirt"
  },
  {
    id: "men-polo",
    title: "Polo T-shirt",
    tag: "CLASSIC PIQUE POLO",
    image: "/images/cat-men-polo.jpg",
    imagePosition: "center 20%",
    link: "/collection?category=mens&type=polo%20t-shirt"
  },
  {
    id: "men-hoodie",
    title: "Mens Hoodies",
    tag: "380 GSM FLEECE",
    image: "/images/cat-men-hoodie.jpg",
    imagePosition: "center 20%",
    link: "/collection?category=mens&type=mens%20hoodies"
  }
];

const WOMEN_CARDS = [
  {
    id: "women-round-neck",
    title: "Round Neck",
    tag: "SOFT JERSEY FIT",
    image: "/images/cat-women-round-neck.jpg",
    imagePosition: "center 20%",
    link: "/collection?category=women&type=round%20neck"
  },
  {
    id: "women-v-neck",
    title: "V Neck",
    tag: "FLATTERING NECKLINE",
    image: "/images/cat-women-v-neck.jpg",
    imagePosition: "center 20%",
    link: "/collection?category=women&type=v%20neck"
  },
  {
    id: "women-hoodie",
    title: "Women's Hoodies",
    tag: "BRUSHED FLEECE",
    image: "/images/cat-women-hoodie.jpg",
    imagePosition: "center 20%",
    link: "/collection?category=women&type=women's%20hoodies"
  },
  {
    id: "women-tees",
    title: "Women's Tees",
    tag: "EVERYDAY ESSENTIALS",
    image: "/images/cat-women-tees.jpg",
    imagePosition: "center 20%",
    link: "/collection?category=women&type=women's%20tees"
  }
];

/* ── Section 3: Men's Categories Export ── */
export function MensCategoriesSection() {
  return (
    <section className="category-feature-section mens-feature-section" aria-label="Men's Categories">
      <div className="container">
        <div className="section-header-left">
          <div className="section-eyebrow-badge">
            <span className="eyebrow-dot" />
            <span className="eyebrow-text">MENS' ESSENTIALS</span>
          </div>
          <h2 className="section-heading-title">Men's Categories</h2>
          <p className="section-heading-subtitle">
            Crew-neck tees, crisp polos, and heavyweight fleece hoodies — everyday essentials cut for a clean, modern fit.
          </p>
        </div>

        <div className="cat-feature-grid">
          {MEN_CARDS.map((card) => (
            <Link key={card.id} to={card.link} className="cat-feature-card">
              <div className="cat-feature-img-wrap">
                <img
                  src={card.image}
                  alt={card.title}
                  className="cat-feature-img"
                  loading="lazy"
                  style={card.imagePosition ? { objectPosition: card.imagePosition } : undefined}
                />
                <div className="cat-feature-overlay" />
                <span className="cat-feature-tag">{card.tag}</span>
              </div>
              <div className="cat-feature-caption">
                <h3 className="cat-feature-name">{card.title}</h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Section 4: Women's Categories Export ── */
export function WomensCategoriesSection() {
  return (
    <section className="category-feature-section womens-feature-section" aria-label="Women's Categories">
      <div className="container">
        <div className="section-header-left">
          <div className="section-eyebrow-badge">
            <span className="eyebrow-dot" />
            <span className="eyebrow-text">WOMEN'S ESSENTIALS</span>
          </div>
          <h2 className="section-heading-title">Women's Categories</h2>
          <p className="section-heading-subtitle">
            Round necks, v-necks, hoodies, and tees in soft combed cotton for an easy, elevated everyday look.
          </p>
        </div>

        <div className="cat-feature-grid cat-feature-grid--four">
          {WOMEN_CARDS.map((card) => (
            <Link key={card.id} to={card.link} className="cat-feature-card">
              <div className="cat-feature-img-wrap">
                <img
                  src={card.image}
                  alt={card.title}
                  className="cat-feature-img"
                  loading="lazy"
                  style={card.imagePosition ? { objectPosition: card.imagePosition } : undefined}
                />
                <div className="cat-feature-overlay" />
                <span className="cat-feature-tag">{card.tag}</span>
              </div>
              <div className="cat-feature-caption">
                <h3 className="cat-feature-name">{card.title}</h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Main CategoryFeatureGrid Export (Backwards Compatible) ── */
export default function CategoryFeatureGrid() {
  return (
    <>
      <MensCategoriesSection />
      <WomensCategoriesSection />
    </>
  );
}
