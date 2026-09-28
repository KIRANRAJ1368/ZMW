"use strict";

/**
 * Storefront home page sequence change:
 *   Hero -> New Arrivals -> remaining sections
 *
 * The storefront sorts home page sections by `sort_order`, so existing rows
 * are re-sequenced here. "Explore by Department" (category_visuals) is pushed
 * to the end of the sequence only; it is not deactivated and no data is
 * removed, so the admin control for it keeps working exactly as before.
 */
const SEQUENCE = [
  "hero",
  "new_arrivals",
  "mens_categories",
  "womens_categories",
  "boys_categories",
  "girls_categories",
  "babies_categories",
  "best_sellers",
  "category_visuals",
  "newsletter",
  "instagram_showcase"
];

module.exports = {
  up: async (queryInterface) => {
    for (let index = 0; index < SEQUENCE.length; index += 1) {
      await queryInterface.sequelize.query(
        "UPDATE homepage_sections SET sort_order = :sortOrder WHERE section_key = :sectionKey",
        { replacements: { sortOrder: index, sectionKey: SEQUENCE[index] } }
      );
    }
  },

  down: async (queryInterface) => {
    const previous = {
      hero: 0,
      category_visuals: 1,
      mens_categories: 2,
      womens_categories: 3,
      boys_categories: 4,
      girls_categories: 5,
      babies_categories: 6,
      new_arrivals: 7,
      best_sellers: 8,
      newsletter: 9,
      instagram_showcase: 10
    };
    for (const [sectionKey, sortOrder] of Object.entries(previous)) {
      await queryInterface.sequelize.query(
        "UPDATE homepage_sections SET sort_order = :sortOrder WHERE section_key = :sectionKey",
        { replacements: { sortOrder, sectionKey } }
      );
    }
  }
};
