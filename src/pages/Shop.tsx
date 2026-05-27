import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Filter, Search, SlidersHorizontal, X } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LiveChat from "@/components/LiveChat";
import ProductCard from "@/components/ProductCard";
import Seo from "@/components/Seo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatNaira } from "@/lib/whatsapp";

const CATEGORIES = [
  "Phones", "Laptops", "Apple", "Consoles & Games",
  "Headphones", "Accessories", "Controllers & Cables",
];

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 5000000 });
  const [sortBy, setSortBy] = useState("featured");
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const categoryFromUrl = searchParams.get("category");

  useEffect(() => {
    if (categoryFromUrl && !selectedCategories.includes(categoryFromUrl)) {
      setSelectedCategories([categoryFromUrl]);
    }
  }, [categoryFromUrl]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .order("created_at", { ascending: false });
        if (error) throw error;
        setProducts(
          (data || []).map((p) => ({
            id: p.id,
            name: p.name,
            price: p.price,
            image: p.image_url,
            category: p.category,
            rating: 4.5,
            inStock: p.stock_quantity > 0,
            specs: p.description,
            isFeatured: p.is_featured || false,
            badgeText: p.badge_text || undefined,
            badgeColor: p.badge_color || undefined,
          }))
        );
      } catch (e) {
        console.error(e);
        toast({ title: "Error", description: "Failed to load products.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    const arr = products.filter((p) => {
      const match = !q || p.name.toLowerCase().includes(q) || p.specs?.toLowerCase().includes(q);
      const cat = selectedCategories.length === 0 || selectedCategories.includes(p.category);
      const price = p.price >= priceRange.min && p.price <= priceRange.max;
      return match && cat && price;
    });
    return arr.sort((a, b) => {
      switch (sortBy) {
        case "price-low": return a.price - b.price;
        case "price-high": return b.price - a.price;
        case "rating": return (b.rating || 0) - (a.rating || 0);
        default: return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
      }
    });
  }, [products, searchQuery, selectedCategories, priceRange, sortBy]);

  const toggleCategory = (c: string) =>
    setSelectedCategories((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));

  const clearFilters = () => {
    setSelectedCategories([]);
    setPriceRange({ min: 0, max: 5000000 });
    setSearchQuery("");
    setSearchParams({});
  };

  const FilterContent = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-display font-semibold text-sm mb-3 uppercase tracking-wider">Categories</h3>
        <div className="space-y-2.5">
          {CATEGORIES.map((c) => (
            <label key={c} className="flex items-center gap-2.5 cursor-pointer text-sm hover:text-primary transition-colors">
              <Checkbox checked={selectedCategories.includes(c)} onCheckedChange={() => toggleCategory(c)} />
              {c}
            </label>
          ))}
        </div>
      </div>
      <div>
        <h3 className="font-display font-semibold text-sm mb-3 uppercase tracking-wider">Price (₦)</h3>
        <div className="grid grid-cols-2 gap-2">
          <Input type="number" placeholder="Min" value={priceRange.min || ""} onChange={(e) => setPriceRange({ ...priceRange, min: Number(e.target.value) || 0 })} className="h-10 rounded-xl" />
          <Input type="number" placeholder="Max" value={priceRange.max || ""} onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) || 5000000 })} className="h-10 rounded-xl" />
        </div>
      </div>
      <Button onClick={clearFilters} variant="outline" className="w-full h-10 rounded-full">Clear all</Button>
    </div>
  );

  const productsLd = filtered.slice(0, 20).map((p) => ({
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    image: p.image,
    category: p.category,
    offers: {
      "@type": "Offer",
      price: p.price,
      priceCurrency: "NGN",
      availability: p.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: `https://gadget360.ng/product/${p.id}`,
    },
  }));

  return (
    <div className="min-h-screen bg-background">
      <Seo
        title={categoryFromUrl ? `${categoryFromUrl} in Lagos — Gadget360.ng` : "Shop Authentic Gadgets in Lagos — Gadget360.ng"}
        description={categoryFromUrl
          ? `Buy authentic ${categoryFromUrl} in Lagos with warranty. Free Lagos delivery, nationwide shipping. WhatsApp +234 810 841 8727.`
          : "Shop authentic phones, laptops, consoles, headphones and accessories. Original products, warranty, fast delivery across Nigeria."}
        canonical={`/shop${categoryFromUrl ? `?category=${encodeURIComponent(categoryFromUrl)}` : ""}`}
        jsonLd={productsLd.length ? productsLd : undefined}
      />
      <Header />

      {/* Editorial hero strip */}
      <section className="bg-gradient-warm border-b border-border/60">
        <div className="container mx-auto px-5 md:px-8 py-10 md:py-16">
          <div className="flex items-center justify-between text-[10px] md:text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-4">
            <span>The Shop</span>
            <span>{loading ? "—" : `${filtered.length} items`}</span>
          </div>
          <h1 className="font-display font-bold text-[40px] sm:text-6xl md:text-7xl leading-[0.95] tracking-tight">
            {categoryFromUrl ? (
              <>Shop <span className="font-serif-display text-primary">{categoryFromUrl}</span></>
            ) : (
              <>Browse the <span className="font-serif-display text-primary">catalogue</span>.</>
            )}
          </h1>
          <p className="text-sm md:text-base text-muted-foreground mt-3 max-w-xl">
            Authentic gadgets. Real warranty. Free Lagos delivery and nationwide shipping.
          </p>

          {/* Quick category chips */}
          <div className="flex overflow-x-auto gap-2 mt-6 pb-1 scrollbar-hide">
            <button
              onClick={() => setSelectedCategories([])}
              className={`shrink-0 px-4 h-9 rounded-full text-xs font-medium border transition-all ${
                selectedCategories.length === 0
                  ? "bg-foreground text-background border-foreground"
                  : "bg-background border-border hover:border-foreground/40"
              }`}
            >
              All
            </button>
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setSelectedCategories([c])}
                className={`shrink-0 px-4 h-9 rounded-full text-xs font-medium border transition-all ${
                  selectedCategories.includes(c)
                    ? "bg-foreground text-background border-foreground"
                    : "bg-background border-border hover:border-foreground/40"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </section>

      <main className="container mx-auto px-5 md:px-8 py-8 md:py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24 rounded-2xl border border-border bg-card p-6">
              <div className="flex items-center gap-2 mb-5">
                <SlidersHorizontal size={16} />
                <h2 className="font-display font-semibold text-sm uppercase tracking-wider">Filters</h2>
              </div>
              <FilterContent />
            </div>
          </aside>

          {/* Main */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-2.5 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={15} />
                <Input
                  placeholder="Search products…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11 rounded-full bg-muted/60 border-transparent focus:bg-background focus:border-border text-sm"
                />
              </div>
              <div className="flex gap-2">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="lg:hidden h-11 rounded-full px-4 border-foreground/20">
                      <Filter size={14} className="mr-2" /> Filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80 bg-background">
                    <div className="mt-8">
                      <h2 className="font-display font-bold text-xl mb-5">Filters</h2>
                      <FilterContent />
                    </div>
                  </SheetContent>
                </Sheet>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="h-11 rounded-full px-4 w-[160px] border-foreground/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Active filter chips */}
            {selectedCategories.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-5">
                {selectedCategories.map((c) => (
                  <button
                    key={c}
                    onClick={() => toggleCategory(c)}
                    className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full bg-foreground text-background text-xs font-medium"
                  >
                    {c} <X size={12} />
                  </button>
                ))}
              </div>
            )}

            {/* Grid */}
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-5">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="rounded-2xl border border-border p-3 animate-pulse">
                    <div className="bg-muted rounded-xl aspect-square mb-3" />
                    <div className="bg-muted rounded h-3 mb-2" />
                    <div className="bg-muted rounded h-3 w-2/3" />
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20 rounded-2xl border border-dashed border-border">
                <p className="font-display text-xl mb-2">Nothing matches your filters</p>
                <p className="text-muted-foreground text-sm mb-5">Try clearing them or browsing all products.</p>
                <Button onClick={clearFilters} className="rounded-full h-10 px-5">Clear filters</Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-5">
                {filtered.map((p) => <ProductCard key={p.id} {...p} />)}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
      <LiveChat />
    </div>
  );
};

export default Shop;
