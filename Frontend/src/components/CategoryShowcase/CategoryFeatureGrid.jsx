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
    id: "girls-nightwear",
    title: "Casual Wear",
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
    id: "babies-hoodies",
    title: "Hoodies",
    tag: "TINY WARM LAYERS",
    image: "/images/cat-babies-hoodie.jpg",
    imagePosition: "center top",
    link: "/collection?category=babies&type=babies%20hoodies"
  }
];

function CategoryCards({ cards }) {
  return cards.map((card) => (
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
      <div className="cat-feature-caption"><h3 className="cat-feature-name">{card.title}</h3></div>
    </Link>
  ));
}

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
          <CategoryCards cards={MEN_CARDS} />
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
          <CategoryCards cards={WOMEN_CARDS} />
        </div>
      </div>
    </section>
  );
}

/* ── Section 5: Boys' Categories Export ── */
export function BoysCategoriesSection() {
  return (
    <section className="category-feature-section boys-feature-section" aria-label="Boys' Categories">
      <div className="container">
        <div className="section-header-left">
          <div className="section-eyebrow-badge">
            <span className="eyebrow-dot" />
            <span className="eyebrow-text">BOYS' ESSENTIALS</span>
          </div>
          <h2 className="section-heading-title">Boys' Categories</h2>
          <p className="section-heading-subtitle">
            Round necks, high necks, shorts, and fleece hoodies built for play and all-day comfort.
          </p>
        </div>

        <div className="cat-feature-grid cat-feature-grid--four">
          <CategoryCards cards={BOYS_CARDS} />
        </div>
      </div>
    </section>
  );
}

/* ── Section 6: Girls' Categories Export ── */
export function GirlsCategoriesSection() {
  return (
    <section className="category-feature-section girls-feature-section" aria-label="Girls' Categories">
      <div className="container">
        <div className="section-header-left">
          <div className="section-eyebrow-badge">
            <span className="eyebrow-dot" />
            <span className="eyebrow-text">GIRLS' ESSENTIALS</span>
          </div>
          <h2 className="section-heading-title">Girls' Categories</h2>
          <p className="section-heading-subtitle">
            Breathable tees, high necks, comfortable nightwear, and twirl-ready party gowns in soft cotton.
          </p>
        </div>

        <div className="cat-feature-grid cat-feature-grid--four">
          <CategoryCards cards={GIRLS_CARDS} />
        </div>
      </div>
    </section>
  );
}

/* ── Section 7: Babies' Categories Export ── */
export function BabiesCategoriesSection() {
  return (
    <section className="category-feature-section babies-feature-section" aria-label="Babies' Categories">
      <div className="container">
        <div className="section-header-left">
          <div className="section-eyebrow-badge">
            <span className="eyebrow-dot" />
            <span className="eyebrow-text">BABIES' ESSENTIALS</span>
          </div>
          <h2 className="section-heading-title">Babies' Categories</h2>
          <p className="section-heading-subtitle">
            Ultra-soft snap rompers, baby tees, elasticated pyjamas, and cozy tiny hoodies crafted with tender care.
          </p>
        </div>

        <div className="cat-feature-grid cat-feature-grid--four">
          <CategoryCards cards={BABIES_CARDS} />
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
      <BoysCategoriesSection />
      <GirlsCategoriesSection />
      <BabiesCategoriesSection />
    </>
  );
}
