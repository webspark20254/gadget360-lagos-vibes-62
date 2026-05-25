import { ArrowUpRight, MessageCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import iphone17ProMax from "@/assets/iphone17-promax.jpg";

const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-warm grain">
      <div className="container mx-auto px-5 md:px-8 pt-6 md:pt-12 pb-12 md:pb-20">
        {/* Editorial header strip */}
        <div className="flex items-center justify-between text-[10px] md:text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-6 md:mb-10">
          <span>Vol. 26 · Lagos Edition</span>
          <span className="hidden sm:inline">Authentic Gadgets · Since 2018</span>
          <span>№ 001</span>
        </div>

        {/* Magazine title block */}
        <div className="grid md:grid-cols-12 gap-6 md:gap-8 items-end mb-8 md:mb-14">
          <div className="md:col-span-8">
            <h1 className="font-display font-bold text-[44px] sm:text-6xl md:text-[104px] leading-[0.92] tracking-[-0.04em] text-foreground">
              The new <span className="font-serif-display text-primary">era</span> of
              <br />
              gadgets is <span className="font-serif-display">here.</span>
            </h1>
          </div>
          <div className="md:col-span-4 space-y-4">
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-sm">
              Buy, sell and swap authentic phones, laptops, consoles & accessories — delivered free across Lagos, shipped nationwide.
            </p>
            <div className="flex flex-wrap gap-2">
              <a href="https://wa.me/2347067894474" target="_blank" rel="noopener noreferrer">
                <Button className="h-11 px-5 rounded-full bg-foreground text-background hover:bg-foreground/90 text-sm font-medium">
                  <MessageCircle size={15} className="mr-2" />
                  Order on WhatsApp
                </Button>
              </a>
              <Link to="/shop">
                <Button variant="outline" className="h-11 px-5 rounded-full border-foreground/30 hover:bg-foreground hover:text-background text-sm font-medium">
                  Browse Shop
                  <ArrowUpRight size={15} className="ml-1.5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Feature card — iPhone 17 Pro Max launch */}
        <div className="grid md:grid-cols-12 gap-4 md:gap-6">
          <article className="md:col-span-8 relative rounded-[28px] overflow-hidden bg-ink text-ink-foreground p-6 md:p-10 min-h-[360px] md:min-h-[480px] flex flex-col justify-between shadow-elegant">
            <div className="flex items-start justify-between gap-4 relative z-10">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 h-7 rounded-full bg-primary text-primary-foreground text-[10px] uppercase tracking-[0.2em] font-semibold">
                  <Sparkles size={11} /> Now Preordering
                </div>
                <h2 className="font-display font-bold text-3xl md:text-6xl mt-5 leading-[0.95] tracking-tight max-w-md">
                  iPhone 17 <span className="font-serif-display text-primary-glow">Pro Max</span>
                </h2>
                <p className="text-sm md:text-base text-ink-foreground/70 mt-3 max-w-xs">
                  HK Physical Sims + eSIM. Delivery on Sunday 21st or Monday 22nd.
                </p>
              </div>
            </div>

            <img
              src={iphone17ProMax}
              alt="iPhone 17 Pro Max preorder"
              className="absolute right-[-40px] md:right-0 bottom-0 h-[60%] md:h-[88%] w-auto object-contain object-bottom pointer-events-none select-none"
              loading="eager"
            />

            <div className="relative z-10 flex items-end justify-between gap-4">
              <div className="space-y-1">
                <div className="text-[10px] uppercase tracking-[0.2em] text-ink-foreground/50">Starting from</div>
                <div className="font-display font-bold text-2xl md:text-4xl">₦2,950,000</div>
              </div>
              <a href="https://wa.me/2348108418727?text=Hi%2C%20I%20want%20to%20preorder%20the%20iPhone%2017%20Pro%20Max" target="_blank" rel="noopener noreferrer">
                <Button className="h-11 px-5 rounded-full bg-primary hover:bg-primary-glow text-primary-foreground text-sm font-medium shadow-glow-crimson">
                  Pay Now <ArrowUpRight size={15} className="ml-1" />
                </Button>
              </a>
            </div>
          </article>

          {/* Stats / promise stack */}
          <aside className="md:col-span-4 grid grid-cols-2 md:grid-cols-1 gap-4 md:gap-6">
            <div className="rounded-[24px] bg-cream p-5 md:p-6 flex flex-col justify-between min-h-[140px] md:min-h-0 md:flex-1">
              <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Customers served</div>
              <div className="font-display font-bold text-3xl md:text-5xl leading-none mt-2">
                25K<span className="text-primary">+</span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">across Nigeria · 7 yrs running</div>
            </div>
            <div className="rounded-[24px] bg-primary text-primary-foreground p-5 md:p-6 flex flex-col justify-between min-h-[140px] md:min-h-0 md:flex-1 relative overflow-hidden">
              <div className="text-[10px] uppercase tracking-[0.2em] opacity-80">WhatsApp reply</div>
              <div className="font-display font-bold text-3xl md:text-5xl leading-none mt-2">&lt; 5 min</div>
              <div className="text-xs opacity-80 mt-1">real humans, no bots</div>
              <MessageCircle size={120} className="absolute -right-6 -bottom-6 opacity-10" strokeWidth={1} />
            </div>
            <div className="col-span-2 md:col-span-1 rounded-[24px] border border-border bg-card p-5 md:p-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-foreground text-background grid place-items-center font-display font-bold text-lg">G</div>
              <div className="text-sm">
                <div className="font-semibold">Free Lagos delivery</div>
                <div className="text-muted-foreground text-xs">Nationwide shipping available</div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
};

export default Hero;
