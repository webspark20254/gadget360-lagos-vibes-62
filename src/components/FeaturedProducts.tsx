import { useState, useEffect } from "react";
import ProductCard from "./ProductCard";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from '@/integrations/supabase/client';

const FeaturedProducts = () => {
  const [currentCategory, setCurrentCategory] = useState("Featured");
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase.from('products').select('*').limit(8);
        if (error) throw error;
        if (data) {
          setProducts(data.map(p => ({
            id: p.id,
            name: p.name,
            price: p.price,
            image: p.image_url,
            category: p.category || 'Uncategorized',
            rating: 4.8,
            inStock: p.stock_quantity > 0,
            specs: p.description?.substring(0, 50) + '...' || '',
            isFeatured: p.is_featured || false,
            badgeText: p.badge_text || undefined,
            badgeColor: p.badge_color || undefined,
          })));
        }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchProducts();
  }, []);

  const categories = ["Featured", ...Array.from(new Set(products.map(p => p.category)))];
  const filtered = currentCategory === "Featured" ? products : products.filter(p => p.category === currentCategory);

  return (
    <section className="py-14 md:py-24 bg-background">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
          <div className="max-w-xl">
            <p className="text-xs uppercase tracking-[0.2em] text-primary mb-3">Our products</p>
            <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight leading-tight">
              Explore featured<br className="hidden md:block" /> gadgets.
            </h2>
          </div>
          <Link to="/shop" className="hidden md:inline-flex">
            <Button variant="outline" className="rounded-full h-10 border-foreground/20 hover:bg-foreground hover:text-background">
              View all <ArrowRight size={14} className="ml-1" />
            </Button>
          </Link>
        </div>

        <div className="flex overflow-x-auto gap-2 mb-8 pb-2 scrollbar-hide">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setCurrentCategory(category)}
              className={`shrink-0 px-4 h-9 rounded-full text-xs font-medium border transition-all ${
                currentCategory === category
                  ? "bg-foreground text-background border-foreground"
                  : "bg-background text-foreground border-border hover:border-foreground/40"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="rounded-2xl border border-border p-3 animate-pulse">
                <div className="bg-muted rounded-xl aspect-square mb-3" />
                <div className="bg-muted rounded h-3 mb-2" />
                <div className="bg-muted rounded h-3 w-2/3" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
            {filtered.slice(0, 8).map((p) => <ProductCard key={p.id} {...p} />)}
          </div>
        )}

        <div className="text-center mt-10 md:hidden">
          <Link to="/shop">
            <Button variant="outline" className="rounded-full h-11 px-8">
              View All Products <ArrowRight size={14} className="ml-1" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
