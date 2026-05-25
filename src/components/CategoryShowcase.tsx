import { Link } from "react-router-dom";
import { ArrowUpRight, Smartphone, Laptop, Gamepad2, Headphones, Cable, Apple, Watch } from "lucide-react";

const categories = [
  { name: "Phones", icon: Smartphone, count: "120+", tone: "bg-cream text-foreground" },
  { name: "Laptops", icon: Laptop, count: "60+", tone: "bg-foreground text-background" },
  { name: "Apple", icon: Apple, count: "80+", tone: "bg-primary text-primary-foreground" },
  { name: "Consoles & Games", icon: Gamepad2, count: "45+", tone: "bg-card text-foreground border border-border" },
  { name: "Headphones", icon: Headphones, count: "35+", tone: "bg-card text-foreground border border-border" },
  { name: "Accessories", icon: Watch, count: "150+", tone: "bg-cream text-foreground" },
  { name: "Controllers & Cables", icon: Cable, count: "70+", tone: "bg-foreground text-background" },
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
        {categories.map((c, i) => {
          const Icon = c.icon;
          const span = i === 0 ? "md:row-span-2" : i === 2 ? "md:col-span-2" : "";
          return (
            <Link
              key={c.name}
              to={`/shop?category=${encodeURIComponent(c.name)}`}
              className={`group relative rounded-3xl p-4 md:p-6 overflow-hidden flex flex-col justify-between transition-all hover:scale-[1.02] hover:shadow-card ${c.tone} ${span}`}
            >
              <div className="flex items-start justify-between">
                <Icon size={22} strokeWidth={1.5} className="opacity-90" />
                <ArrowUpRight size={16} className="opacity-50 group-hover:opacity-100 transition-opacity" />
              </div>
              <div>
                <div className="font-display font-bold text-lg md:text-2xl leading-tight">{c.name}</div>
                <div className="text-[11px] opacity-70 mt-0.5">{c.count} items</div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  </section>
);

export default CategoryShowcase;
