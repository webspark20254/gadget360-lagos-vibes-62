import { ArrowRight, Shield, Truck, Award, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import heroDevices from "@/assets/hero-devices.png";

const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-hero-light dark:bg-gradient-hero-dark">
      <div className="container mx-auto px-6 pt-10 pb-14 md:pt-20 md:pb-24">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Copy */}
          <div className="relative z-10 space-y-6 md:space-y-8 animate-fade-up">
            <span className="inline-flex items-center gap-2 px-3 h-7 rounded-full text-[11px] font-medium tracking-wide uppercase bg-primary/10 text-primary border border-primary/20">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              Next-gen gadgets · Lagos
            </span>

            <h1 className="font-display font-bold text-5xl sm:text-6xl md:text-7xl leading-[0.95] tracking-tight text-balance">
              Get <span className="bg-gradient-crimson bg-clip-text text-transparent">Authentic</span><br />
              Gadgets.
            </h1>

            <p className="text-base md:text-lg text-muted-foreground max-w-md leading-relaxed">
              We sell, buy and swap phones, computers, accessories & consoles —
              all with warranty and free delivery in Lagos.
            </p>

            <div className="flex flex-wrap gap-3">
              <a href="https://wa.me/2347067894474" target="_blank" rel="noopener noreferrer">
                <Button className="h-12 px-6 rounded-full bg-whatsapp hover:bg-whatsapp/90 text-white shadow-glow-crimson font-medium">
                  <MessageCircle size={16} className="mr-1" />
                  WhatsApp to Order
                  <ArrowRight size={16} className="ml-1" />
                </Button>
              </a>
              <Link to="/shop">
                <Button variant="outline" className="h-12 px-6 rounded-full border-foreground/20 hover:bg-foreground hover:text-background font-medium">
                  Browse Products
                </Button>
              </Link>
            </div>

            <div className="glass inline-flex items-center gap-3 px-4 py-2.5 rounded-full text-xs font-medium">
              <span className="h-2 w-2 rounded-full bg-whatsapp" />
              Free delivery within Lagos
            </div>
          </div>

          {/* Visual */}
          <div className="relative">
            <div className="absolute -inset-10 bg-gradient-crimson opacity-20 blur-3xl rounded-full" />
            <div className="absolute right-4 top-4 hidden md:flex glass-strong rounded-2xl p-3 z-20 animate-float">
              <div className="text-right">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">From</div>
                <div className="font-display font-bold text-lg">₦49,000</div>
              </div>
            </div>
            <img
              src={heroDevices}
              alt="Premium phones, laptops, headphones and consoles available at Gadget360.ng"
              className="relative w-full h-auto max-h-[520px] object-contain drop-shadow-2xl"
              loading="eager"
            />
          </div>
        </div>
      </div>

      {/* Thin trust strip */}
      <div className="border-t border-border bg-background/60 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-5 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { Icon: Shield, title: "Authentic Products", sub: "100% genuine" },
            { Icon: Truck, title: "Nationwide Delivery", sub: "Fast & secure" },
            { Icon: Award, title: "Warranty Available", sub: "Buy with confidence" },
            { Icon: MessageCircle, title: "Fast WhatsApp Reply", sub: "Under 5 minutes" },
          ].map(({ Icon, title, sub }) => (
            <div key={title} className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full grid place-items-center bg-primary/10 text-primary shrink-0">
                <Icon size={16} strokeWidth={1.75} />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold leading-tight">{title}</div>
                <div className="text-[11px] text-muted-foreground truncate">{sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;
