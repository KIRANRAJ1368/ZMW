import React from "react";
import { Link } from "react-router-dom";
import "./CategoryStories.css";

const CATEGORY_STORIES = [
  {
    id: "story-oversized",
    title: "Oversized Tees",
    badge: "HOT 🔥",
    badgeType: "hot",
    image: "/images/hero-mens-oversized-tee.jpg",
    link: "/collection?category=mens"
  },
  {
    id: "story-graphic",
    title: "Graphic Tees",
    badge: "NEW ✨",
    badgeType: "new",
    image: "/images/hero-mens-tshirt-banner-2.jpg",
    link: "/collection?category=mens"
  },
  {
    id: "story-polo",
    title: "Polo Oversized",
    badge: "TRENDING",
    badgeType: "gold",
    image: "/images/photo-1578587018452-892bacefd3f2.jpg",
    link: "/collection?category=mens"
  },
  {
    id: "story-hoodies",
    title: "Hoodies & Sweats",
    badge: "WINTER '25",
    badgeType: "sale",
    image: "/images/photo-1556821840-3a63f95609a7.jpg",
    link: "/collection?category=mens"
  },
  {
    id: "story-cargos",
    title: "Relaxed Joggers",
    badge: "POPULAR",
    badgeType: "hot",
    image: "/images/photo-1552902865-b72c031ac5ea.jpg",
    link: "/collection?category=mens"
  },
  {
    id: "story-anime",
    title: "Anime & Pop Edits",
    badge: "EXCLUSIVE",
    badgeType: "new",
    image: "/images/photo-1576566588028-4147f3842f27.jpg",
    link: "/collection?category=mens"
  },
  {
    id: "story-women",
    title: "Women Drops",
    badge: "VIRAL",
    badgeType: "gold",
    image: "/images/photo-1741816219933-2bf406bc9739.jpg",
    link: "/collection?category=women"
  },
  {
    id: "story-bestsellers",
    title: "Top 10 Picks",
    badge: "BEST SELLER",
    badgeType: "sale",
    image: "/images/photo-1521572163474-6864f9cf17ab.jpg",
    link: "/collection?collection=best-sellers"
  }
];

export default function CategoryStories() {
  return (
    <section className="category-stories-section" aria-label="Explore Popular Collections">
      <div className="container">
        <div className="category-stories-header">
          <div className="stories-title-wrap">
            <span className="stories-kicker">
              <span className="live-dot" /> TRENDING DROPS
            </span>
            <h2 className="stories-heading">Shop By Collection</h2>
          </div>
          <Link to="/collection" className="stories-view-all">
            View All Categories
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </Link>
        </div>

        <div className="category-stories-track">
          {CATEGORY_STORIES.map((item) => (
            <Link key={item.id} to={item.link} className="story-item">
              <div className="story-ring">
                <div className="story-avatar-box">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="story-avatar-img"
                    loading="lazy"
                  />
                </div>
                {item.badge && (
                  <span className={`story-badge badge-${item.badgeType}`}>
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="story-title">{item.title}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
