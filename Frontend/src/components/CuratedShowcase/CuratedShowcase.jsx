import React, { useMemo, useRef, useState, useEffect, useCallback } from "react";
import { useShop } from "../../context/ShopContext";
import {
  getBestSellers,
  getNewArrivals,
  generateCatalogJsonLd
} from "../../utils/merchandising";
import CuratedCard from "./CuratedCard";
import CTABanner from "../CTABanner/CTABanner";
import "./CuratedShowcase.css";

/* ── Carousel Hook ── */
function useCarousel(itemsCount, visibleCount, autoDelayMs = 4000) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef(null);

  const maxIndex = Math.max(0, itemsCount - visibleCount);

  const next = useCallback(() => {
    setIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  }, [maxIndex]);

  const prev = useCallback(() => {
    setIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  }, [maxIndex]);

  useEffect(() => {
    if (paused || itemsCount <= visibleCount) return;
    timerRef.current = setInterval(next, autoDelayMs);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [paused, next, autoDelayMs, itemsCount, visibleCount]);

  useEffect(() => {
    setIndex(0);
  }, [itemsCount, visibleCount]);

  return { index, maxIndex, next, prev, setPaused };
}

/* ── ProductCarousel Component ── */
function ProductCarousel({
  products,
  badgeLabelKey,
  defaultBadge,
  badgeTone,
  sectionId,
  eyebrow,
  title,
  subtitle,
  viewAllTo,
  viewAllLabel,
  bgClass,
  filterPills,
  selectedPill,
  onPillChange,
}) {
  const [visibleCount, setVisibleCount] = useState(4);

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      if (w <= 520) {
        setVisibleCount(1);
      } else if (w <= 768) {
        setVisibleCount(2);
      } else if (w <= 1100) {
        setVisibleCount(3);
      } else {
        setVisibleCount(4);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const { index, maxIndex, next, prev, setPaused } = useCarousel(
    products.length,
    visibleCount,
    4000
  );

  return (
    <section
      id={sectionId}
      className={`curated-section ${bgClass}`}
      aria-label={title}
    >
      <div className="container">
        {/* Header Row: heading left + CTA button right */}
        <div className="curated-header-row">
          <div className="section-header-left">
            <div className="section-eyebrow-badge">
              <span className="eyebrow-dot" />
              <span className="eyebrow-text">{eyebrow}</span>
            </div>
            <h2 className="section-heading-title">{title}</h2>
            <p className="section-heading-subtitle">{subtitle}</p>
          </div>
          <CTABanner
            ctaTo={viewAllTo}
            ctaLabel={viewAllLabel}
          />
        </div>

        {/* Filter Pills (e.g. for New Arrivals) */}
        {filterPills && (
          <div className="curated-dept-pills">
            {filterPills.map((d) => (
              <button
                key={d.id}
                type="button"
                className={`curated-dept-pill ${selectedPill === d.id ? "active" : ""}`}
                onClick={() => onPillChange(d.id)}
              >
                {d.label}
              </button>
            ))}
          </div>
        )}

        {/* Carousel Viewport & Floating Arrows */}
        <div
          className="carousel-container"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onTouchStart={() => setPaused(true)}
          onTouchEnd={() => setPaused(false)}
        >
          {/* Side arrow left */}
          <button
            type="button"
            className="carousel-side-arrow left"
            onClick={prev}
            aria-label="Previous slide"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>

          {/* Track Viewport */}
          <div className="carousel-viewport">
            <div
              className="carousel-slider-track"
              style={{
                transform: `translateX(-${index * (100 / visibleCount)}%)`,
                transition: "transform 450ms cubic-bezier(0.25, 1, 0.5, 1)",
              }}
            >
              {products.map((item) => (
                <div
                  key={item.id}
                  className="carousel-slide-item"
                  style={{
                    flex: `0 0 ${100 / visibleCount}%`,
                    maxWidth: `${100 / visibleCount}%`,
                  }}
                >
                  <CuratedCard
                    product={item}
                    badgeLabel={item[badgeLabelKey] || defaultBadge}
                    badgeTone={badgeTone}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Side arrow right */}
          <button
            type="button"
            className="carousel-side-arrow right"
            onClick={next}
            aria-label="Next slide"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}

/* ── Individual Section 2: New Arrivals Export ── */
export function NewArrivalsSection() {
  const { allProducts, products, homeData } = useShop();

  const catalog = useMemo(() => {
    return allProducts && allProducts.length > 0 ? allProducts : products;
  }, [allProducts, products]);

  const bestSellers = useMemo(() => {
    return getBestSellers(catalog, { limit: 12, period: "30d" });
  }, [catalog]);

  const bestSellerIds = useMemo(() => {
    return bestSellers.map((p) => p.id);
  }, [bestSellers]);

  const newArrivals = useMemo(() => {
    return homeData?.newArrivals?.length
      ? homeData.newArrivals
      : getNewArrivals(catalog, bestSellerIds, { limit: 12 });
  }, [catalog, bestSellerIds, homeData]);

  const section = homeData?.sections?.find((item) => item.section_key === "new_arrivals");

  const [selectedDept, setSelectedDept] = useState("all");

  const displayedNewArrivals = useMemo(() => {
    if (selectedDept === "all") return newArrivals;
    const filtered = catalog.filter((p) => {
      if (selectedDept === "mens") return p.category === "mens" || p.category === "men";
      if (selectedDept === "women") return p.category === "women";
      if (selectedDept === "boys") return p.category === "boys";
      if (selectedDept === "girls") return p.category === "girls";
      if (selectedDept === "kids") return p.category === "kids" || p.category === "boys" || p.category === "girls";
      if (selectedDept === "babies")
        return (
          p.category === "babies" ||
          (p.subCategory && p.subCategory.toLowerCase().includes("bab")) ||
          (p.name && p.name.toLowerCase().includes("baby"))
        );
      return true;
    });
    return filtered.length > 0 ? filtered.slice(0, 12) : newArrivals;
  }, [catalog, newArrivals, selectedDept]);

  const newArrivalsJsonLd = useMemo(() => {
    return generateCatalogJsonLd(newArrivals, "ZMW New Arrivals Collection");
  }, [newArrivals]);

  const deptPills = [
    { id: "all", label: "All Items" },
    { id: "mens", label: "Men" },
    { id: "women", label: "Women" },
    { id: "boys", label: "Boys" },
    { id: "girls", label: "Girls" },
    { id: "kids", label: "Kids" },
    { id: "babies", label: "Babies" },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(newArrivalsJsonLd) }}
      />
      <ProductCarousel
        products={displayedNewArrivals}
        badgeLabelKey="newArrivalBadge"
        defaultBadge="NEW"
        badgeTone="new"
        sectionId="whats-new-this-season"
        eyebrow="JUST RELEASED 2026"
        title={section?.title || "New Arrivals"}
        subtitle={section?.subtitle || "Directly from our design atelier. Freshly dropped silhouettes with zero overlap with our best-seller lineup."}
        viewAllTo="/collection?collection=new-arrivals"
        viewAllLabel="Explore All New Arrivals"
        bgClass="new-arrivals-section"
        filterPills={deptPills}
        selectedPill={selectedDept}
        onPillChange={setSelectedDept}
      />
    </>
  );
}

/* ── Individual Section 5: Best Sellers Export ── */
export function BestSellersSection() {
  const { allProducts, products, homeData } = useShop();

  const catalog = useMemo(() => {
    return allProducts && allProducts.length > 0 ? allProducts : products;
  }, [allProducts, products]);

  const bestSellers = useMemo(() => {
    return homeData?.bestSellers?.length
      ? homeData.bestSellers
      : getBestSellers(catalog, { limit: 12, period: "30d" });
  }, [catalog, homeData]);

  const section = homeData?.sections?.find((item) => item.section_key === "best_sellers");

  const bestSellersJsonLd = useMemo(() => {
    return generateCatalogJsonLd(bestSellers, "ZMW Best Sellers Collection");
  }, [bestSellers]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(bestSellersJsonLd) }}
      />
      <ProductCarousel
        products={bestSellers}
        badgeLabelKey="salesRankBadge"
        defaultBadge="BEST SELLER"
        badgeTone="hot"
        sectionId="most-loved-pieces"
        eyebrow="MOST COVETED PIECES"
        title={section?.title || "Best Sellers"}
        subtitle={section?.subtitle || "Data-backed essentials: garments with peak sales volume, stellar verified reviews, and enduring customer demand."}
        viewAllTo="/collection?collection=best-sellers"
        viewAllLabel="View All Best Sellers"
        bgClass="best-sellers-section"
      />
    </>
  );
}

/* ── Main CuratedShowcase Export (Backwards Compatible) ── */
export default function CuratedShowcase() {
  return (
    <div className="curated-showcase-wrapper">
      <NewArrivalsSection />
      <BestSellersSection />
    </div>
  );
}
