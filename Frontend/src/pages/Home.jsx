import Hero from "../components/Hero/Hero";
import TrustFeatures from "../components/TrustFeatures/TrustFeatures";
import CategoryShowcase from "../components/CategoryShowcase/CategoryShowcase";
import WhatsNew from "../components/WhatsNew/WhatsNew";
import ExploreCollections from "../components/ExploreCollections/ExploreCollections";
import TabbedShowcase from "../components/TabbedShowcase/TabbedShowcase";
import SplitBanner from "../components/SplitBanner/SplitBanner";
import Testimonials from "../components/Testimonials/Testimonials";
import ImageShowcase from "../components/ImageShowcase/ImageShowcase";


export default function Home() {
  return (
    <>
      <Hero />
      <TrustFeatures />
      <CategoryShowcase />
      <WhatsNew />
      <ExploreCollections />
      <TabbedShowcase />
      <SplitBanner />
      <Testimonials />
      <ImageShowcase />
    </>
  );
}
