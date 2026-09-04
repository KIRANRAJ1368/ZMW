/**
 * ZMW Luxury Fashion Product Catalog
 * Rich editorial products with multi-view photos, color swatches, sizes, ratings, and tags.
 * High-resolution professional fashion photography with prominent clothing focus.
 */

export const PRODUCTS = [
  {
    id: "zmw-001",
    name: "French Linen Tailored Oversized Shirt",
    category: "T-Shirt",
    badge: "Best Seller",
    badgeType: "hot",
    price: 88,
    originalPrice: 110,
    rating: 4.9,
    reviewCount: 142,
    sku: "ZMW-MEN-01",
    inStock: true,
    stockCount: 18,
    isNew: false,
    isSale: true,
    isBestSeller: true,
    images: [
      "https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=900&q=85"
    ],
    colors: [
      { name: "Terracotta Earth", hex: "#B85D38" },
      { name: "Raw Sand Linen", hex: "#E4DCB8" },
      { name: "Charcoal Slate", hex: "#2C2B27" }
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    description: "Tailored from 100% Normandy flax linen with natural slub texture, pre-washed for effortless drape. Features a crisp spread collar and natural horn buttons."
  },
  {
    id: "zmw-002",
    name: "Liquid Silk Bias-Cut Slip Dress",
    category: "Dress",
    badge: "New Drop",
    badgeType: "new",
    price: 215,
    originalPrice: null,
    rating: 5.0,
    reviewCount: 56,
    sku: "ZMW-DRS-02",
    inStock: true,
    stockCount: 12,
    isNew: true,
    isSale: false,
    isBestSeller: true,
    images: [
      "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=900&q=85"
    ],
    colors: [
      { name: "Champagne Cream", hex: "#F2EBE0" },
      { name: "Olive Earth", hex: "#6E7A67" },
      { name: "Obsidian Black", hex: "#161514" }
    ],
    sizes: ["XS", "S", "M", "L"],
    description: "Liquid silk-crepe woven in Como, Italy. Cut precisely on the bias to skim the silhouette with fluid elegance. Hand-finished delicate rouleau straps."
  },
  {
    id: "zmw-003",
    name: "Emerald Silk Couture Saree Ensemble",
    category: "Dress",
    badge: "Limited Edition",
    badgeType: "hot",
    price: 340,
    originalPrice: 420,
    rating: 5.0,
    reviewCount: 39,
    sku: "ZMW-ETH-03",
    inStock: true,
    stockCount: 6,
    isNew: true,
    isSale: false,
    isBestSeller: true,
    images: [
      "https://images.unsplash.com/photo-1756483492198-8ca91227489b?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1742677143629-b9784beab2e1?auto=format&fit=crop&w=900&q=85"
    ],
    colors: [
      { name: "Emerald Gold", hex: "#1C5E40" },
      { name: "Royal Garnet", hex: "#781C26" },
      { name: "Midnight Navy", hex: "#121F36" }
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    description: "Bespoke pure mulberry silk saree gown featuring intricate zardozi hand embroidery along the borders and pallu. A timeless fusion of heritage craftsmanship and modern runway silhouette."
  },
  {
    id: "zmw-004",
    name: "Bespoke Sand Linen Tailored Blazer",
    category: "Top",
    badge: "Runway",
    badgeType: "new",
    price: 295,
    originalPrice: 360,
    rating: 4.9,
    reviewCount: 78,
    sku: "ZMW-BLZ-04",
    inStock: true,
    stockCount: 10,
    isNew: true,
    isSale: true,
    isBestSeller: true,
    images: [
      "https://images.unsplash.com/photo-1509319117193-57bab727e09d?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=900&q=85"
    ],
    colors: [
      { name: "Sand Beige", hex: "#D8CDBC" },
      { name: "Charcoal Ink", hex: "#22211F" },
      { name: "Navy Twill", hex: "#1D2B3A" }
    ],
    sizes: ["38R", "40R", "42R", "44R"],
    description: "Lightweight unstructured single-breasted blazer woven from Italian flax linen. Notch lapel, patch pockets, and unlined interior for effortless breathability."
  },
  {
    id: "zmw-005",
    name: "Sculpted Ribbed Merino Mockneck",
    category: "Top",
    badge: "Sale -20%",
    badgeType: "sale",
    price: 110,
    originalPrice: 138,
    rating: 4.8,
    reviewCount: 94,
    sku: "ZMW-TOP-05",
    inStock: true,
    stockCount: 15,
    isNew: false,
    isSale: true,
    isBestSeller: false,
    images: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=900&q=85"
    ],
    colors: [
      { name: "Warm Terracotta", hex: "#B85D38" },
      { name: "Ivory Cream", hex: "#FAF8F2" },
      { name: "Forest Olive", hex: "#2F4A37" }
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    description: "Extra-fine Australian merino wool with architectural compact ribbing. Designed to sculpt the frame while delivering supreme cloud-soft thermal comfort."
  },
  {
    id: "zmw-006",
    name: "Kids' Organic Linen Pastel Romper",
    category: "Dress",
    badge: "Boutique Kids",
    badgeType: "new",
    price: 64,
    originalPrice: 80,
    rating: 4.9,
    reviewCount: 88,
    sku: "ZMW-KID-06",
    inStock: true,
    stockCount: 22,
    isNew: true,
    isSale: true,
    isBestSeller: true,
    images: [
      "https://images.unsplash.com/photo-1746386914795-83d2febc9a96?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1763089402370-fb496fefdbb0?auto=format&fit=crop&w=900&q=85"
    ],
    colors: [
      { name: "Sage Mint", hex: "#9EB69E" },
      { name: "Oatmeal Cream", hex: "#ECE6DA" },
      { name: "Dusky Peach", hex: "#E8B2A2" }
    ],
    sizes: ["2-3Y", "3-4Y", "4-5Y", "5-6Y", "7-8Y"],
    description: "GOTS-certified organic cotton and linen weave. Ultra-soft on delicate skin, reinforced wooden button closures, and roomy silhouette for effortless movement."
  },
  {
    id: "zmw-007",
    name: "Liquid Charmeuse Pleated Maxi Skirt",
    category: "Skirt",
    badge: "Handcrafted",
    badgeType: "new",
    price: 168,
    originalPrice: null,
    rating: 5.0,
    reviewCount: 61,
    sku: "ZMW-SKT-07",
    inStock: true,
    stockCount: 16,
    isNew: true,
    isSale: false,
    isBestSeller: true,
    images: [
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=85"
    ],
    colors: [
      { name: "Oat Milk", hex: "#F3EDE3" },
      { name: "Terracotta Dusk", hex: "#C2703A" },
      { name: "Deep Espresso", hex: "#3A2A1E" }
    ],
    sizes: ["XS", "S", "M", "L"],
    description: "Weightless charmeuse skirt with finely gathered knife pleats that move fluidly with every step. Finished with a concealed side zip and a silky smooth inner slip for effortless drape."
  },
  {
    id: "zmw-008",
    name: "Relaxed Boxy Oxford Weave Shirt",
    category: "T-Shirt",
    badge: "Best Seller",
    badgeType: "hot",
    price: 96,
    originalPrice: 120,
    rating: 4.8,
    reviewCount: 129,
    sku: "ZMW-OXD-08",
    inStock: true,
    stockCount: 21,
    isNew: false,
    isSale: true,
    isBestSeller: true,
    images: [
      "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=900&q=85"
    ],
    colors: [
      { name: "Crisp White", hex: "#F7F5EF" },
      { name: "Sky Blue", hex: "#9BB8CC" },
      { name: "Charcoal Twill", hex: "#3B3B3B" }
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    description: "A relaxed, boxy-cut oxford woven from dense cotton twill with a soft garment wash. Mother-of-pearl buttons and a curved hem deliver easy, modern polish that layers or stands alone."
  }
];

export const COLLECTIONS_DATA = [
  {
    id: "col-women",
    title: "Women's Couture & Drapes",
    subtitle: "Liquid silks, structured linen separates, and heirloom sarees",
    itemCount: "58 styles",
    tag: "Trending",
    image: "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?auto=format&fit=crop&w=900&q=85"
  },
  {
    id: "col-men",
    title: "Men's Tailored Essentials",
    subtitle: "Unstructured linen blazers, relaxed trousers, and crisp shirts",
    itemCount: "44 styles",
    tag: "New Season",
    image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=900&q=85"
  },
  {
    id: "col-kids",
    title: "Kids' Boutique Collection",
    subtitle: "Organic cotton and breezy linen crafted for playful elegance",
    itemCount: "36 styles",
    tag: "Summer Drop",
    image: "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=900&q=85"
  },
  {
    id: "col-knitwear",
    title: "Artisanal Knitwear & Tops",
    subtitle: "Featherweight merino wool and breathable openwork weaves",
    itemCount: "32 styles",
    tag: "Luxury",
    image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=900&q=85"
  }
];

export const CATEGORY_SHOWCASE = [
  {
    id: "cat-men",
    title: "Men's Fashion",
    subtitle: "Sharp tailoring meets relaxed luxury",
    description: "From unstructured linen blazers and crisp French flax shirts to pleated trousers, our men's line blends Italian craftsmanship with modern silhouettes.",
    itemCount: "44 Curated Styles",
    image: "https://images.unsplash.com/photo-1506152983158-b4a74a01c721?auto=format&fit=crop&w=900&q=85",
    accentImage: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=500&q=85",
    href: "/men"
  },
  {
    id: "cat-women",
    title: "Women's Fashion",
    subtitle: "Editorial draping & timeless elegance",
    description: "Fluid silk bias dresses, rich designer sarees, and sculpted separates designed for the contemporary woman who values considered luxury.",
    itemCount: "58 Curated Styles",
    image: "https://images.unsplash.com/photo-1741816219933-2bf406bc9739?auto=format&fit=crop&w=900&q=85",
    accentImage: "https://images.unsplash.com/photo-1741250782029-2770cfaf666c?auto=format&fit=crop&w=500&q=85",
    href: "/women"
  },
  {
    id: "cat-kids",
    title: "Kids' Fashion",
    subtitle: "Playful comfort in premium natural fibres",
    description: "Soft organic cottons and breathable linen sets crafted for active little explorers. Vibrant, comfortable, and made to cherish.",
    itemCount: "36 Curated Styles",
    image: "https://images.unsplash.com/photo-1471286174890-9c112ffca5b4?auto=format&fit=crop&w=900&q=85",
    accentImage: "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?auto=format&fit=crop&w=500&q=85",
    href: "/kids"
  }
];

export const INSTAGRAM_SHOWCASE = [
  {
    id: "insta-1",
    image: "https://images.unsplash.com/photo-1496217590455-aa63a8350eea?auto=format&fit=crop&w=800&q=85",
    handle: "@zmw.studio",
    caption: "Sun-drenched tailoring & layered neutrals for effortless Mediterranean evenings.",
    likes: "3.4k"
  },
  {
    id: "insta-2",
    image: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=85",
    handle: "@zmw.studio",
    caption: "Flowing silk separates — the new summer wardrobe capsule.",
    likes: "5.8k"
  },
  {
    id: "insta-3",
    image: "https://images.unsplash.com/photo-1521566652839-697aa473761a?auto=format&fit=crop&w=800&q=85",
    handle: "@zmw.studio",
    caption: "Editorial draping in warm, sun-lit neutrals. Shot on location.",
    likes: "6.2k"
  },
  {
    id: "insta-4",
    image: "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&w=800&q=85",
    handle: "@zmw.studio",
    caption: "Kids' summer boutique capsule: breathable organic linens for sunny days.",
    likes: "2.9k"
  },
  {
    id: "insta-5",
    image: "https://images.unsplash.com/photo-1616415852242-2d061343d9a1?auto=format&fit=crop&w=800&q=85",
    handle: "@zmw.studio",
    caption: "Feminine florals & fluid fabric — the 2026 Signature Collection.",
    likes: "4.7k"
  }
];

export const TESTIMONIALS_DATA = [
  {
    id: "test-1",
    author: "Elena Rostova",
    role: "Verified Buyer",
    city: "Paris, France",
    rating: 5,
    title: "Unmatched linen quality and tailoring",
    comment: "The French flax linen shirt feels incredible right out of the box. The drape is effortless and the finishing touches around the collar and horn buttons demonstrate master craftsmanship.",
    productPurchased: "French Linen Tailored Oversized Shirt",
    date: "August 18, 2026"
  },
  {
    id: "test-2",
    author: "Sophia Sterling",
    role: "Fashion Director",
    city: "New York, USA",
    rating: 5,
    title: "The silk slip dress of my dreams",
    comment: "I have worn luxury slip dresses from top runway houses, and ZMW matches and even exceeds their cut. The bias construction falls so smoothly without clinging.",
    productPurchased: "Liquid Silk Bias-Cut Slip Dress",
    date: "August 24, 2026"
  },
  {
    id: "test-3",
    author: "Marcus Chen",
    role: "Verified Buyer",
    city: "Tokyo, Japan",
    rating: 5,
    title: "Remarkable attention to detail and fast delivery",
    comment: "Delivered to Tokyo in 3 days in plastic-free luxury linen packaging. The tailored sand linen blazer is a true work of artisan mastery. Customer care was delightful.",
    productPurchased: "Bespoke Sand Linen Tailored Blazer",
    date: "August 29, 2026"
  }
];

export const BRAND_LOGOS = [
  "CAVALIA", "PANDOR", "FENNYAL", "LK-TECH", "SHANGHAI", "CHERYL", "VOGUE LAB"
];

/**
 * MEN_SUBCATEGORIES
 * Mirrors the Navbar's Men dropdown so the page's filter pills and the
 * nav's flyout menu always list the same set of subcategories.
 */
export const MEN_SUBCATEGORIES = [
  "Oversized T-Shirts",
  "Polo T-Shirts",
  "Plain T-Shirts",
  "Joggers",
  "Hoodie",
  "Sweatshirt"
];

/**
 * MEN_PRODUCTS
 * Dedicated catalog for the Men's category page. Shares the exact same
 * product shape as PRODUCTS (see above) so it works with ProductCard,
 * the cart, wishlist, and quick-view without any special-casing —
 * only addition is `subCategory`, used for the page's filter pills.
 */
export const MEN_PRODUCTS = [
  {
    id: "zmw-m01",
    name: "CM Original Oversized Graphic Tee",
    category: "T-Shirt",
    subCategory: "Oversized T-Shirts",
    badge: "Best Seller",
    badgeType: "hot",
    price: 42,
    originalPrice: 58,
    rating: 4.8,
    reviewCount: 231,
    sku: "ZMW-MEN-OS-01",
    inStock: true,
    stockCount: 24,
    isNew: false,
    isSale: true,
    isBestSeller: true,
    images: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&w=900&q=85"
    ],
    colors: [
      { name: "Jet Black", hex: "#181715" },
      { name: "Off White", hex: "#F3EFE4" },
      { name: "Military Green", hex: "#4B5A3F" }
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    description: "Heavyweight 240 GSM cotton jersey, boxy drop-shoulder cut with a front graphic print. Garment-washed for a broken-in feel from the first wear."
  },
  {
    id: "zmw-m02",
    name: "Racer Stripe Oversized Tee",
    category: "T-Shirt",
    subCategory: "Oversized T-Shirts",
    badge: "New Drop",
    badgeType: "new",
    price: 45,
    originalPrice: null,
    rating: 4.7,
    reviewCount: 88,
    sku: "ZMW-MEN-OS-02",
    inStock: true,
    stockCount: 16,
    isNew: true,
    isSale: false,
    isBestSeller: false,
    images: [
      "https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=85"
    ],
    colors: [
      { name: "Charcoal", hex: "#2C2B27" },
      { name: "Rust", hex: "#B85D38" }
    ],
    sizes: ["S", "M", "L", "XL"],
    description: "Motorsport-inspired racer stripe across the chest on a relaxed, drop-shoulder oversized silhouette. Ribbed crew neck for shape retention."
  },
  {
    id: "zmw-m03",
    name: "UnderRated Script Oversized Tee",
    category: "T-Shirt",
    subCategory: "Oversized T-Shirts",
    badge: "Trending",
    badgeType: "hot",
    price: 40,
    originalPrice: 52,
    rating: 4.9,
    reviewCount: 164,
    sku: "ZMW-MEN-OS-03",
    inStock: true,
    stockCount: 30,
    isNew: false,
    isSale: true,
    isBestSeller: true,
    images: [
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=85"
    ],
    colors: [
      { name: "Sage Green", hex: "#6E7A67" },
      { name: "Stone Beige", hex: "#D8CDBC" }
    ],
    sizes: ["M", "L", "XL", "XXL"],
    description: "Embroidered script chest logo on brushed cotton fleece-jersey. Dropped shoulder seams and a slightly cropped body length for an oversized fit."
  },
  {
    id: "zmw-m04",
    name: "Street Calm Zipper Oversized Tee",
    category: "T-Shirt",
    subCategory: "Oversized T-Shirts",
    badge: null,
    badgeType: "new",
    price: 44,
    originalPrice: null,
    rating: 4.6,
    reviewCount: 52,
    sku: "ZMW-MEN-OS-04",
    inStock: true,
    stockCount: 12,
    isNew: true,
    isSale: false,
    isBestSeller: false,
    images: [
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=900&q=85"
    ],
    colors: [
      { name: "Ivory", hex: "#FAF8F2" },
      { name: "Jet Black", hex: "#181715" }
    ],
    sizes: ["S", "M", "L", "XL"],
    description: "Zip-neck placket on a heavyweight oversized tee, cut long with side vents. A quieter alternative to a full graphic print."
  },
  {
    id: "zmw-m05",
    name: "Initial D Oversized Racing Tee",
    category: "T-Shirt",
    subCategory: "Oversized T-Shirts",
    badge: "Limited",
    badgeType: "hot",
    price: 46,
    originalPrice: 60,
    rating: 4.9,
    reviewCount: 97,
    sku: "ZMW-MEN-OS-05",
    inStock: true,
    stockCount: 9,
    isNew: false,
    isSale: true,
    isBestSeller: true,
    images: [
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&w=900&q=85"
    ],
    colors: [
      { name: "Racing Red", hex: "#B3271D" },
      { name: "Jet Black", hex: "#181715" }
    ],
    sizes: ["M", "L", "XL", "XXL"],
    description: "Motorsport graphic print wraps the front and sleeve on a boxy oversized cut. Limited run, numbered inner label."
  },
  {
    id: "zmw-m06",
    name: "Original 99 Oversized Tee",
    category: "T-Shirt",
    subCategory: "Oversized T-Shirts",
    badge: "New Drop",
    badgeType: "new",
    price: 43,
    originalPrice: null,
    rating: 4.7,
    reviewCount: 61,
    sku: "ZMW-MEN-OS-06",
    inStock: true,
    stockCount: 20,
    isNew: true,
    isSale: false,
    isBestSeller: false,
    images: [
      "https://images.unsplash.com/photo-1622470953794-aa9c70b0fb9d?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1618354691792-d1d42acfd860?auto=format&fit=crop&w=900&q=85"
    ],
    colors: [
      { name: "Olive", hex: "#4B5A3F" },
      { name: "Off White", hex: "#F3EFE4" },
      { name: "Charcoal", hex: "#2C2B27" }
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    description: "A clean numeral graphic on heavyweight cotton, cut boxy through the body with dropped shoulders for an easy oversized fit."
  },
  {
    id: "zmw-m07",
    name: "Mono Line Zipper Regular Polo",
    category: "Polo",
    subCategory: "Polo T-Shirts",
    badge: "Best Seller",
    badgeType: "hot",
    price: 39,
    originalPrice: 50,
    rating: 4.8,
    reviewCount: 178,
    sku: "ZMW-MEN-PL-01",
    inStock: true,
    stockCount: 27,
    isNew: false,
    isSale: true,
    isBestSeller: true,
    images: [
      "https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1562157873-818bc0726f68?auto=format&fit=crop&w=900&q=85"
    ],
    colors: [
      { name: "Ivory", hex: "#FAF8F2" },
      { name: "Navy", hex: "#1D2B3A" }
    ],
    sizes: ["S", "M", "L", "XL"],
    description: "Pique cotton polo with a zip placket in place of buttons, regular fit through the body with a ribbed collar and cuffs."
  },
  {
    id: "zmw-m08",
    name: "Shadow Hunter Oversized Polo",
    category: "Polo",
    subCategory: "Polo T-Shirts",
    badge: "New Drop",
    badgeType: "new",
    price: 41,
    originalPrice: null,
    rating: 4.6,
    reviewCount: 44,
    sku: "ZMW-MEN-PL-02",
    inStock: true,
    stockCount: 15,
    isNew: true,
    isSale: false,
    isBestSeller: false,
    images: [
      "https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?auto=format&fit=crop&w=900&q=85"
    ],
    colors: [
      { name: "Maroon", hex: "#5C1F26" },
      { name: "Jet Black", hex: "#181715" }
    ],
    sizes: ["M", "L", "XL", "XXL"],
    description: "Oversized pique polo with a tonal chest graphic. Dropped shoulders and a slightly extended hem for a modern streetwear proportion."
  },
  {
    id: "zmw-m09",
    name: "Spartans High-Density Oversized Polo",
    category: "Polo",
    subCategory: "Polo T-Shirts",
    badge: "Trending",
    badgeType: "hot",
    price: 44,
    originalPrice: 55,
    rating: 4.9,
    reviewCount: 132,
    sku: "ZMW-MEN-PL-03",
    inStock: true,
    stockCount: 18,
    isNew: false,
    isSale: true,
    isBestSeller: true,
    images: [
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=85"
    ],
    colors: [
      { name: "Espresso Brown", hex: "#3A2A1E" },
      { name: "Off White", hex: "#F3EFE4" }
    ],
    sizes: ["S", "M", "L", "XL"],
    description: "High-density heavyweight pique polo with a bold collegiate-style chest print, cut oversized with a ribbed placket collar."
  },
  {
    id: "zmw-m10",
    name: "Detroit High-Neck Oversized Polo",
    category: "Polo",
    subCategory: "Polo T-Shirts",
    badge: null,
    badgeType: "new",
    price: 42,
    originalPrice: null,
    rating: 4.5,
    reviewCount: 29,
    sku: "ZMW-MEN-PL-04",
    inStock: false,
    stockCount: 0,
    isNew: true,
    isSale: false,
    isBestSeller: false,
    images: [
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1534030347209-467a5b0ad3e6?auto=format&fit=crop&w=900&q=85"
    ],
    colors: [
      { name: "Mustard Gold", hex: "#C89D3C" },
      { name: "Jet Black", hex: "#181715" }
    ],
    sizes: ["M", "L", "XL"],
    description: "High-neck placket polo in brushed pique cotton with contrast trim at the cuffs and collar. Currently out of stock — restocking soon."
  },
  {
    id: "zmw-m11",
    name: "Neutral Wave Regular Polo",
    category: "Polo",
    subCategory: "Polo T-Shirts",
    badge: "New Drop",
    badgeType: "new",
    price: 38,
    originalPrice: 48,
    rating: 4.7,
    reviewCount: 71,
    sku: "ZMW-MEN-PL-05",
    inStock: true,
    stockCount: 22,
    isNew: true,
    isSale: true,
    isBestSeller: false,
    images: [
      "https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=85"
    ],
    colors: [
      { name: "Sand Beige", hex: "#D8CDBC" },
      { name: "Sky Blue", hex: "#9BB8CC" }
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    description: "A quiet, regular-fit pique polo built for everyday rotation. Soft-washed finish with a two-button placket and side vents."
  },
  {
    id: "zmw-m12",
    name: "Relaxed Boxy Oxford Weave Shirt",
    category: "T-Shirt",
    subCategory: "Plain T-Shirts",
    badge: "Best Seller",
    badgeType: "hot",
    price: 46,
    originalPrice: 58,
    rating: 4.8,
    reviewCount: 96,
    sku: "ZMW-MEN-01-2",
    inStock: true,
    stockCount: 19,
    isNew: false,
    isSale: true,
    isBestSeller: true,
    images: [
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=900&q=85"
    ],
    colors: [
      { name: "Crisp White", hex: "#F7F5EF" },
      { name: "Sky Blue", hex: "#9BB8CC" },
      { name: "Charcoal Twill", hex: "#3B3B3B" }
    ],
    sizes: ["S", "M", "L", "XL"],
    description: "Oxford-weave cotton in a relaxed boxy cut, no branding — a wardrobe staple built to layer under a shirt or blazer."
  },
  {
    id: "zmw-m13",
    name: "Beige Atelier Regular Long Sleeve",
    category: "T-Shirt",
    subCategory: "Plain T-Shirts",
    badge: null,
    badgeType: "new",
    price: 37,
    originalPrice: null,
    rating: 4.6,
    reviewCount: 33,
    sku: "ZMW-MEN-PT-02",
    inStock: true,
    stockCount: 14,
    isNew: true,
    isSale: false,
    isBestSeller: false,
    images: [
      "https://images.unsplash.com/photo-1622470953794-aa9c70b0fb9d?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=900&q=85"
    ],
    colors: [
      { name: "Beige", hex: "#D8CDBC" },
      { name: "Ivory", hex: "#FAF8F2" }
    ],
    sizes: ["S", "M", "L", "XL"],
    description: "Fine-gauge cotton long sleeve with a mock-neck placket. Regular fit, minimal branding — an easy layering piece."
  },
  {
    id: "zmw-m14",
    name: "Dark Dimension Full Sleeve Tee",
    category: "T-Shirt",
    subCategory: "Plain T-Shirts",
    badge: "Trending",
    badgeType: "hot",
    price: 39,
    originalPrice: 49,
    rating: 4.7,
    reviewCount: 58,
    sku: "ZMW-MEN-PT-03",
    inStock: true,
    stockCount: 21,
    isNew: false,
    isSale: true,
    isBestSeller: false,
    images: [
      "https://images.unsplash.com/photo-1618354691792-d1d42acfd860?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1622470953794-aa9c70b0fb9d?auto=format&fit=crop&w=900&q=85"
    ],
    colors: [
      { name: "Jet Black", hex: "#181715" }
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    description: "Heavyweight cotton full-sleeve tee with a clean crew neck. Solid black, garment-dyed for a deep, even tone."
  },
  {
    id: "zmw-m15",
    name: "CM OG Racing Track Joggers",
    category: "Joggers",
    subCategory: "Joggers",
    badge: "Best Seller",
    badgeType: "hot",
    price: 52,
    originalPrice: 68,
    rating: 4.8,
    reviewCount: 143,
    sku: "ZMW-MEN-JG-01",
    inStock: true,
    stockCount: 25,
    isNew: false,
    isSale: true,
    isBestSeller: true,
    images: [
      "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1584865288642-42078afe6942?auto=format&fit=crop&w=900&q=85"
    ],
    colors: [
      { name: "Jet Black", hex: "#181715" },
      { name: "Charcoal", hex: "#2C2B27" }
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    description: "Tapered fleece joggers with side racing stripes, elastic drawcord waist, and zip pockets. Brushed interior for warmth."
  },
  {
    id: "zmw-m16",
    name: "Gun Metal Cargo Joggers",
    category: "Joggers",
    subCategory: "Joggers",
    badge: "New Drop",
    badgeType: "new",
    price: 55,
    originalPrice: null,
    rating: 4.6,
    reviewCount: 37,
    sku: "ZMW-MEN-JG-02",
    inStock: true,
    stockCount: 11,
    isNew: true,
    isSale: false,
    isBestSeller: false,
    images: [
      "https://images.unsplash.com/photo-1584865288642-42078afe6942?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?auto=format&fit=crop&w=900&q=85"
    ],
    colors: [
      { name: "Gun Metal Grey", hex: "#5E5C56" }
    ],
    sizes: ["M", "L", "XL"],
    description: "Utility cargo joggers in a heavyweight cotton-blend twill with side pockets and a tapered ankle cuff."
  },
  {
    id: "zmw-m17",
    name: "Graphics Hoodie — Underrated",
    category: "Hoodie",
    subCategory: "Hoodie",
    badge: "Trending",
    badgeType: "hot",
    price: 64,
    originalPrice: 82,
    rating: 4.9,
    reviewCount: 112,
    sku: "ZMW-MEN-HD-01",
    inStock: true,
    stockCount: 17,
    isNew: false,
    isSale: true,
    isBestSeller: true,
    images: [
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=900&q=85"
    ],
    colors: [
      { name: "Jet Black", hex: "#181715" },
      { name: "Forest Olive", hex: "#264E3A" }
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    description: "Heavyweight brushed-fleece hoodie with a front graphic print, kangaroo pocket, and ribbed hem and cuffs."
  },
  {
    id: "zmw-m18",
    name: "Mute Sand Regular Sweatshirt",
    category: "Sweatshirt",
    subCategory: "Sweatshirt",
    badge: "New Drop",
    badgeType: "new",
    price: 48,
    originalPrice: null,
    rating: 4.5,
    reviewCount: 26,
    sku: "ZMW-MEN-SW-01",
    inStock: true,
    stockCount: 13,
    isNew: true,
    isSale: false,
    isBestSeller: false,
    images: [
      "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=900&q=85"
    ],
    colors: [
      { name: "Sand Beige", hex: "#D8CDBC" },
      { name: "Ivory", hex: "#FAF8F2" }
    ],
    sizes: ["S", "M", "L", "XL"],
    description: "Crewneck sweatshirt in soft-brushed cotton fleece, unbranded and cut in a regular fit for easy everyday layering."
  },
  {
    id: "zmw-m19",
    name: "Originals 88 Oversized T-Shirt - Navy & White",
    category: "T-Shirt",
    subCategory: "Oversized T-Shirts",
    badge: "Best Seller",
    badgeType: "hot",
    price: 44,
    originalPrice: 60,
    rating: 4.9,
    reviewCount: 198,
    sku: "ZMW-MEN-OS-07",
    inStock: true,
    stockCount: 22,
    isNew: false,
    isSale: true,
    isBestSeller: true,
    images: [
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=85"
    ],
    colors: [
      { name: "Navy Blue", hex: "#1A2B4C" },
      { name: "White", hex: "#F5F5F5" }
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    description: "Iconic dual-tone Originals 88 graphic with drop-shoulder boxy fit. Spun from 240 GSM combed cotton for a heavy drape."
  },
  {
    id: "zmw-m20",
    name: "Fast Lane Full Sleeve Oversized Tee - Off White & Red",
    category: "T-Shirt",
    subCategory: "Oversized T-Shirts",
    badge: "New Drop",
    badgeType: "new",
    price: 48,
    originalPrice: 65,
    rating: 4.8,
    reviewCount: 84,
    sku: "ZMW-MEN-OS-08",
    inStock: true,
    stockCount: 16,
    isNew: true,
    isSale: true,
    isBestSeller: false,
    images: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=900&q=85"
    ],
    colors: [
      { name: "Off White", hex: "#F3EFE4" },
      { name: "Crimson Red", hex: "#A82B2B" }
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    description: "Street motorsport graphics on an off-white full-sleeve drop-shoulder tee. High-density contrast chest and sleeve prints."
  },
  {
    id: "zmw-m21",
    name: "Riders Life Acid Wash Oversized Tee - Black & Denim",
    category: "T-Shirt",
    subCategory: "Oversized T-Shirts",
    badge: "Trending",
    badgeType: "hot",
    price: 46,
    originalPrice: 62,
    rating: 4.9,
    reviewCount: 142,
    sku: "ZMW-MEN-OS-09",
    inStock: true,
    stockCount: 19,
    isNew: false,
    isSale: true,
    isBestSeller: true,
    images: [
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&w=900&q=85"
    ],
    colors: [
      { name: "Acid Black", hex: "#222224" },
      { name: "Denim Blue", hex: "#3A506B" }
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    description: "Mineral acid-washed heavyweight tee with retro motorcycle typography print. Every piece boasts a unique faded vintage patina."
  },
  {
    id: "zmw-m22",
    name: "Sprint Club Oversized Tee - Contrast 5 Thread Black",
    category: "T-Shirt",
    subCategory: "Oversized T-Shirts",
    badge: "Sale",
    badgeType: "sale",
    price: 42,
    originalPrice: 56,
    rating: 4.7,
    reviewCount: 95,
    sku: "ZMW-MEN-OS-10",
    inStock: true,
    stockCount: 28,
    isNew: false,
    isSale: true,
    isBestSeller: false,
    images: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=900&q=85"
    ],
    colors: [
      { name: "Jet Black", hex: "#181715" },
      { name: "Light Grey", hex: "#D4D2CD" }
    ],
    sizes: ["S", "M", "L", "XL"],
    description: "5-thread contrast lockstitch detail on seams with back racing typography graphic. Super combed heavyweight jersey."
  },
  {
    id: "zmw-m23",
    name: "Madrid Oversized Graphic Tee - White & Navy",
    category: "T-Shirt",
    subCategory: "Oversized T-Shirts",
    badge: "Best Seller",
    badgeType: "hot",
    price: 45,
    originalPrice: 58,
    rating: 4.8,
    reviewCount: 176,
    sku: "ZMW-MEN-OS-11",
    inStock: true,
    stockCount: 15,
    isNew: false,
    isSale: true,
    isBestSeller: true,
    images: [
      "https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&w=900&q=85"
    ],
    colors: [
      { name: "Ivory White", hex: "#FDFDFD" },
      { name: "Navy Blue", hex: "#1A2B4C" }
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    description: "European football culture meets modern streetwear. Screen-printed back emblem with minimal front chest badge."
  },
  {
    id: "zmw-m24",
    name: "Eternal Khepri Oversized Tee - Black & Hazelnut",
    category: "T-Shirt",
    subCategory: "Oversized T-Shirts",
    badge: "New Drop",
    badgeType: "new",
    price: 47,
    originalPrice: null,
    rating: 4.9,
    reviewCount: 63,
    sku: "ZMW-MEN-OS-12",
    inStock: true,
    stockCount: 12,
    isNew: true,
    isSale: false,
    isBestSeller: false,
    images: [
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1622470953794-aa9c70b0fb9d?auto=format&fit=crop&w=900&q=85"
    ],
    colors: [
      { name: "Jet Black", hex: "#181715" },
      { name: "Hazelnut", hex: "#8A6D4B" }
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    description: "Mythological scarab artwork printed in warm hazelnut metallic ink on jet black combed cotton. Seamless side seams for pure boxy drape."
  }
];

/**
 * WOMEN_SUBCATEGORIES
 * Mirrors the Navbar's Women dropdown so the page's filter pills and the
 * nav's flyout menu always list the same set of subcategories.
 */
export const WOMEN_SUBCATEGORIES = ["Printed T-Shirts", "Co-Ords", "Tops"];

/**
 * WOMEN_PRODUCTS
 * Dedicated catalog for the Women's category page. Shares the exact same
 * product shape as MEN_PRODUCTS so it works with ProductCard, the cart,
 * wishlist, and quick-view without any special-casing — only addition is
 * `subCategory`, used for the page's filter pills.
 */
export const WOMEN_PRODUCTS = [
  {
    id: "zmw-w01",
    name: "Star League Varsity Printed Tee",
    category: "T-Shirt",
    subCategory: "Printed T-Shirts",
    badge: "Best Seller",
    badgeType: "hot",
    price: 38,
    originalPrice: 50,
    rating: 4.8,
    reviewCount: 204,
    sku: "ZMW-WOM-PT-01",
    inStock: true,
    stockCount: 26,
    isNew: false,
    isSale: true,
    isBestSeller: true,
    images: [
      "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=900&q=85"
    ],
    colors: [
      { name: "Sunflower Yellow", hex: "#E8B93C" },
      { name: "Off White", hex: "#F3EFE4" },
      { name: "Sky Blue", hex: "#9BB8CC" }
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    description: "Collegiate varsity graphic on a relaxed boxy tee, garment-washed cotton jersey with dropped shoulders for an easy, oversized fit."
  },
  {
    id: "zmw-w02",
    name: "Retro Script Printed Tee",
    category: "T-Shirt",
    subCategory: "Printed T-Shirts",
    badge: "New Drop",
    badgeType: "new",
    price: 36,
    originalPrice: null,
    rating: 4.6,
    reviewCount: 61,
    sku: "ZMW-WOM-PT-02",
    inStock: true,
    stockCount: 18,
    isNew: true,
    isSale: false,
    isBestSeller: false,
    images: [
      "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1756483492198-8ca91227489b?auto=format&fit=crop&w=900&q=85"
    ],
    colors: [
      { name: "Jet Black", hex: "#181715" },
      { name: "Sage Green", hex: "#6E7A67" }
    ],
    sizes: ["XS", "S", "M", "L"],
    description: "Retro cursive script across the chest on soft-washed single jersey. Cropped-through-regular length for easy layering over co-ords."
  },
  {
    id: "zmw-w03",
    name: "Floral Graphic Boxy Tee",
    category: "T-Shirt",
    subCategory: "Printed T-Shirts",
    badge: "Trending",
    badgeType: "hot",
    price: 39,
    originalPrice: 48,
    rating: 4.9,
    reviewCount: 132,
    sku: "ZMW-WOM-PT-03",
    inStock: true,
    stockCount: 21,
    isNew: false,
    isSale: true,
    isBestSeller: true,
    images: [
      "https://images.unsplash.com/photo-1742677143629-b9784beab2e1?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=900&q=85"
    ],
    colors: [
      { name: "Ivory", hex: "#FAF8F2" },
      { name: "Blush Pink", hex: "#E3B9B0" }
    ],
    sizes: ["S", "M", "L", "XL"],
    description: "Hand-drawn floral print on a boxy, relaxed silhouette. Ribbed crew neck and a slightly cropped hem for high-waist styling."
  },
  {
    id: "zmw-w04",
    name: "Motorsport Graphic Tee",
    category: "T-Shirt",
    subCategory: "Printed T-Shirts",
    badge: null,
    badgeType: "new",
    price: 37,
    originalPrice: null,
    rating: 4.5,
    reviewCount: 39,
    sku: "ZMW-WOM-PT-04",
    inStock: true,
    stockCount: 15,
    isNew: true,
    isSale: false,
    isBestSeller: false,
    images: [
      "https://images.unsplash.com/photo-1509319117193-57bab727e09d?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=900&q=85"
    ],
    colors: [
      { name: "Racing Red", hex: "#B3271D" },
      { name: "Jet Black", hex: "#181715" }
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    description: "Motorsport-inspired chest graphic on breathable cotton jersey, cut with a relaxed body and short dropped sleeves."
  },
  {
    id: "zmw-w05",
    name: "Star League University Tee",
    category: "T-Shirt",
    subCategory: "Printed T-Shirts",
    badge: "Best Seller",
    badgeType: "hot",
    price: 40,
    originalPrice: 52,
    rating: 4.8,
    reviewCount: 176,
    sku: "ZMW-WOM-PT-05",
    inStock: true,
    stockCount: 23,
    isNew: false,
    isSale: true,
    isBestSeller: true,
    images: [
      "https://images.unsplash.com/photo-1746386914795-83d2febc9a96?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1763089402370-fb496fefdbb0?auto=format&fit=crop&w=900&q=85"
    ],
    colors: [
      { name: "Sunflower Yellow", hex: "#E8B93C" },
      { name: "Ivory", hex: "#FAF8F2" }
    ],
    sizes: ["S", "M", "L", "XL"],
    description: "Collegiate university crest print in a relaxed, colorblocked boxy tee — pairs easily with joggers or a midi skirt."
  },
  {
    id: "zmw-w06",
    name: "Minimal Line-Art Graphic Tee",
    category: "T-Shirt",
    subCategory: "Printed T-Shirts",
    badge: "New Drop",
    badgeType: "new",
    price: 35,
    originalPrice: null,
    rating: 4.6,
    reviewCount: 47,
    sku: "ZMW-WOM-PT-06",
    inStock: false,
    stockCount: 0,
    isNew: true,
    isSale: false,
    isBestSeller: false,
    images: [
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=85"
    ],
    colors: [
      { name: "Stone Beige", hex: "#D8CDBC" }
    ],
    sizes: ["XS", "S", "M"],
    description: "Delicate single-line art print on lightweight combed cotton. Currently out of stock — restocking soon."
  },
  {
    id: "zmw-w07",
    name: "Ribbed Knit Co-Ord Set",
    category: "Co-Ords",
    subCategory: "Co-Ords",
    badge: "Best Seller",
    badgeType: "hot",
    price: 68,
    originalPrice: 88,
    rating: 4.9,
    reviewCount: 148,
    sku: "ZMW-WOM-CO-01",
    inStock: true,
    stockCount: 19,
    isNew: false,
    isSale: true,
    isBestSeller: true,
    images: [
      "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=900&q=85"
    ],
    colors: [
      { name: "Sage Green", hex: "#6E7A67" },
      { name: "Espresso Brown", hex: "#3A2A1E" }
    ],
    sizes: ["XS", "S", "M", "L"],
    description: "Fine-rib knit tank and matching wide-leg trouser, cut from a soft stretch viscose blend that skims rather than clings."
  },
  {
    id: "zmw-w08",
    name: "Linen-Blend Shirt Co-Ord",
    category: "Co-Ords",
    subCategory: "Co-Ords",
    badge: "New Drop",
    badgeType: "new",
    price: 74,
    originalPrice: null,
    rating: 4.7,
    reviewCount: 52,
    sku: "ZMW-WOM-CO-02",
    inStock: true,
    stockCount: 12,
    isNew: true,
    isSale: false,
    isBestSeller: false,
    images: [
      "https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=900&q=85"
    ],
    colors: [
      { name: "Ivory", hex: "#FAF8F2" },
      { name: "Sky Blue", hex: "#9BB8CC" }
    ],
    sizes: ["S", "M", "L", "XL"],
    description: "Relaxed camp-collar shirt and drawstring shorts in a breathable linen-cotton blend — a warm-weather staple worn together or apart."
  },
  {
    id: "zmw-w09",
    name: "Cropped Hoodie Co-Ord",
    category: "Co-Ords",
    subCategory: "Co-Ords",
    badge: "Trending",
    badgeType: "hot",
    price: 72,
    originalPrice: 92,
    rating: 4.8,
    reviewCount: 97,
    sku: "ZMW-WOM-CO-03",
    inStock: true,
    stockCount: 16,
    isNew: false,
    isSale: true,
    isBestSeller: true,
    images: [
      "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=900&q=85"
    ],
    colors: [
      { name: "Jet Black", hex: "#181715" },
      { name: "Blush Pink", hex: "#E3B9B0" }
    ],
    sizes: ["XS", "S", "M", "L"],
    description: "Brushed-fleece cropped hoodie paired with matching jogger pants — soft-brushed interior with ribbed cuffs and waistband."
  },
  {
    id: "zmw-w10",
    name: "Satin Cami Co-Ord Set",
    category: "Co-Ords",
    subCategory: "Co-Ords",
    badge: null,
    badgeType: "new",
    price: 66,
    originalPrice: null,
    rating: 4.5,
    reviewCount: 33,
    sku: "ZMW-WOM-CO-04",
    inStock: true,
    stockCount: 9,
    isNew: true,
    isSale: false,
    isBestSeller: false,
    images: [
      "https://images.unsplash.com/photo-1756483492198-8ca91227489b?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1742677143629-b9784beab2e1?auto=format&fit=crop&w=900&q=85"
    ],
    colors: [
      { name: "Espresso Brown", hex: "#3A2A1E" },
      { name: "Ivory", hex: "#FAF8F2" }
    ],
    sizes: ["XS", "S", "M"],
    description: "Fluid satin cami and matching wide-leg pant, cut on the bias for a soft drape that moves with you — dress up or down."
  },
  {
    id: "zmw-w11",
    name: "Utility Cargo Co-Ord Set",
    category: "Co-Ords",
    subCategory: "Co-Ords",
    badge: "New Drop",
    badgeType: "new",
    price: 76,
    originalPrice: 96,
    rating: 4.7,
    reviewCount: 58,
    sku: "ZMW-WOM-CO-05",
    inStock: true,
    stockCount: 14,
    isNew: true,
    isSale: true,
    isBestSeller: false,
    images: [
      "https://images.unsplash.com/photo-1509319117193-57bab727e09d?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=900&q=85"
    ],
    colors: [
      { name: "Sage Green", hex: "#6E7A67" },
      { name: "Stone Beige", hex: "#D8CDBC" }
    ],
    sizes: ["S", "M", "L", "XL"],
    description: "Boxy utility shirt-jacket and cargo trouser set in heavyweight cotton twill, finished with functional pockets throughout."
  },
  {
    id: "zmw-w12",
    name: "Textured Rib Sweater Co-Ord",
    category: "Co-Ords",
    subCategory: "Co-Ords",
    badge: "Trending",
    badgeType: "hot",
    price: 70,
    originalPrice: 90,
    rating: 4.9,
    reviewCount: 84,
    sku: "ZMW-WOM-CO-06",
    inStock: true,
    stockCount: 11,
    isNew: false,
    isSale: true,
    isBestSeller: true,
    images: [
      "https://images.unsplash.com/photo-1746386914795-83d2febc9a96?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1763089402370-fb496fefdbb0?auto=format&fit=crop&w=900&q=85"
    ],
    colors: [
      { name: "Espresso Brown", hex: "#3A2A1E" },
      { name: "Off White", hex: "#F3EFE4" }
    ],
    sizes: ["XS", "S", "M", "L"],
    description: "Textured rib-knit sweater and matching skirt, a soft mid-weight yarn that holds its shape through the season."
  },
  {
    id: "zmw-w13",
    name: "Relaxed Mock-Neck Top",
    category: "Top",
    subCategory: "Tops",
    badge: "Best Seller",
    badgeType: "hot",
    price: 34,
    originalPrice: 44,
    rating: 4.8,
    reviewCount: 121,
    sku: "ZMW-WOM-TP-01",
    inStock: true,
    stockCount: 28,
    isNew: false,
    isSale: true,
    isBestSeller: true,
    images: [
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=85"
    ],
    colors: [
      { name: "Ivory", hex: "#FAF8F2" },
      { name: "Sage Green", hex: "#6E7A67" },
      { name: "Blush Pink", hex: "#E3B9B0" }
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    description: "Fine-gauge mock-neck top in a soft stretch knit, regular fit with a slightly cropped hem — an easy layering staple."
  },
  {
    id: "zmw-w14",
    name: "Halter Bandeau Top",
    category: "Top",
    subCategory: "Tops",
    badge: "New Drop",
    badgeType: "new",
    price: 32,
    originalPrice: null,
    rating: 4.6,
    reviewCount: 45,
    sku: "ZMW-WOM-TP-02",
    inStock: true,
    stockCount: 17,
    isNew: true,
    isSale: false,
    isBestSeller: false,
    images: [
      "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=900&q=85"
    ],
    colors: [
      { name: "Blush Pink", hex: "#E3B9B0" },
      { name: "Sky Blue", hex: "#9BB8CC" }
    ],
    sizes: ["XS", "S", "M"],
    description: "Cross-front halter bandeau top in a smooth ribbed knit — pairs cleanly with high-waist denim or a midi skirt."
  },
  {
    id: "zmw-w15",
    name: "Fitted Ribbed Tank Top",
    category: "Top",
    subCategory: "Tops",
    badge: "Trending",
    badgeType: "hot",
    price: 28,
    originalPrice: 36,
    rating: 4.7,
    reviewCount: 93,
    sku: "ZMW-WOM-TP-03",
    inStock: true,
    stockCount: 24,
    isNew: false,
    isSale: true,
    isBestSeller: true,
    images: [
      "https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=900&q=85"
    ],
    colors: [
      { name: "Jet Black", hex: "#181715" },
      { name: "Ivory", hex: "#FAF8F2" },
      { name: "Espresso Brown", hex: "#3A2A1E" }
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    description: "Second-skin ribbed tank in a stretch cotton-elastane blend, cut close to the body — a wardrobe basic that layers under everything."
  },
  {
    id: "zmw-w16",
    name: "Cropped Wrap Top",
    category: "Top",
    subCategory: "Tops",
    badge: null,
    badgeType: "new",
    price: 36,
    originalPrice: null,
    rating: 4.5,
    reviewCount: 27,
    sku: "ZMW-WOM-TP-04",
    inStock: true,
    stockCount: 13,
    isNew: true,
    isSale: false,
    isBestSeller: false,
    images: [
      "https://images.unsplash.com/photo-1756483492198-8ca91227489b?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1742677143629-b9784beab2e1?auto=format&fit=crop&w=900&q=85"
    ],
    colors: [
      { name: "Sage Green", hex: "#6E7A67" },
      { name: "Stone Beige", hex: "#D8CDBC" }
    ],
    sizes: ["XS", "S", "M", "L"],
    description: "Soft wrap-front top with a self-tie waist, cropped length designed to sit at the high-rise waistline of denim or trousers."
  },
  {
    id: "zmw-w17",
    name: "Off-Shoulder Poplin Top",
    category: "Top",
    subCategory: "Tops",
    badge: "New Drop",
    badgeType: "new",
    price: 39,
    originalPrice: 48,
    rating: 4.6,
    reviewCount: 41,
    sku: "ZMW-WOM-TP-05",
    inStock: true,
    stockCount: 20,
    isNew: true,
    isSale: true,
    isBestSeller: false,
    images: [
      "https://images.unsplash.com/photo-1509319117193-57bab727e09d?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=900&q=85"
    ],
    colors: [
      { name: "Ivory", hex: "#FAF8F2" },
      { name: "Sunflower Yellow", hex: "#E8B93C" }
    ],
    sizes: ["XS", "S", "M", "L"],
    description: "Crisp cotton poplin top with an elasticated off-shoulder neckline and voluminous short sleeves."
  },
  {
    id: "zmw-w18",
    name: "Long Sleeve Fitted Top",
    category: "Top",
    subCategory: "Tops",
    badge: "Best Seller",
    badgeType: "hot",
    price: 33,
    originalPrice: 42,
    rating: 4.8,
    reviewCount: 156,
    sku: "ZMW-WOM-TP-06",
    inStock: false,
    stockCount: 0,
    isNew: false,
    isSale: true,
    isBestSeller: true,
    images: [
      "https://images.unsplash.com/photo-1746386914795-83d2febc9a96?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1763089402370-fb496fefdbb0?auto=format&fit=crop&w=900&q=85"
    ],
    colors: [
      { name: "Espresso Brown", hex: "#3A2A1E" },
      { name: "Jet Black", hex: "#181715" }
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    description: "Fine-knit long sleeve fitted top with a crew neck — currently out of stock, restocking soon. Our most-reordered basic."
  }
];

/**
 * KIDS_SUBCATEGORIES
 * Mirrors the Navbar's Kids dropdown so the page's filter pills and the
 * nav's flyout menu always list the same set of subcategories.
 */
export const KIDS_SUBCATEGORIES = ["Boys", "Girls", "Toddlers"];

/**
 * KIDS_PRODUCTS
 * Dedicated catalog for the Kids' category page. Shares the exact same
 * product shape as MEN_PRODUCTS / WOMEN_PRODUCTS so it works with
 * ProductCard, the cart, wishlist, and quick-view without any
 * special-casing — sizes use age bands (e.g. "2-3Y") instead of
 * letter sizes, and `subCategory` drives the page's filter pills.
 */
export const KIDS_PRODUCTS = [
  {
    id: "zmw-k01",
    name: "Dino Explorer Graphic Tee & Shorts Set",
    category: "T-Shirt Set",
    subCategory: "Boys",
    badge: "Best Seller",
    badgeType: "hot",
    price: 22,
    originalPrice: 30,
    rating: 4.9,
    reviewCount: 178,
    sku: "ZMW-KID-BY-01",
    inStock: true,
    stockCount: 34,
    isNew: false,
    isSale: true,
    isBestSeller: true,
    images: [
      "https://images.unsplash.com/photo-1596870230751-ebdfce98ec42?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=900&q=85"
    ],
    colors: [
      { name: "Jungle Green", hex: "#4B5A3F" },
      { name: "Off White", hex: "#F3EFE4" },
      { name: "Navy", hex: "#28344A" }
    ],
    sizes: ["2-3Y", "3-4Y", "4-5Y", "5-6Y", "6-7Y", "7-8Y"],
    description: "Soft-washed cotton tee with a playful dino print, paired with elastic-waist shorts for easy on-off. Built for a full day of play."
  },
  {
    id: "zmw-k02",
    name: "Little Racer Zip-Up Hoodie",
    category: "Hoodie",
    subCategory: "Boys",
    badge: "New Drop",
    badgeType: "new",
    price: 28,
    originalPrice: null,
    rating: 4.7,
    reviewCount: 64,
    sku: "ZMW-KID-BY-02",
    inStock: true,
    stockCount: 21,
    isNew: true,
    isSale: false,
    isBestSeller: false,
    images: [
      "https://images.unsplash.com/photo-1529756148791-fbca69bfe693?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1758782213532-bbb5fd89885e?auto=format&fit=crop&w=900&q=85"
    ],
    colors: [
      { name: "Charcoal", hex: "#2C2B27" },
      { name: "Rust", hex: "#B85D38" }
    ],
    sizes: ["3-4Y", "4-5Y", "5-6Y", "6-7Y", "7-8Y", "8-9Y"],
    description: "Brushed-fleece zip hoodie with a kangaroo pocket and ribbed cuffs. Lightweight enough for layering, warm enough on its own."
  },
  {
    id: "zmw-k03",
    name: "Space Mission Graphic Tee",
    category: "T-Shirt",
    subCategory: "Boys",
    badge: "Trending",
    badgeType: "hot",
    price: 16,
    originalPrice: 22,
    rating: 4.8,
    reviewCount: 112,
    sku: "ZMW-KID-BY-03",
    inStock: true,
    stockCount: 40,
    isNew: false,
    isSale: true,
    isBestSeller: false,
    images: [
      "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1596870230751-ebdfce98ec42?auto=format&fit=crop&w=900&q=85"
    ],
    colors: [
      { name: "Jet Black", hex: "#181715" },
      { name: "Sky Blue", hex: "#9BB8CC" }
    ],
    sizes: ["2-3Y", "3-4Y", "4-5Y", "5-6Y", "6-7Y"],
    description: "Glow-in-the-dark rocket graphic on breathable single jersey cotton. Reinforced neckline stitching for wear after wear."
  },
  {
    id: "zmw-k04",
    name: "Weekend Explorer Joggers",
    category: "Joggers",
    subCategory: "Boys",
    badge: null,
    badgeType: null,
    price: 19,
    originalPrice: null,
    rating: 4.6,
    reviewCount: 47,
    sku: "ZMW-KID-BY-04",
    inStock: true,
    stockCount: 18,
    isNew: false,
    isSale: false,
    isBestSeller: false,
    images: [
      "https://images.unsplash.com/photo-1758782213532-bbb5fd89885e?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1529756148791-fbca69bfe693?auto=format&fit=crop&w=900&q=85"
    ],
    colors: [
      { name: "Olive", hex: "#6E7A67" },
      { name: "Charcoal", hex: "#2C2B27" }
    ],
    sizes: ["4-5Y", "5-6Y", "6-7Y", "7-8Y", "8-9Y", "9-10Y"],
    description: "Tapered fleece joggers with an adjustable drawstring waist and deep side pockets. Stretch-woven fabric moves with every step."
  },
  {
    id: "zmw-k05",
    name: "Sunshine Floral Sundress",
    category: "Dress",
    subCategory: "Girls",
    badge: "Best Seller",
    badgeType: "hot",
    price: 24,
    originalPrice: 32,
    rating: 4.9,
    reviewCount: 203,
    sku: "ZMW-KID-GL-01",
    inStock: true,
    stockCount: 29,
    isNew: false,
    isSale: true,
    isBestSeller: true,
    images: [
      "https://images.unsplash.com/photo-1590480598135-3be152c87913?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=900&q=85"
    ],
    colors: [
      { name: "Sunflower Yellow", hex: "#E8B93C" },
      { name: "Blush Pink", hex: "#D99A9A" }
    ],
    sizes: ["2-3Y", "3-4Y", "4-5Y", "5-6Y", "6-7Y"],
    description: "Lightweight cotton sundress with a twirl-friendly skirt and floral print. Soft elastic waist for all-day comfort."
  },
  {
    id: "zmw-k06",
    name: "Polka Dot Blouse & Skort Co-Ord",
    category: "Co-Ord",
    subCategory: "Girls",
    badge: "New Drop",
    badgeType: "new",
    price: 27,
    originalPrice: null,
    rating: 4.7,
    reviewCount: 58,
    sku: "ZMW-KID-GL-02",
    inStock: true,
    stockCount: 16,
    isNew: true,
    isSale: false,
    isBestSeller: false,
    images: [
      "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&w=900&q=85"
    ],
    colors: [
      { name: "Off White", hex: "#F3EFE4" },
      { name: "Sky Blue", hex: "#9BB8CC" }
    ],
    sizes: ["3-4Y", "4-5Y", "5-6Y", "6-7Y", "7-8Y"],
    description: "Polka dot blouse with a matching pleated skort, sold as a set. Breathable cotton-blend fabric with a soft brushed inner."
  },
  {
    id: "zmw-k07",
    name: "Ruffle Sleeve Graphic Tee",
    category: "T-Shirt",
    subCategory: "Girls",
    badge: "Trending",
    badgeType: "hot",
    price: 15,
    originalPrice: 20,
    rating: 4.8,
    reviewCount: 91,
    sku: "ZMW-KID-GL-03",
    inStock: true,
    stockCount: 33,
    isNew: false,
    isSale: true,
    isBestSeller: false,
    images: [
      "https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1590480598135-3be152c87913?auto=format&fit=crop&w=900&q=85"
    ],
    colors: [
      { name: "Blush Pink", hex: "#D99A9A" },
      { name: "Lilac", hex: "#B7A6D9" },
      { name: "Off White", hex: "#F3EFE4" }
    ],
    sizes: ["2-3Y", "3-4Y", "4-5Y", "5-6Y", "6-7Y"],
    description: "Ruffle-sleeve tee with a glitter-free heart print, soft-washed for a broken-in feel from the first wear."
  },
  {
    id: "zmw-k08",
    name: "Cozy Fleece Lounge Set",
    category: "Co-Ord",
    subCategory: "Girls",
    badge: null,
    badgeType: null,
    price: 26,
    originalPrice: null,
    rating: 4.6,
    reviewCount: 39,
    sku: "ZMW-KID-GL-04",
    inStock: false,
    stockCount: 0,
    isNew: false,
    isSale: false,
    isBestSeller: false,
    images: [
      "https://images.unsplash.com/photo-1621452773781-0f992fd1f5cb?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1590480598135-3be152c87913?auto=format&fit=crop&w=900&q=85"
    ],
    colors: [
      { name: "Lilac", hex: "#B7A6D9" },
      { name: "Sage Green", hex: "#6E7A67" }
    ],
    sizes: ["4-5Y", "5-6Y", "6-7Y", "7-8Y"],
    description: "Brushed fleece top and jogger set for cozy at-home days — currently out of stock, restocking soon. A house favorite."
  },
  {
    id: "zmw-k09",
    name: "Little Fox Romper",
    category: "Romper",
    subCategory: "Toddlers",
    badge: "Best Seller",
    badgeType: "hot",
    price: 18,
    originalPrice: 24,
    rating: 4.9,
    reviewCount: 142,
    sku: "ZMW-KID-TD-01",
    inStock: true,
    stockCount: 27,
    isNew: false,
    isSale: true,
    isBestSeller: true,
    images: [
      "https://images.unsplash.com/photo-1534880786429-7cb3199b7b0f?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1596870230751-ebdfce98ec42?auto=format&fit=crop&w=900&q=85"
    ],
    colors: [
      { name: "Rust", hex: "#B85D38" },
      { name: "Off White", hex: "#F3EFE4" }
    ],
    sizes: ["0-1Y", "1-2Y", "2-3Y"],
    description: "Snap-button romper with an embroidered fox motif, soft brushed cotton lining, and easy-change poppers at the base."
  },
  {
    id: "zmw-k10",
    name: "Everyday Bodysuit 3-Pack",
    category: "Bodysuit",
    subCategory: "Toddlers",
    badge: "New Drop",
    badgeType: "new",
    price: 21,
    originalPrice: null,
    rating: 4.8,
    reviewCount: 76,
    sku: "ZMW-KID-TD-02",
    inStock: true,
    stockCount: 22,
    isNew: true,
    isSale: false,
    isBestSeller: false,
    images: [
      "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1534880786429-7cb3199b7b0f?auto=format&fit=crop&w=900&q=85"
    ],
    colors: [
      { name: "Sky Blue", hex: "#9BB8CC" },
      { name: "Sunflower Yellow", hex: "#E8B93C" },
      { name: "Off White", hex: "#F3EFE4" }
    ],
    sizes: ["0-1Y", "1-2Y"],
    description: "Three-pack of snap-bottom bodysuits in breathable combed cotton, tagless for sensitive skin."
  },
  {
    id: "zmw-k11",
    name: "Toddler Overall & Tee Set",
    category: "Co-Ord",
    subCategory: "Toddlers",
    badge: "Trending",
    badgeType: "hot",
    price: 23,
    originalPrice: 29,
    rating: 4.7,
    reviewCount: 54,
    sku: "ZMW-KID-TD-03",
    inStock: true,
    stockCount: 15,
    isNew: false,
    isSale: true,
    isBestSeller: false,
    images: [
      "https://images.unsplash.com/photo-1621452773781-0f992fd1f5cb?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&w=900&q=85"
    ],
    colors: [
      { name: "Denim Blue", hex: "#4A5A73" },
      { name: "Jungle Green", hex: "#4B5A3F" }
    ],
    sizes: ["1-2Y", "2-3Y", "3-4Y"],
    description: "Adjustable-strap overalls layered over a matching tee, with reinforced knee panels built for crawling and cruising."
  },
  {
    id: "zmw-k12",
    name: "Soft Knit Sleep Set",
    category: "Sleepwear",
    subCategory: "Toddlers",
    badge: null,
    badgeType: null,
    price: 20,
    originalPrice: null,
    rating: 4.8,
    reviewCount: 61,
    sku: "ZMW-KID-TD-04",
    inStock: true,
    stockCount: 19,
    isNew: false,
    isSale: false,
    isBestSeller: false,
    images: [
      "https://images.unsplash.com/photo-1758782213532-bbb5fd89885e?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1534880786429-7cb3199b7b0f?auto=format&fit=crop&w=900&q=85"
    ],
    colors: [
      { name: "Lilac", hex: "#B7A6D9" },
      { name: "Sage Green", hex: "#6E7A67" }
    ],
    sizes: ["0-1Y", "1-2Y", "2-3Y", "3-4Y"],
    description: "Two-piece ribbed knit sleep set with a relaxed fit for easy movement through the night. Machine washable, tumble-dry safe."
  },
  {
    id: "zmw-k13",
    name: "Varsity Stripe Polo & Shorts Set",
    category: "T-Shirt Set",
    subCategory: "Boys",
    badge: "Best Seller",
    badgeType: "hot",
    price: 25,
    originalPrice: 33,
    rating: 4.8,
    reviewCount: 88,
    sku: "ZMW-KID-BY-05",
    inStock: true,
    stockCount: 24,
    isNew: false,
    isSale: true,
    isBestSeller: true,
    images: [
      "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1758782213532-bbb5fd89885e?auto=format&fit=crop&w=900&q=85"
    ],
    colors: [
      { name: "Navy", hex: "#28344A" },
      { name: "Off White", hex: "#F3EFE4" }
    ],
    sizes: ["3-4Y", "4-5Y", "5-6Y", "6-7Y", "7-8Y", "8-9Y"],
    description: "Pique polo with contrast stripe collar, paired with matching shorts. Breathable and easy to layer for school or play."
  },
  {
    id: "zmw-k14",
    name: "Rainbow Tulle Party Dress",
    category: "Dress",
    subCategory: "Girls",
    badge: "New Drop",
    badgeType: "new",
    price: 32,
    originalPrice: null,
    rating: 4.9,
    reviewCount: 47,
    sku: "ZMW-KID-GL-05",
    inStock: true,
    stockCount: 12,
    isNew: true,
    isSale: false,
    isBestSeller: false,
    images: [
      "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1621452773781-0f992fd1f5cb?auto=format&fit=crop&w=900&q=85"
    ],
    colors: [
      { name: "Blush Pink", hex: "#D99A9A" },
      { name: "Lilac", hex: "#B7A6D9" }
    ],
    sizes: ["3-4Y", "4-5Y", "5-6Y", "6-7Y", "7-8Y"],
    description: "Tulle-skirted party dress with a soft cotton lining and a satin sash tie. Twirls beautifully, machine washable."
  },
  {
    id: "zmw-k15",
    name: "Camp Explorer Windbreaker",
    category: "Jacket",
    subCategory: "Boys",
    badge: "Trending",
    badgeType: "hot",
    price: 30,
    originalPrice: 38,
    rating: 4.7,
    reviewCount: 33,
    sku: "ZMW-KID-BY-06",
    inStock: true,
    stockCount: 14,
    isNew: false,
    isSale: true,
    isBestSeller: false,
    images: [
      "https://images.unsplash.com/photo-1758782213532-bbb5fd89885e?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1529756148791-fbca69bfe693?auto=format&fit=crop&w=900&q=85"
    ],
    colors: [
      { name: "Rust", hex: "#B85D38" },
      { name: "Navy", hex: "#28344A" }
    ],
    sizes: ["4-5Y", "5-6Y", "6-7Y", "7-8Y", "8-9Y", "9-10Y"],
    description: "Lightweight, water-resistant windbreaker with a packable hood and zip pockets. Built for park days and camping trips."
  },
  {
    id: "zmw-k16",
    name: "Butterfly Print Leggings & Tee Set",
    category: "Co-Ord",
    subCategory: "Girls",
    badge: "Best Seller",
    badgeType: "hot",
    price: 21,
    originalPrice: 27,
    rating: 4.6,
    reviewCount: 69,
    sku: "ZMW-KID-GL-06",
    inStock: false,
    stockCount: 0,
    isNew: false,
    isSale: false,
    isBestSeller: false,
    images: [
      "https://images.unsplash.com/photo-1590480598135-3be152c87913?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&w=900&q=85"
    ],
    colors: [
      { name: "Sky Blue", hex: "#9BB8CC" },
      { name: "Blush Pink", hex: "#D99A9A" }
    ],
    sizes: ["2-3Y", "3-4Y", "4-5Y", "5-6Y"],
    description: "Stretch leggings with a coordinating butterfly-print tee — currently out of stock, restocking soon. A playground favorite."
  }
];