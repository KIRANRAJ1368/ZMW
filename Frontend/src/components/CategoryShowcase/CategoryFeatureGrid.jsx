import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useShop } from "../../context/ShopContext";
import { imageUrl } from "../../utils/imageUrl";
import useManualScrollCarousel from "../../hooks/useManualScrollCarousel";
import {
  CAROUSEL_BREAKPOINTS,
  shouldShowArrows,
  visibleCountForWidth
} from "../../utils/carouselCore";
import "./CategoryFeatureGrid.css";

function SubcategoryTile({ card }) {
  const hasImage = Boolean(card.image && typeof card.image === "string" && card.image.trim());
  return (
    <Link to={card.link} className="cat-feature-card">
      <div className="cat-feature-img-wrap">
        {hasImage ? (
          <img
            src={imageUrl(card.image)}
            alt={card.title}
            className="cat-feature-img"
            loading="lazy"
            style={card.imagePosition ? { objectPosition: card.imagePosition } : undefined}
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <div className="cat-feature-no-img">
            <span className="cat-feature-no-img-text">{card.title}</span>
          </div>
        )}
        <div className="cat-feature-overlay" />
      </div>
      <div className="cat-feature-caption">
        <h3 className="cat-feature-name">{card.title}</h3>
      </div>
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

export function CategoryCards({ cards: customCards, category: directCategory, categorySlug, defaultTag = "CATEGORY" }) {
  const { homeData } = useShop();
  const slug = categorySlug || directCategory?.slug || "";
  const category = directCategory || homeData?.categories?.find((item) => item.slug === slug || (slug === "mens" && item.slug === "men"));

  const [visibleCount, setVisibleCount] = useState(CAROUSEL_BREAKPOINTS.wide);
  useEffect(() => {
    const handleResize = () => setVisibleCount(visibleCountForWidth(window.innerWidth));
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const sanitizeTag = (tag) => {
    if (!tag) return defaultTag;
    if (/edit/i.test(tag)) return defaultTag;
    return tag;
  };

  // Authoritative admin toggle: render active subcategories
  const visibleSubcategories = (category?.subcategories || []).filter(
    (subcategory) => subcategory.show_on_homepage !== false && subcategory.is_active !== false
  );

  let items = [];
  if (Array.isArray(customCards) && customCards.length > 0) {
    items = customCards;
  } else if (visibleSubcategories.length > 0) {
    items = visibleSubcategories.map((subcategory) => {
      // Show image ONLY when added from Admin for this subcategory
      const image = subcategory.image_url || null;
      return {
        id: subcategory.id,
        title: subcategory.name,
        tag: sanitizeTag(category?.name?.toUpperCase() || defaultTag),
        image,
        imagePosition: subcategory.image_position || "center top",
        link: `/collection?category=${encodeURIComponent(category?.slug || slug)}&type=${encodeURIComponent(subcategory.slug || subcategory.name.toLowerCase())}`
      };
    });
  }

  if (items.length === 0) {
    return null;
  }

  const { trackRef, scrollNext, scrollPrev, containerProps, trackProps } = useManualScrollCarousel({
    autoDelayMs: 0
  });

  const slideWidth = 100 / visibleCount;

  return (
    <div className="cat-feature-carousel" {...containerProps}>
      {shouldShowArrows(items.length, visibleCount) && (
        <CarouselArrow direction="left" onClick={scrollPrev} label="Previous categories" />
      )}

      <div className="cat-feature-carousel-viewport" {...trackProps}>
        <div className="cat-feature-carousel-track">
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
        <CarouselArrow direction="right" onClick={scrollNext} label="Next categories" />
      )}
    </div>
  );
}

/* ── Generic Data-Driven Category Section ── */
export function CategorySection({ category, section }) {
  if (!category || category.is_active === false || category.show_on_homepage === false) {
    return null;
  }
  if (section && section.is_active === false) {
    return null;
  }

  const visibleSubcategories = (category?.subcategories || []).filter(
    (subcategory) => subcategory.show_on_homepage !== false && subcategory.is_active !== false
  );
  if (visibleSubcategories.length === 0) {
    return null;
  }

  const eyebrowText = `${category.name.toUpperCase()} CATEGORIES`;
  const defaultTitle = `${category.name} Categories`;
  const defaultSubtitle =
    category.description ||
    `Explore premium ${category.name.toLowerCase()} essentials crafted for an elevated, modern fit.`;

  const title = section?.title || defaultTitle;
  const subtitle = section?.subtitle || defaultSubtitle;
  const slugClass = `${category.slug}-feature-section`;

  return (
    <section className={`category-feature-section ${slugClass}`} aria-label={`${category.name} Categories`}>
      <div className="container">
        <div className="section-header-left">
          <div className="section-eyebrow-badge">
            <span className="eyebrow-dot" />
            <span className="eyebrow-text">{eyebrowText}</span>
          </div>
          <h2 className="section-heading-title">{title}</h2>
          <p className="section-heading-subtitle">{subtitle}</p>
        </div>

        <CategoryCards
          category={category}
          categorySlug={category.slug}
          defaultTag={eyebrowText}
        />
      </div>
    </section>
  );
}

/* ── Backwards-Compatible Category Section Exports ── */
export function MensCategoriesSection() {
  const { homeData } = useShop();
  const category = homeData?.categories?.find((item) => item.slug === "mens" || item.slug === "men");
  const section = homeData?.sections?.find((item) => item.section_key === "mens_categories");
  return category ? <CategorySection category={category} section={section} /> : null;
}

export function WomensCategoriesSection() {
  const { homeData } = useShop();
  const category = homeData?.categories?.find((item) => item.slug === "women" || item.slug === "womens");
  const section = homeData?.sections?.find((item) => item.section_key === "womens_categories");
  return category ? <CategorySection category={category} section={section} /> : null;
}

export function BoysCategoriesSection() {
  const { homeData } = useShop();
  const category = homeData?.categories?.find((item) => item.slug === "boys");
  const section = homeData?.sections?.find((item) => item.section_key === "boys_categories");
  return category ? <CategorySection category={category} section={section} /> : null;
}

export function GirlsCategoriesSection() {
  const { homeData } = useShop();
  const category = homeData?.categories?.find((item) => item.slug === "girls");
  const section = homeData?.sections?.find((item) => item.section_key === "girls_categories");
  return category ? <CategorySection category={category} section={section} /> : null;
}

export function BabiesCategoriesSection() {
  const { homeData } = useShop();
  const category = homeData?.categories?.find((item) => item.slug === "babies");
  const section = homeData?.sections?.find((item) => item.section_key === "babies_categories");
  return category ? <CategorySection category={category} section={section} /> : null;
}

/* ── Main CategoryFeatureGrid Export (Data-Driven across all categories) ── */
export default function CategoryFeatureGrid() {
  const { homeData } = useShop();
  const categories = (homeData?.categories || [])
    .filter((c) => c.is_active !== false && c.show_on_homepage !== false)
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  const sectionMap = new Map((homeData?.sections || []).map((s) => [s.section_key, s]));

  return (
    <>
      {categories.map((category) => {
        const sectionKey =
          category.slug === "mens" || category.slug === "men"
            ? "mens_categories"
            : category.slug === "women" || category.slug === "womens"
            ? "womens_categories"
            : `${category.slug}_categories`;
        const section = sectionMap.get(sectionKey) || sectionMap.get(category.slug);
        return <CategorySection key={category.id || category.slug} category={category} section={section} />;
      })}
    </>
  );
}
