"use strict";

// Placement keys match exactly what the existing Collection.jsx page
// already keys its BANNER_CONFIG by, so swapping the frontend over to
// fetching this from the API later is a drop-in replacement.
const BANNERS = [
  {
    placement: "mens",
    image_url: "/images/banner-mens.jpg",
    image_position: "85% top",
    tag: "★ NEW ARRIVALS · SEASON 2026",
    badge_promo: "FLAT 25% OFF · AUTO-APPLIED",
    title: "NEW SEASON STYLES",
    subtitle: "Heavyweight 280 GSM drops with relaxed drop-shoulder silhouettes, modern street aesthetics, and all-day comfort.",
    primary_cta_text: "EXPLORE NOW",
    primary_cta_link: "#collection-catalog",
    secondary_cta_text: "Shop Best Sellers",
    secondary_cta_link: "/collection?collection=best-sellers"
  },
  {
    placement: "women",
    image_url: "/images/banner-womens.jpg",
    image_position: "85% top",
    tag: "★ NEW ARRIVALS · SEASON 2026",
    badge_promo: "FLAT 25% OFF · AUTO-APPLIED",
    title: "CONTEMPORARY CHIC",
    subtitle: "Chic relaxed drop-shoulder fits, ultra-breathable pure combed cotton, and modern minimalist artwork.",
    primary_cta_text: "EXPLORE NOW",
    primary_cta_link: "#collection-catalog",
    secondary_cta_text: "Shop Best Sellers",
    secondary_cta_link: "/collection?collection=best-sellers"
  },
  {
    placement: "boys",
    image_url: "/images/banner-boys.jpg",
    image_position: "85% top",
    tag: "⚡ PLAYFUL DROPS · SEASON 2026",
    badge_promo: "STARTING AT ₹599 · FREE SHIPPING",
    title: "BUILT FOR PLAY",
    subtitle: "High-energy graphic streetwear hoodies, durable reinforced seams, and super-soft bio-washed cotton.",
    primary_cta_text: "EXPLORE NOW",
    primary_cta_link: "#collection-catalog",
    secondary_cta_text: "Shop Girl's Edit",
    secondary_cta_link: "/collection?category=girls"
  },
  {
    placement: "girls",
    image_url: "/images/banner-girls.jpg",
    image_position: "85% top",
    tag: "★ SWEET & TRENDY · SEASON 2026",
    badge_promo: "FLAT 20% OFF · AUTO-APPLIED",
    title: "FRESH & PLAYFUL",
    subtitle: "Cheerful graphic sweatshirts, soft high-necks, trendy matching sets, and gentle skin-friendly organic cotton.",
    primary_cta_text: "EXPLORE NOW",
    primary_cta_link: "#collection-catalog",
    secondary_cta_text: "Shop Boys' Edit",
    secondary_cta_link: "/collection?category=boys"
  },
  {
    placement: "babies",
    image_url: "/images/banner-babies.jpg",
    image_position: "85% top",
    tag: "♥ TINY & SOFT · 100% BABY-SAFE",
    badge_promo: "STARTING AT ₹449 · HYPOALLERGENIC",
    title: "GENTLE ESSENTIALS",
    subtitle: "Cozy ribbed rompers, buttery-soft pyjamas, and stretch bottoms crafted in pure hypoallergenic organic cotton.",
    primary_cta_text: "EXPLORE NOW",
    primary_cta_link: "#collection-catalog",
    secondary_cta_text: "Shop Girl's Edit",
    secondary_cta_link: "/collection?category=girls"
  },
  {
    placement: "best-sellers",
    image_url: "/images/hero-mens-tshirt-banner-2.jpg",
    image_position: "center 20%",
    tag: "HAND-PICKED FAVOURITES · COMMUNITY TOP PICKS",
    badge_promo: "TOP RATED · BEST LOVED",
    title: "The Ones Everyone's Talking About.",
    subtitle: "Curated from real reviews, real wears, and real bestselling data across our full catalogue.",
    primary_cta_text: "Shop Best Sellers",
    primary_cta_link: "#collection-catalog",
    secondary_cta_text: "Explore New Arrivals",
    secondary_cta_link: "/collection?collection=new-arrivals"
  }
];

module.exports = {
  up: async (queryInterface) => {
    const [existing] = await queryInterface.sequelize.query("SELECT id FROM banners LIMIT 1");
    if (existing.length > 0) {
      console.log("Banners already seeded — skipping.");
      return;
    }

    const now = new Date();
    await queryInterface.bulkInsert(
      "banners",
      BANNERS.map((b, idx) => ({
        placement: b.placement,
        tag: b.tag,
        title: b.title,
        subtitle: b.subtitle,
        badge_promo: b.badge_promo,
        image_url: b.image_url,
        image_position: b.image_position,
        primary_cta_text: b.primary_cta_text,
        primary_cta_link: b.primary_cta_link,
        secondary_cta_text: b.secondary_cta_text,
        secondary_cta_link: b.secondary_cta_link,
        sort_order: idx,
        is_active: true,
        created_at: now,
        updated_at: now
      }))
    );
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete("banners", null);
  }
};
