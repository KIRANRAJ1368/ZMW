"use strict";

// Placement keys match exactly what the existing Collection.jsx page
// already keys its BANNER_CONFIG by, so swapping the frontend over to
// fetching this from the API later is a drop-in replacement.
const BANNERS = [
  {
    placement: "mens",
    image_url: "/images/banner-mens.jpg",
    image_position: "center center",
    tag: "MENS' EDIT · EVERYDAY ESSENTIALS",
    badge_promo: "STARTING AT ₹899 · CODE ZMW200",
    title: "Round Necks, Polos & Hoodies.",
    subtitle: "Heavyweight cotton tees, crisp polos, and premium hoodies cut for a clean, modern everyday fit.",
    primary_cta_text: "Shop the Collection",
    primary_cta_link: "#collection-catalog",
    secondary_cta_text: "Shop Best Sellers",
    secondary_cta_link: "/collection?collection=best-sellers"
  },
  {
    placement: "women",
    image_url: "/images/banner-womens.jpg",
    image_position: "center center",
    tag: "WOMEN'S EDIT · CONTEMPORARY TEES",
    badge_promo: "STARTING AT ₹799 · FLAT 10% OFF",
    title: "Artistic Prints, Deliberately Styled.",
    subtitle: "Chic relaxed fits, breathable combed cotton, and modern minimalist artwork.",
    primary_cta_text: "Shop the Collection",
    primary_cta_link: "#collection-catalog",
    secondary_cta_text: "Shop Best Sellers",
    secondary_cta_link: "/collection?collection=best-sellers"
  },
  {
    placement: "boys",
    image_url: "/images/banner-boys.jpg",
    image_position: "center center",
    tag: "BOYS' EDIT · PLAYFUL ESSENTIALS",
    badge_promo: "STARTING AT ₹599 · FREE SHIPPING",
    title: "Built For Play, Made To Last.",
    subtitle: "Round necks, high necks, shorts, sweatshirts and hoodies in super-soft organic cotton.",
    primary_cta_text: "Shop the Collection",
    primary_cta_link: "#collection-catalog",
    secondary_cta_text: "Shop Girl's Edit",
    secondary_cta_link: "/collection?category=girls"
  },
  {
    placement: "girls",
    image_url: "/images/banner-girls.jpg",
    image_position: "center center",
    tag: "GIRLS' EDIT · SWEET ESSENTIALS",
    badge_promo: "STARTING AT ₹599 · FLAT ₹200 OFF",
    title: "Fresh & Playful, Comfort First.",
    subtitle: "Round necks, high necks, shorts, nightwear and long gowns in breathable soft cotton.",
    primary_cta_text: "Shop the Collection",
    primary_cta_link: "#collection-catalog",
    secondary_cta_text: "Shop Boys' Edit",
    secondary_cta_link: "/collection?category=boys"
  },
  {
    placement: "babies",
    image_url: "/images/banner-babies.jpg",
    image_position: "center center",
    tag: "BABIES' EDIT · TINY & SOFT",
    badge_promo: "STARTING AT ₹449 · CODE ZMW10",
    title: "Gentle Layers, Made For Baby.",
    subtitle: "Rompers, tees, pyjamas, sweatshirts, hoodies and bottoms in buttery-soft baby-safe cotton.",
    primary_cta_text: "Shop the Collection",
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
