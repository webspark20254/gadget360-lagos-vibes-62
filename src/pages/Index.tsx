import Header from "@/components/Header";
import Hero from "@/components/Hero";
import MarqueeStrip from "@/components/MarqueeStrip";
import CategoryShowcase from "@/components/CategoryShowcase";
import FeaturedProducts from "@/components/FeaturedProducts";
import Iphone17Banner from "@/components/Iphone17Banner";
import BrandStory from "@/components/BrandStory";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";
import GeminiChat from "@/components/GeminiChat";
import ResourcePreloader from "@/components/ResourcePreloader";

const Index = () => (
  <div className="min-h-screen bg-background">
    <ResourcePreloader />
    <Header />
    <main>
      <Hero />
      <MarqueeStrip />
      <CategoryShowcase />
      <Iphone17Banner />
      <FeaturedProducts />
      <BrandStory />
      <Testimonials />
    </main>
    <Footer />
    <GeminiChat />
  </div>
);

export default Index;
