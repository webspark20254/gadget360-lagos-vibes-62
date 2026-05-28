import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { CATEGORIES } from "@/lib/categories";

const tones = [
  "bg-cream text-foreground md:row-span-2",
  "bg-foreground text-background",
  "bg-primary text-primary-foreground md:col-span-2",
  "bg-card text-foreground border border-border",
  "bg-card text-foreground border border-border",
  "bg-cream text-foreground",
];

const CategoryShowcase = () => (
  <section className="py-14 md:py-24 bg-background">
    <div className="container mx-auto px-5 md:px-8">
      <div className="flex items-end justify-between gap-6 mb-8 md:mb-12">
        <div>
          <p className="text-[11px] uppercase tracking-[0.25em] text-primary mb-3">Categories</p>
          <h2 className="font-display font-bold text-3xl md:text-5xl tracking-tight leading-[1.05] max-w-xl">
            Built for every <span className="font-serif-display">obsession.</span>
          </h2>
        </div>
        <Link to="/shop" className="hidden md:inline-flex text-sm font-medium items-center gap-1 hover:text-primary transition-colors">
          See all <ArrowUpRight size={15} />
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 auto-rows-[120px] md:auto-rows-[180px]">
        {CATEGORIES.map((c, i) => {
          const Icon = c.icon;
          return (
            <Link
              key={c.slug}
              to={`/shop?category=${encodeURIComponent(c.slug)}`}
              className={`group relative rounded-3xl p-4 md:p-6 overflow-hidden flex flex-col justify-between transition-all hover:scale-[1.02] hover:shadow-card ${tones[i % tones.length]}`}
            >
              <div className="flex items-start justify-between">
                <Icon size={22} strokeWidth={1.5} className="opacity-90" />
                <ArrowUpRight size={16} className="opacity-50 group-hover:opacity-100 transition-opacity" />
              </div>
              <div>
                <div className="font-display font-bold text-lg md:text-2xl leading-tight">{c.name}</div>
                <div className="text-[11px] opacity-70 mt-0.5">Shop now</div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  </section>
);

export default CategoryShowcase;
