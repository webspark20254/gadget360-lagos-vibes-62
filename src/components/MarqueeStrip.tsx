import { Sparkles } from "lucide-react";

const items = [
  "Authentic Products",
  "UK Used Available",
  "Warranty Included",
  "Free Lagos Delivery",
  "Nationwide Shipping",
  "Sell · Buy · Swap",
  "WhatsApp in 5 min",
  "Trade-in Welcome",
];

const MarqueeStrip = () => (
  <div className="bg-foreground text-background py-4 overflow-hidden border-y border-foreground">
    <div className="flex animate-marquee whitespace-nowrap">
      {[...items, ...items, ...items].map((it, i) => (
        <span key={i} className="flex items-center gap-4 px-6 font-display font-semibold text-lg md:text-2xl tracking-tight">
          {it}
          <Sparkles size={16} className="text-primary-glow" />
        </span>
      ))}
    </div>
  </div>
);

export default MarqueeStrip;
