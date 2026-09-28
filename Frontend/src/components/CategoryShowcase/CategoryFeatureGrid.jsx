import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useShop } from "../../context/ShopContext";
import { imageUrl } from "../../utils/imageUrl";
import useCarousel from "../../hooks/useCarousel";
import {
  CAROUSEL_BREAKPOINTS,
  shouldShowCarousel,
  shouldShowArrows,
  trackOffset,
  visibleCountForWidth
} from "../../utils/carouselCore";
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
  },
  {
    id: "men-oversized",
    title: "Oversized Tees",
    tag: "100% COMBED COTTON",
    image: "/images/hero-mens-oversized-tee.jpg",
    imagePosition: "center 15%",
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
    title: "V-Neck",
    tag: "FLATTERING NECKLINE",
    image: "/images/cat-women-v-neck.jpg",
    imagePosition: "center 20%",
    link: "/collection?category=women&type=v%20neck"
  },
  {
id: "women-hoodie",
    title: "Hoodies",
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

const BOYS_CARDS = [
  {
    id: "boys-round-neck",
    title: "Round Neck",
    tag: "100% COMBED COTTON",
    image: "/images/cat-boys-round-neck.jpg",
    imagePosition: "center top",
    link: "/collection?category=boys&type=round%20neck"
  },
  {
    id: "boys-high-neck",
    title: "High Neck",
    tag: "WARM RIBBED COLLAR",
    image: "/images/cat-boys-high-neck.jpg",
    imagePosition: "center top",
    link: "/collection?category=boys&type=high%20neck"
  },
  {
    id: "boys-shorts",
    title: "Shorts",
    tag: "ACTIVE ALL-DAY PLAY",
    image: "/images/cat-boys-shorts.jpg",
    imagePosition: "center top",
    link: "/collection?category=boys&type=shorts"
  },
  {
    id: "boys-sweatshirts",
    title: "Sweatshirts",
    tag: "COZY FLEECE LAYERS",
    image: "/images/cat-boys-hoodie.jpg",
    imagePosition: "center top",
  },
  {
    id: "boys-hoodies",
    title: "Hoodies",
    tag: "SUPER-SOFT FLEECE",
    image: "/images/cat-boys-hoodie.jpg",
    imagePosition: "center top",
    link: "/collection?category=boys&type=hoodies"
  }
];

const GIRLS_CARDS = [
  {
    id: "girls-round-neck",
    title: "Round Neck",
    tag: "SOFT JERSEY FIT",
    image: "/images/cat-girls-round-neck.jpg",
    imagePosition: "center top",
    link: "/collection?category=girls&type=round%20neck"
  },
  {
    id: "girls-high-neck",
    title: "High Neck",
    tag: "COZY ELEVATED LAYER",
    image: "/images/cat-girls-high-neck.jpg",
    imagePosition: "center top",
    link: "/collection?category=girls&type=high%20neck"
  },
  {
    id: "girls-shorts",
    title: "Shorts",
    tag: "SUMMER ESSENTIAL",
    image: "/images/cat-boys-shorts.jpg",
    imagePosition: "center top",
  },
  {
    id: "girls-sweatshirts",
    title: "Sweatshirts",
    tag: "SOFT FLEECE WARMTH",
    image: "/images/cat-girls-high-neck.jpg",
    imagePosition: "center top",
  },
  {
    id: "girls-hoodies",
    title: "Hoodies",
    tag: "RELAXED HOODED SWEAT",
    image: "/images/cat-girls-round-neck.jpg",
    imagePosition: "center top",
  },
  {
id: "girls-nightwear",
    title: "Nightwear",
    tag: "BREATHABLE COMFORT",
    image: "/images/cat-girls-nightwear.jpg",
    imagePosition: "center top",
    link: "/collection?category=girls&type=night%20wear"
  },
  {
    id: "girls-long-gown",
    title: "Long Gown",
    tag: "PARTY & OCCASION",
    image: "/images/cat-girls-long-gown.jpg",
    imagePosition: "center top",
    link: "/collection?category=girls&type=long%20gown"
  }
];

const BABIES_CARDS = [
  {
id: "babies-romper",
    title: "Rompers",
    tag: "SNAP-BUTTON SOFTNESS",
    image: "/images/cat-babies-romper.jpg",
    imagePosition: "center top",
    link: "/collection?category=babies&type=romper"
  },
  {
id: "babies-tshirt",
    title: "Baby Tees",
    tag: "ORGANIC COTTON",
    image: "/images/cat-babies-tshirt.jpg",
    imagePosition: "center top",
    link: "/collection?category=babies&type=t-shirt"
  },
  {
id: "babies-pyjama",
    title: "Pyjamas",
    tag: "GENTLE ELASTIC WAIST",
    image: "/images/cat-babies-pyjama.jpg",
    imagePosition: "center top",
    link: "/collection?category=babies&type=babies%20pyjama"
  },
  {
    id: "babies-sweatshirts",
    title: "Sweatshirts",
    tag: "TINY COZY LAYERS",
    image: "/images/cat-babies-hoodie.jpg",
    imagePosition: "center top",
  },
  {
id: "babies-hoodies",
    title: "Hoodies",
    tag: "TINY WARM LAYERS",
    image: "/images/cat-babies-hoodie.jpg",
    imagePosition: "center top",
    link: "/collection?category=babies&type=babies%20hoodies"
  },
  {
    id: "babies-bottoms",
    title: "Babies Bottoms",
    tag: "ALL-DAY COMFORT",
    image: "/images/cat-babies-pyjama.jpg",
    imagePosition: "center top",
  }
];

const cleanCategoryTitle = (rawTitle, fallbackTitle) => {
  if (!rawTitle) return fallbackTitle;
  if (rawTitle === "Men's Edit") return "Men Categories";
  if (rawTitle === "Women's Edit") return "Women Categories";
  if (rawTitle === "Boys' Edit") return "Boys Categories";
  if (rawTitle === "Girls' Edit") return "Girls Categories";
  if (rawTitle === "Babies' Edit") return "Babies Categories";
  return rawTitle;
};

function SubcategoryTile({ card }) {
  return (
    <Link to={card.link} className="cat-feature-card">
      <div className="cat-feature-img-wrap">
        <img
          src={imageUrl(card.image) || "/images/photo-1521572163474-6864f9cf17ab.jpg"}
          alt={card.title}
          className="cat-feature-img"
          loading="lazy"
          style={card.imagePosition ? { objectPosition: card.imagePosition } : undefined}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = "/images/photo-1521572163474-6864f9cf17ab.jpg";
          }}
        />
        <div className="cat-feature-overlay" />
        <span className="cat-feature-tag">{card.tag}</span>
      </div>
      <div className="cat-feature-caption"><h3 className="cat-feature-name">{card.title}</h3></div>
    </Link>
  );
}

function CarouselArrow({ direction, onClick, label }) {
  return (
    <button
      type="button"
      className={`cat-feature-arrow ${direction}`}
      onClick={onClick}
      aria-label={label}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <polyline points={direction === "left" ? "15 18 9 12 15 6" : "9 18 15 12 9 6"}></polyline>
      </svg>
    </button>
  );
}

function CategoryCards({ cards, categorySlug, defaultTag = "CATEGORY" }) {
  const { homeData, allProducts } = useShop();
  const category = homeData?.categories?.find((item) => item.slug === categorySlug);

  // Same breakpoints as the static grid below, so a row does not change tile
  // size when it tips over into carousel mode.
  const [visibleCount, setVisibleCount] = useState(CAROUSEL_BREAKPOINTS.wide);
  useEffect(() => {
    const handleResize = () => setVisibleCount(visibleCountForWidth(window.innerWidth));
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fallbackCardFor = (subcategory) => {
    const subNameClean = subcategory.name.toLowerCase().replace(/[^a-z0-9]/g, "");
    return cards.find((card) => {
      const cardTitleClean = card.title.toLowerCase().replace(/[^a-z0-9]/g, "");
      const cardIdClean = card.id.toLowerCase().replace(/[^a-z0-9]/g, "");
      return (
        cardTitleClean === subNameClean ||
        cardIdClean.includes(subNameClean) ||
        subNameClean.includes(cardTitleClean)
      );
    }) || null;
  };

  const fallbackImageFor = (subcategory) => {
    const directCard = fallbackCardFor(subcategory);
    if (directCard?.image) return directCard.image;

    const subNameClean = subcategory.name.toLowerCase().replace(/[^a-z0-9]/g, "");
    const matchingProduct = allProducts?.find((p) => {
      const pSub = (p.subCategory || "").toLowerCase().replace(/[^a-z0-9]/g, "");
      const pCat = (p.category || "").toLowerCase();
      return pSub === subNameClean || (pCat === categorySlug.toLowerCase() && p.images?.length > 0);
    });
    if (matchingProduct?.images?.[0]) return matchingProduct.images[0];

    return category?.image_url || cards[0]?.image || "/images/photo-1521572163474-6864f9cf17ab.jpg";
  };

  const fallbackPositionFor = (subcategory) => {
    const directCard = fallbackCardFor(subcategory);
    return directCard?.imagePosition || "center top";
  };

  const sanitizeTag = (tag) => {
    if (!tag) return defaultTag;
    if (/edit/i.test(tag)) return defaultTag;
    return tag;
  };

  // The admin "Show on Homepage" toggle is authoritative: render exactly the
  // enabled subcategories, never pad the row back out with placeholder cards.
  const visibleSubcategories = (category?.subcategories || []).filter(
    (subcategory) => subcategory.show_on_homepage !== false
  );

  let items;
  if (visibleSubcategories.length > 0) {
    items = visibleSubcategories.map((subcategory) => {
      const direct = fallbackCardFor(subcategory);
      return {
        id: subcategory.id,
        title: subcategory.name,
        tag: direct?.tag ? sanitizeTag(direct.tag) : sanitizeTag(category.name.toUpperCase()),
        image: subcategory.image_url || fallbackImageFor(subcategory),
        imagePosition: subcategory.image_position || fallbackPositionFor(subcategory),
        link: direct?.link || `/collection?category=${encodeURIComponent(category.slug)}&type=${encodeURIComponent(subcategory.slug || subcategory.name.toLowerCase())}`
      };
    });
  } else {
    // No subcategories configured (or every one toggled off): fall back to the
    // curated static cards so the section is never empty.
    items = cards.slice(0, 4).map((card) => ({ ...card, tag: sanitizeTag(card.tag) }));
  }

  // Manual-only carousel: the tiles are links, so navigation is by arrow only.
  const { index, next, prev, setPaused } = useCarousel(items.length, visibleCount, 0);

  if (!shouldShowCarousel(items.length, visibleCount)) {
    return (
      <div className="cat-feature-grid cat-feature-grid--four">
        {items.map((card) => (
          <SubcategoryTile key={card.id} card={card} />
        ))}
      </div>
    );
  }

  const slideWidth = 100 / visibleCount;

  return (
    <div
      className="cat-feature-carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
    >
      {shouldShowArrows(items.length, visibleCount) && (
        <CarouselArrow direction="left" onClick={prev} label="Previous subcategories" />
      )}

      <div className="cat-feature-carousel-viewport">
        <div
          className="cat-feature-carousel-track"
          style={{
            transform: `translateX(-${trackOffset(index, visibleCount)}%)`,
            transition: "transform 450ms cubic-bezier(0.25, 1, 0.5, 1)"
          }}
        >
          {items.map((card) => (
            <div
              key={card.id}
              className="cat-feature-carousel-slide"
              style={{ flex: `0 0 ${slideWidth}%`, maxWidth: `${slideWidth}%` }}
            >
              <SubcategoryTile card={card} />
            </div>
          ))}
        </div>
      </div>

      {shouldShowArrows(items.length, visibleCount) && (
        <CarouselArrow direction="right" onClick={next} label="Next subcategories" />
      )}
    </div>
  );
}

/* ── Section 3: Men Categories Export ── */
export function MensCategoriesSection() {
  const { homeData } = useShop();
  const category = homeData?.categories?.find((item) => item.slug === "mens" || item.slug === "men");
  if (category && (category.show_on_homepage === false || category.is_active === false)) return null;
  const section = homeData?.sections?.find((item) => item.section_key === "mens_categories");
  return (
    <section className="category-feature-section mens-feature-section" aria-label="Men Categories">
      <div className="container">
        <div className="section-header-left">
          <div className="section-eyebrow-badge">
            <span className="eyebrow-dot" />
            <span className="eyebrow-text">MEN CATEGORIES</span>
          </div>
          <h2 className="section-heading-title">{cleanCategoryTitle(section?.title, "Men Categories")}</h2>
          <p className="section-heading-subtitle">
            {section?.subtitle || "Crew-neck tees, crisp polos, and heavyweight fleece hoodies — everyday essentials cut for a clean, modern fit."}
          </p>
        </div>

        <CategoryCards cards={MEN_CARDS} categorySlug={section?.config?.categorySlug || "mens"} defaultTag="MEN CATEGORIES" />
      </div>
    </section>
  );
}

/* ── Section 4: Women Categories Export ── */
export function WomensCategoriesSection() {
  const { homeData } = useShop();
  const category = homeData?.categories?.find((item) => item.slug === "women" || item.slug === "womens");
  if (category && (category.show_on_homepage === false || category.is_active === false)) return null;
  const section = homeData?.sections?.find((item) => item.section_key === "womens_categories");
  return (
    <section className="category-feature-section womens-feature-section" aria-label="Women Categories">
      <div className="container">
        <div className="section-header-left">
          <div className="section-eyebrow-badge">
            <span className="eyebrow-dot" />
            <span className="eyebrow-text">WOMEN CATEGORIES</span>
          </div>
          <h2 className="section-heading-title">{cleanCategoryTitle(section?.title, "Women Categories")}</h2>
          <p className="section-heading-subtitle">
            {section?.subtitle || "Round necks, v-necks, hoodies, and tees in soft combed cotton for an easy, elevated everyday look."}
          </p>
        </div>

        <CategoryCards cards={WOMEN_CARDS} categorySlug={section?.config?.categorySlug || "women"} defaultTag="WOMEN CATEGORIES" />
      </div>
    </section>
  );
}

/* ── Section 5: Boys Categories Export ── */
export function BoysCategoriesSection() {
  const { homeData } = useShop();
  const category = homeData?.categories?.find((item) => item.slug === "boys");
  if (category && (category.show_on_homepage === false || category.is_active === false)) return null;
  const section = homeData?.sections?.find((item) => item.section_key === "boys_categories");
  return (
    <section className="category-feature-section boys-feature-section" aria-label="Boys Categories">
      <div className="container">
        <div className="section-header-left">
          <div className="section-eyebrow-badge">
            <span className="eyebrow-dot" />
            <span className="eyebrow-text">BOYS CATEGORIES</span>
          </div>
          <h2 className="section-heading-title">{cleanCategoryTitle(section?.title, "Boys Categories")}</h2>
          <p className="section-heading-subtitle">
            {section?.subtitle || "Round necks, high necks, shorts, and fleece hoodies built for play and all-day comfort."}
          </p>
        </div>

        <CategoryCards cards={BOYS_CARDS} categorySlug={section?.config?.categorySlug || "boys"} defaultTag="BOYS CATEGORIES" />
      </div>
    </section>
  );
}

/* ── Section 6: Girls Categories Export ── */
export function GirlsCategoriesSection() {
  const { homeData } = useShop();
  const category = homeData?.categories?.find((item) => item.slug === "girls");
  if (category && (category.show_on_homepage === false || category.is_active === false)) return null;
  const section = homeData?.sections?.find((item) => item.section_key === "girls_categories");
  return (
    <section className="category-feature-section girls-feature-section" aria-label="Girls Categories">
      <div className="container">
        <div className="section-header-left">
          <div className="section-eyebrow-badge">
            <span className="eyebrow-dot" />
            <span className="eyebrow-text">GIRLS CATEGORIES</span>
          </div>
          <h2 className="section-heading-title">{cleanCategoryTitle(section?.title, "Girls Categories")}</h2>
          <p className="section-heading-subtitle">
            {section?.subtitle || "Breathable tees, high necks, comfortable nightwear, and twirl-ready party gowns in soft cotton."}
          </p>
        </div>

        <CategoryCards cards={GIRLS_CARDS} categorySlug={section?.config?.categorySlug || "girls"} defaultTag="GIRLS CATEGORIES" />
      </div>
    </section>
  );
}

/* ── Section 7: Babies Categories Export ── */
export function BabiesCategoriesSection() {
  const { homeData } = useShop();
  const category = homeData?.categories?.find((item) => item.slug === "babies");
  if (category && (category.show_on_homepage === false || category.is_active === false)) return null;
  const section = homeData?.sections?.find((item) => item.section_key === "babies_categories");
  return (
    <section className="category-feature-section babies-feature-section" aria-label="Babies Categories">
      <div className="container">
        <div className="section-header-left">
          <div className="section-eyebrow-badge">
            <span className="eyebrow-dot" />
            <span className="eyebrow-text">BABIES CATEGORIES</span>
          </div>
          <h2 className="section-heading-title">{cleanCategoryTitle(section?.title, "Babies Categories")}</h2>
          <p className="section-heading-subtitle">
            {section?.subtitle || "Ultra-soft snap rompers, baby tees, elasticated pyjamas, and cozy tiny hoodies crafted with tender care."}
          </p>
        </div>

        <CategoryCards cards={BABIES_CARDS} categorySlug={section?.config?.categorySlug || "babies"} defaultTag="BABIES CATEGORIES" />
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
      <BoysCategoriesSection />
      <GirlsCategoriesSection />
      <BabiesCategoriesSection />
    </>
  );
}
