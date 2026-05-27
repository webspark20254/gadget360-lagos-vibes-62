import { ArrowUpRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import iphone17ProMax from "@/assets/iphone17-promax.jpg";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import { waGeneralUrl, waOrderUrl } from "@/lib/whatsapp";

const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-warm grain">
      <div className="container mx-auto px-5 md:px-8 pt-6 md:pt-12 pb-10 md:pb-20">
        {/* Editorial header strip */}
        <div className="flex items-center justify-between text-[10px] md:text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-6 md:mb-10">
          <span>Vol. 26 · Lagos</span>
          <span className="hidden sm:inline">Authentic Gadgets · Since 2018</span>
          <span>№ 001</span>
        </div>

        {/* Magazine title block */}
        <div className="grid md:grid-cols-12 gap-6 md:gap-8 items-end mb-8 md:mb-14">
          <div className="md:col-span-8">
            <h1 className="font-display font-bold text-[40px] sm:text-6xl md:text-[104px] leading-[0.95] tracking-[-0.04em] text-foreground">
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
              <a href={waGeneralUrl()} target="_blank" rel="noopener noreferrer">
                <Button className="h-11 px-5 rounded-full bg-whatsapp hover:bg-whatsapp/90 text-white text-sm font-medium gap-2">
                  <WhatsAppIcon size={15} /> Order on WhatsApp
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
          <article className="md:col-span-8 relative rounded-[28px] overflow-hidden bg-ink text-ink-foreground shadow-elegant">
            {/* Mobile: stacked layout. Desktop: overlay layout */}
            <div className="md:hidden flex flex-col">
              <div className="p-6 pb-3">
                <div className="inline-flex items-center gap-1.5 px-3 h-7 rounded-full bg-primary text-primary-foreground text-[10px] uppercase tracking-[0.2em] font-semibold">
                  <Sparkles size={11} /> Now Preordering
                </div>
                <h2 className="font-display font-bold text-[34px] mt-4 leading-[0.95] tracking-tight">
                  iPhone 17 <span className="font-serif-display text-primary-glow">Pro Max</span>
                </h2>
                <p className="text-sm text-ink-foreground/70 mt-2">
                  HK Physical Sims + eSIM. Delivery 21st–22nd.
                </p>
              </div>
              <div className="relative h-56 w-full bg-gradient-to-b from-transparent to-black/40">
                <img
                  src={iphone17ProMax}
                  alt="iPhone 17 Pro Max"
                  className="absolute inset-0 w-full h-full object-contain object-center"
                  loading="eager"
                />
              </div>
              <div className="p-5 pt-3 flex items-end justify-between gap-3 border-t border-white/10">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.2em] text-ink-foreground/50">Starting from</div>
                  <div className="font-display font-bold text-2xl mt-1">₦2,950,000</div>
                </div>
                <a href={waOrderUrl("iPhone 17 Pro Max", 2950000)} target="_blank" rel="noopener noreferrer">
                  <Button className="h-10 px-4 rounded-full bg-whatsapp hover:bg-whatsapp/90 text-white text-xs font-semibold gap-1.5">
                    <WhatsAppIcon size={13} /> Preorder
                  </Button>
                </a>
              </div>
            </div>

            {/* Desktop layout */}
            <div className="hidden md:flex flex-col justify-between p-10 min-h-[480px]">
              <div className="relative z-10 max-w-md">
                <div className="inline-flex items-center gap-1.5 px-3 h-7 rounded-full bg-primary text-primary-foreground text-[10px] uppercase tracking-[0.2em] font-semibold">
                  <Sparkles size={11} /> Now Preordering
                </div>
                <h2 className="font-display font-bold text-6xl mt-5 leading-[0.95] tracking-tight">
                  iPhone 17 <span className="font-serif-display text-primary-glow">Pro Max</span>
                </h2>
                <p className="text-base text-ink-foreground/70 mt-3 max-w-xs">
                  HK Physical Sims + eSIM. Delivery on Sunday 21st or Monday 22nd.
                </p>
              </div>

              <img
                src={iphone17ProMax}
                alt="iPhone 17 Pro Max preorder"
                className="absolute right-0 bottom-0 h-[88%] w-auto object-contain object-bottom pointer-events-none select-none"
                loading="eager"
              />

              <div className="relative z-10 flex items-end justify-between gap-4">
                <div className="space-y-1">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-ink-foreground/50">Starting from</div>
                  <div className="font-display font-bold text-4xl">₦2,950,000</div>
                </div>
                <a href={waOrderUrl("iPhone 17 Pro Max", 2950000)} target="_blank" rel="noopener noreferrer">
                  <Button className="h-11 px-5 rounded-full bg-whatsapp hover:bg-whatsapp/90 text-white text-sm font-medium gap-2 shadow-soft">
                    <WhatsAppIcon size={15} /> Order on WhatsApp
                  </Button>
                </a>
              </div>
            </div>
          </article>

          {/* Stats / promise stack */}
          <aside className="md:col-span-4 grid grid-cols-2 md:grid-cols-1 gap-3 md:gap-6">
            <div className="rounded-[24px] bg-cream p-5 md:p-6 flex flex-col justify-between min-h-[140px] md:min-h-0 md:flex-1">
              <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Customers served</div>
              <div className="font-display font-bold text-3xl md:text-5xl leading-none mt-2">
                25K<span className="text-primary">+</span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">across Nigeria · 7 yrs running</div>
            </div>
            <div className="rounded-[24px] bg-whatsapp text-white p-5 md:p-6 flex flex-col justify-between min-h-[140px] md:min-h-0 md:flex-1 relative overflow-hidden">
              <div className="text-[10px] uppercase tracking-[0.2em] opacity-80">WhatsApp reply</div>
              <div className="font-display font-bold text-3xl md:text-5xl leading-none mt-2">&lt; 5 min</div>
              <div className="text-xs opacity-80 mt-1">real humans, no bots</div>
              <WhatsAppIcon size={120} className="absolute -right-6 -bottom-6 opacity-15" />
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
