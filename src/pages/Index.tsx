import Header from "@/components/Header";
import Hero from "@/components/Hero";
import FeaturedProducts from "@/components/FeaturedProducts";
import StatsSection from "@/components/StatsSection";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";
import GeminiChat from "@/components/GeminiChat";
import MobileNavigation from "@/components/MobileNavigation";
import DesktopSidebar from "@/components/DesktopSidebar";
import ResourcePreloader from "@/components/ResourcePreloader";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <ResourcePreloader />
      <Header />
      <DesktopSidebar />
      <main className="pb-24 md:pb-0">
        <Hero />
        <FeaturedProducts />
        <StatsSection />
        <Testimonials />
      </main>
      <Footer />
      <GeminiChat />
      <MobileNavigation />
    </div>
  );
};

export default Index;
