import { Link, useSearchParams } from "react-router-dom";

const categories = [
  "All",
  "Phones",
  "Laptops",
  "Apple",
  "Consoles & Games",
  "Headphones",
  "Accessories",
  "Controllers & Cables",
];

const CategoryChips = () => {
  const [params] = useSearchParams();
  const active = params.get("category") || "All";

  return (
    <div className="md:hidden border-b border-border bg-background">
      <div className="flex overflow-x-auto gap-2 px-4 py-3 scrollbar-hide">
        {categories.map((c) => {
          const isActive = active === c || (c === "All" && !params.get("category"));
          const to = c === "All" ? "/shop" : `/shop?category=${encodeURIComponent(c)}`;
          return (
            <Link
              key={c}
              to={to}
              className={`shrink-0 px-4 h-9 inline-flex items-center rounded-full text-xs font-medium border transition-all ${
                isActive
                  ? "bg-primary text-primary-foreground border-primary shadow-glow-crimson"
                  : "bg-background text-foreground border-border hover:border-foreground/40"
              }`}
            >
              {c}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryChips;
