/**
 * Catalog fixture mirroring the real serialized shape, including the cases that
 * used to leak: products with no subcategory, a "T-shirt" subcategory whose
 * productType is the plural "T-Shirts", and subcategory names that repeat
 * across departments.
 *
 * `originalPrice` is normally equal to `price` (no discount). Pass it explicitly
 * to model a genuine discounted product, where originalPrice > price.
 */

export const CATEGORIES = [
  {
    slug: "mens",
    name: "Mens",
    is_active: true,
    show_on_homepage: true,
    subcategories: [
      { id: 2, name: "Round Neck T-shirt", slug: "round-neck-t-shirt" },
      { id: 3, name: "Polo T-shirt", slug: "polo-t-shirt" },
      { id: 4, name: "Mens Hoodies", slug: "mens-hoodies" }
    ]
  },
  {
    slug: "women",
    name: "Women",
    is_active: true,
    show_on_homepage: true,
    subcategories: [
      { id: 5, name: "Round Neck", slug: "round-neck" },
      { id: 6, name: "V Neck", slug: "v-neck" },
      { id: 7, name: "Women's Hoodies", slug: "women-s-hoodies" },
      { id: 8, name: "Women's Tees", slug: "women-s-tees" }
    ]
  },
  {
    slug: "boys",
    name: "Boys",
    is_active: true,
    show_on_homepage: true,
    subcategories: [
      { id: 9, name: "Round Neck", slug: "round-neck" },
      { id: 10, name: "High Neck", slug: "high-neck" },
      { id: 11, name: "Shorts", slug: "shorts" },
      { id: 13, name: "Hoodies", slug: "hoodies" }
    ]
  },
  {
    slug: "girls",
    name: "Girls",
    is_active: true,
    show_on_homepage: true,
    subcategories: [
      { id: 14, name: "Round Neck", slug: "round-neck" },
      { id: 16, name: "Shorts", slug: "shorts" },
      { id: 20, name: "Long Gown", slug: "long-gown" }
    ]
  },
  {
    slug: "babies",
    name: "Babies",
    is_active: true,
    show_on_homepage: true,
    subcategories: [
      { id: 21, name: "Romper", slug: "romper" },
      { id: 22, name: "T-shirt", slug: "t-shirt" },
      { id: 23, name: "Babies Pyjama", slug: "babies-pyjama" },
      { id: 25, name: "Babies Hoodies", slug: "babies-hoodies" }
    ]
  }
];

let seq = 0;
const product = (category, subCategory, productType, extra = {}) => {
  seq += 1;
  return {
    id: `p${seq}`,
    name: `${subCategory || "Unlinked"} Item ${seq}`,
    category,
    subCategory,
    productType,
    price: extra.price ?? 100 + seq,
    originalPrice: extra.originalPrice ?? extra.price ?? 100 + seq,
    rating: 4.5,
    reviewCount: 10,
    inStock: extra.inStock ?? true,
    stockCount: 5,
    isBestSeller: false,
    isNewArrival: false,
    isSale: false,
    isNew: false,
    images: [`/images/p${seq}.jpg`],
    colors: extra.colors || [{ id: `c${seq}`, name: "Black", hex: "#000000" }],
    sizes: extra.sizes || ["S", "M", "L"],
    createdAt: "2026-01-01T00:00:00.000Z",
    ...extra
  };
};

// "sub" === null models a product with subcategory_id NULL in the database.
export const PRODUCTS = [
  // mens - the last one carries a genuine MRP so the sale-price path is covered
  product("mens", "Round Neck T-shirt", "T-Shirts"),
  product("mens", "Round Neck T-shirt", "T-Shirts", { price: 30, originalPrice: 45 }),
  product("mens", "Polo T-shirt", "Polos"),
  product("mens", "Mens Hoodies", "Hoodies", { price: 60, originalPrice: 80 }),
  product("mens", null, "Joggers", { price: 20 }),
  product("mens", null, "Sweatshirts", { price: 25 }),

  // women
  product("women", "Women's Tees", "T-Shirts"),
  product("women", "Women's Tees", "T-Shirts", { price: 45 }),
  product("women", null, "Co-ords", { price: 70 }),

  // boys - note the same subcategory names as girls
  product("boys", "Round Neck", "T-Shirts"),
  product("boys", "Shorts", "T-Shirts", { price: 40 }),
  product("boys", "Hoodies", "Hoodies", { price: 55 }),

  // girls
  product("girls", "Round Neck", "T-Shirts"),
  product("girls", "Shorts", "T-Shirts", { price: 42 }),
  product("girls", "Long Gown", "T-Shirts", { price: 80 }),

  // babies - "T-shirt" subcategory with a plural "T-Shirts" product type:
  // the case that used to pull in Babies Pyjama.
  product("babies", "Romper", "Sets"),
  product("babies", "T-shirt", "T-Shirts", { price: 35 }),
  product("babies", "Babies Pyjama", "T-Shirts", { price: 38 }),
  product("babies", "Babies Hoodies", "Hoodies", { price: 50 })
];

export const HOME_DATA = {
  sections: [],
  categories: CATEGORIES,
  banners: {},
  newArrivals: [],
  bestSellers: []
};

/** Ground truth: the products that truly belong to a subcategory. */
export function expectedProducts(categorySlug, subcategoryName) {
  return PRODUCTS.filter(
    (p) => p.category === categorySlug && p.subCategory === subcategoryName
  );
}
