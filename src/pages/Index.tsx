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
import Seo from "@/components/Seo";

const Index = () => (
  <div className="min-h-screen bg-background">
    <Seo
      title="Gadget360.ng — Authentic Phones, Laptops & Consoles in Lagos"
      description="Buy authentic smartphones, laptops, gaming consoles and accessories in Lagos with warranty. Free Lagos delivery, nationwide shipping. WhatsApp +234 810 841 8727."
      canonical="/"
      jsonLd={[
        {
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          "@id": "https://gadget360.ng/#business",
          name: "Gadget360.ng",
          image: "https://gadget360.ng/favicon.png",
          url: "https://gadget360.ng",
          telephone: "+2348108418727",
          priceRange: "₦₦",
          address: {
            "@type": "PostalAddress",
            streetAddress: "24 Adegbola Street, Opposite Railway Line",
            addressLocality: "Ikeja",
            addressRegion: "Lagos",
            addressCountry: "NG",
          },
          openingHoursSpecification: [{
            "@type": "OpeningHoursSpecification",
            dayOfWeek: ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],
            opens: "09:00",
            closes: "19:00",
          }],
          sameAs: [
            "https://www.facebook.com/share/1AFDYyR6RC/?mibextid=wwXIfr",
            "https://www.instagram.com/gadget360ngbackuppage",
            "https://www.threads.net/@gadget360.ng",
          ],
        },
        {
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Gadget360.ng",
          url: "https://gadget360.ng",
          potentialAction: {
            "@type": "SearchAction",
            target: "https://gadget360.ng/shop?search={search_term_string}",
            "query-input": "required name=search_term_string",
          },
        },
      ]}
    />
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
