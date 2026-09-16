import Hero from "../components/Hero/Hero";
import CategoryVisuals from "../components/CategoryShowcase/CategoryVisuals";
import { NewArrivalsSection, BestSellersSection } from "../components/CuratedShowcase/CuratedShowcase";
import { MensCategoriesSection, WomensCategoriesSection } from "../components/CategoryShowcase/CategoryFeatureGrid";
import Newsletter from "../components/Newsletter/Newsletter";
import ImageShowcase from "../components/ImageShowcase/ImageShowcase";

export default function Home() {
  return (
    <>
      {/* 1. Hero Banner */}
      <Hero />

      {/* 2. Explore by Department */}
      <CategoryVisuals />

      {/* 3. New Arrivals */}
      <NewArrivalsSection />

      {/* 4. Men's Categories */}
      <MensCategoriesSection />

      {/* 5. Women's Categories */}
      <WomensCategoriesSection />

      {/* 6. Best Sellers */}
      <BestSellersSection />

      {/* 7. Newsletter */}
      <Newsletter />

      {/* 8. ZMW on Instagram */}
      <ImageShowcase />
    </>
  );
}

