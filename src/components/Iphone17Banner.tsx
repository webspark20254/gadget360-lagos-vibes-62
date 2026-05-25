import iphone17Pro from "@/assets/iphone17-pro.jpg";
import { Button } from "@/components/ui/button";
import { MessageCircle, ArrowUpRight } from "lucide-react";

const prices = [
  { variant: "1TB", price: "₦3,220,000" },
  { variant: "512GB", price: "₦2,820,000" },
  { variant: "256GB", price: "₦2,420,000" },
];

const Iphone17Banner = () => (
  <section className="bg-cream py-14 md:py-24 relative overflow-hidden">
    <div className="container mx-auto px-5 md:px-8">
      <div className="grid md:grid-cols-12 gap-6 md:gap-10 items-center">
        <div className="md:col-span-5 order-2 md:order-1">
          <img
            src={iphone17Pro}
            alt="iPhone 17 Pro — preorder at Gadget360.ng"
            className="w-full rounded-[28px] shadow-card"
            loading="lazy"
          />
        </div>

        <div className="md:col-span-7 order-1 md:order-2 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 h-7 rounded-full bg-foreground text-background text-[10px] uppercase tracking-[0.2em] font-semibold">
            Preorder Live
          </div>
          <h2 className="font-display font-bold text-4xl md:text-7xl leading-[0.95] tracking-tight">
            iPhone 17 <span className="font-serif-display text-primary">Pro.</span>
            <br />
            Three sizes,<br className="md:hidden" /> one obsession.
          </h2>
          <p className="text-sm md:text-base text-muted-foreground max-w-md">
            HK Physical Sims + eSIM (store active). Pay now — get on Sunday 21st or Monday 22nd.
          </p>

          <div className="grid grid-cols-3 gap-2 md:gap-3 max-w-lg">
            {prices.map((p) => (
              <div key={p.variant} className="rounded-2xl bg-card border border-border p-3 md:p-4">
                <div className="text-[10px] uppercase tracking-wider text-primary font-semibold">{p.variant}</div>
                <div className="font-display font-bold text-base md:text-2xl mt-1 tracking-tight">{p.price}</div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <a href="https://wa.me/2348108418727?text=I%20want%20to%20preorder%20the%20iPhone%2017%20Pro" target="_blank" rel="noopener noreferrer">
              <Button className="h-11 px-5 rounded-full bg-primary hover:bg-primary-glow text-primary-foreground text-sm font-medium shadow-glow-crimson">
                <MessageCircle size={15} className="mr-2" /> Preorder Now
              </Button>
            </a>
            <a href="https://instagram.com/gadget360ng" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="h-11 px-5 rounded-full border-foreground/30 text-sm font-medium">
                @gadget360ng <ArrowUpRight size={15} className="ml-1" />
              </Button>
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default Iphone17Banner;
