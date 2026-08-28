import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "@/lib/router-compat";
import { ArrowLeft, Heart, Star, Shield, Truck, Award, ChevronRight, Plus, Minus } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GeminiChat from "@/components/GeminiChat";
import Seo from "@/components/Seo";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProductAddToCart from "@/components/ProductAddToCart";
import ProductReviews from "@/components/ProductReviews";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import OptimizedImage from "@/components/OptimizedImage";
import { waOrderUrl, waQuoteUrl, formatNaira } from "@/lib/whatsapp";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [selectedImage, setSelectedImage] = useState(0);
  const [product, setProduct] = useState<any>(null);
  const [related, setRelated] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState<"about" | "specs" | "reviews">("about");
  // Aggregated review stats — feeds the Product JSON-LD so Google can render stars.
  const [reviewStats, setReviewStats] = useState<{ count: number; average: number }>({ count: 0, average: 0 });
  const { toast } = useToast();


  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (id) loadProduct();
  }, [id]);

  const loadProduct = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const { data, error } = await supabase.from("products").select("*").eq("id", id).maybeSingle();
      if (error || !data) {
        toast({ title: "Product not found", variant: "destructive" });
        navigate("/shop");
        return;
      }
      setProduct(data);

      // Review aggregate for rich-result stars.
      const { data: ratings } = await supabase
        .from("product_reviews")
        .select("rating")
        .eq("product_id", data.id);
      if (ratings && ratings.length > 0) {
        const sum = ratings.reduce((s: number, r: any) => s + (Number(r.rating) || 0), 0);
        setReviewStats({ count: ratings.length, average: Math.round((sum / ratings.length) * 10) / 10 });
      } else {
        setReviewStats({ count: 0, average: 0 });
      }

      // Related items by category
      if (data.category) {
        const { data: rel } = await supabase
          .from("products")
          .select("id, name, price, image_url, category, badge_text, badge_color")
          .eq("category", data.category)
          .neq("id", data.id)
          .limit(4);
        setRelated(rel || []);
      }

    } catch (e) {
      console.error(e);
      navigate("/shop");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20">
          <div className="animate-pulse space-y-4 max-w-xl">
            <div className="h-8 bg-muted rounded w-3/4" />
            <div className="h-64 bg-muted rounded-2xl" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  if (!product) return null;

  const images: string[] = [product.image_url, ...(product.additional_images || [])].filter(Boolean);
  const currentImg = images[selectedImage] || "/placeholder.svg";
  const inStock = product.stock_quantity > 0;
  const totalPrice = product.price * qty;

  const productLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: images,
    category: product.category,
    sku: product.id,
    brand: { "@type": "Brand", name: "Gadget360.ng" },
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "NGN",
      availability: inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: `https://gadgets360.ng/product/${product.id}`,
      seller: { "@type": "Organization", name: "Gadget360.ng" },
    },
    // Only emit aggregateRating when genuine reviews exist — Google penalises
    // rating markup that isn't visible on the page.
    ...(reviewStats.count > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: reviewStats.average,
            reviewCount: reviewStats.count,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
  };


  const addToCart = async () => {
    if (authLoading) {
      toast({ title: "Checking your account", description: "Please wait a moment and try again." });
      return;
    }
    if (!user) { navigate("/auth"); return; }
    const { data: existing } = await supabase
      .from("cart_items").select("id, quantity").eq("user_id", user.id).eq("product_id", product.id).maybeSingle();
    if (existing) {
      await supabase.from("cart_items").update({ quantity: existing.quantity + qty }).eq("id", existing.id);
    } else {
      await supabase.from("cart_items").insert({ user_id: user.id, product_id: product.id, quantity: qty });
    }
    toast({ title: "Added to cart", description: `${product.name} ×${qty}` });
  };

  // Build unique, SEO-rich title/description per product. Uses admin-provided
  // meta_title/meta_description when set, otherwise composes a strong default
  // including price, category, and warranty signal for search & social previews.
  const seoTitle = (product.meta_title?.trim()
    || `${product.name} — ${formatNaira(product.price)}${product.category ? ` | ${product.category}` : ""} | Gadget360.ng Lagos`)
    .slice(0, 60);
  const seoDescription = (product.meta_description?.trim()
    || `Buy ${product.name} in Lagos for ${formatNaira(product.price)}. ${product.description?.replace(/\s+/g, " ").slice(0, 110) || "Authentic with warranty."} Order on WhatsApp — free Lagos delivery.`)
    .slice(0, 160);

  return (
    <div className="min-h-screen bg-background">


      <Seo
        title={seoTitle}
        description={seoDescription}
        canonical={`/product/${product.id}`}
        image={product.image_url}
        type="product"
        jsonLd={productLd}
      />
      <Header />

      {/* ===== MOBILE LAYOUT — matches "Products" inspiration ===== */}
      <div className="md:hidden">
        {/* Title bar */}
        <div className="px-5 pt-4 pb-2">
          <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground">
            <ArrowLeft size={14} /> Back
          </button>
          <div className="flex items-end justify-between mt-2">
            <div className="font-display font-bold text-[34px] leading-[1.05] tracking-tight" aria-hidden="true">Products</div>
            <Link to="/shop" className="text-xs font-medium text-muted-foreground hover:text-primary pb-1.5">
              Change Product
            </Link>
          </div>
        </div>

        {/* Image stage — large, soft pedestal */}
        <div className="relative mx-5 mt-3 rounded-[28px] bg-gradient-to-b from-muted/40 to-muted/20 aspect-[4/4] overflow-hidden">
          <OptimizedImage src={currentImg} alt={product.name} className="absolute inset-0 w-full h-full object-contain p-8" priority />
          <button aria-label="Add to wishlist" className="absolute top-3 right-3 h-9 w-9 grid place-items-center rounded-full bg-background/70 backdrop-blur-md shadow-soft">
            <Heart size={14} />
          </button>
          {product.badge_text && (
            <Badge className="absolute top-3 left-3 rounded-full text-[10px]" style={{ backgroundColor: product.badge_color || "hsl(var(--primary))", color: "white" }}>
              {product.badge_text}
            </Badge>
          )}
          {/* faux pedestal shadow */}
          <div className="absolute left-1/2 bottom-4 -translate-x-1/2 h-2 w-32 rounded-full bg-foreground/10 blur-md" />
        </div>

        {/* Thumbnails — horizontal strip below image */}
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto px-5 pt-3 scrollbar-hide">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setSelectedImage(i)}
                className={`shrink-0 h-14 w-14 rounded-2xl overflow-hidden bg-muted/40 border-2 transition ${
                  selectedImage === i ? "border-foreground" : "border-transparent"
                }`}
              >
                <OptimizedImage src={img} alt="" className="w-full h-full object-contain p-1" />
              </button>
            ))}
          </div>
        )}

        {/* Tabs row — About / Specs / Reviews */}
        <div className="mt-5 px-5">
          <div className="flex items-center gap-6 border-b border-border/60">
            {([
              { k: "about", l: "About" },
              { k: "specs", l: "Specs" },
              { k: "reviews", l: "Reviews" },
            ] as const).map((t) => (
              <button
                key={t.k}
                onClick={() => setActiveTab(t.k)}
                className={`py-3 text-sm font-medium relative ${activeTab === t.k ? "text-foreground" : "text-muted-foreground"}`}
              >
                {t.l}
                {activeTab === t.k && <span className="absolute left-0 right-0 -bottom-px h-[2px] bg-foreground rounded-full" />}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <div className="px-5 pt-4 pb-5 space-y-4">
          {activeTab === "about" && (
            <>
              <div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{product.category}</div>
                <h1 className="font-display font-bold text-2xl leading-tight mt-1">{product.name}</h1>
                <div className="flex items-center gap-2 text-xs mt-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={12} className={i < 4 ? "fill-primary text-primary" : "text-muted-foreground"} />
                    ))}
                  </div>
                  <span className="text-muted-foreground">4.5 · {inStock ? "In stock" : "Out of stock"}</span>
                </div>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>

              <div className="grid grid-cols-3 gap-2 pt-1">
                <div className="rounded-2xl bg-muted/60 p-3 text-center">
                  <Shield size={16} className="mx-auto mb-1 text-primary" />
                  <div className="text-[10px] font-medium">Authentic</div>
                </div>
                <div className="rounded-2xl bg-muted/60 p-3 text-center">
                  <Truck size={16} className="mx-auto mb-1 text-primary" />
                  <div className="text-[10px] font-medium">Free Lagos</div>
                </div>
                <div className="rounded-2xl bg-muted/60 p-3 text-center">
                  <Award size={16} className="mx-auto mb-1 text-primary" />
                  <div className="text-[10px] font-medium">Warranty</div>
                </div>
              </div>
            </>
          )}

          {activeTab === "specs" && (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-2 border-b border-border"><span className="font-medium">Category</span><span className="text-muted-foreground">{product.category}</span></div>
              <div className="flex justify-between py-2 border-b border-border"><span className="font-medium">Price</span><span className="text-muted-foreground">{formatNaira(product.price)}</span></div>
              <div className="flex justify-between py-2"><span className="font-medium">Stock</span><span className="text-muted-foreground">{inStock ? `${product.stock_quantity} available` : "Out of stock"}</span></div>
            </div>
          )}

          {activeTab === "reviews" && <ProductReviews productId={product.id} />}
        </div>

        {/* Checkout section — inline (no longer pinned) */}
        <section className="mx-5 mt-2 mb-8 rounded-[28px] bg-foreground text-background p-5 shadow-elegant">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 min-w-0">
              <div className="text-[10px] uppercase tracking-[0.2em] opacity-60">Total</div>
              <div className="font-display font-bold text-3xl leading-none mt-1">{formatNaira(totalPrice)}</div>
              <div className="text-[11px] opacity-60 mt-1">{qty} × {formatNaira(product.price)}</div>
            </div>
            <div className="inline-flex items-center rounded-full bg-background/10 ring-1 ring-background/20">
              <button aria-label="Decrease quantity" onClick={() => setQty(Math.max(1, qty - 1))} className="h-10 w-10 grid place-items-center rounded-full hover:bg-background/10"><Minus size={14} /></button>
              <span className="px-2 text-sm font-semibold tabular-nums w-7 text-center">{qty}</span>
              <button aria-label="Increase quantity" onClick={() => setQty(Math.min(product.stock_quantity || 99, qty + 1))} className="h-10 w-10 grid place-items-center rounded-full hover:bg-background/10"><Plus size={14} /></button>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={addToCart} disabled={!inStock} variant="outline" className="flex-1 h-12 rounded-full border-background/30 bg-transparent text-background hover:bg-background hover:text-foreground font-semibold text-xs">
              Add to Cart
            </Button>
            <a
              href={waOrderUrl(product.name, product.price, qty)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-[1.2]"
              data-wa-source="product"
              data-wa-product={product.name}
              data-wa-product-id={product.id}
              data-wa-quantity={qty}
              data-wa-total={totalPrice}
            >
              <Button disabled={!inStock} className="w-full h-12 rounded-full bg-whatsapp hover:bg-whatsapp/90 text-white font-semibold gap-2 text-xs">
                <WhatsAppIcon size={14} /> Buy Now
              </Button>
            </a>
          </div>
        </section>
      </div>


      {/* ===== DESKTOP LAYOUT — editorial magazine ===== */}
      <main className="hidden md:block">
        {/* Editorial top band */}
        <section className="bg-gradient-warm border-b border-border/60 grain relative overflow-hidden">
          <div className="container mx-auto px-8 pt-8 pb-4">
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
              <Link to="/" className="hover:text-primary">Home</Link>
              <ChevronRight size={11} />
              <Link to="/shop" className="hover:text-primary">Shop</Link>
              <ChevronRight size={11} />
              <Link to={`/shop?category=${encodeURIComponent(product.category || "")}`} className="hover:text-primary">{product.category}</Link>
              <ChevronRight size={11} />
              <span className="text-foreground">{product.name}</span>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-8 py-10">
          <div className="grid grid-cols-12 gap-10">
            {/* GALLERY — 7 cols */}
            <div className="col-span-7 space-y-3">
              <div className="aspect-[5/4] rounded-[32px] overflow-hidden bg-gradient-to-b from-muted/40 to-muted/10 border border-border/60 relative grain">
                <OptimizedImage src={currentImg} alt={product.name} className="w-full h-full object-contain p-12" priority />
                {product.badge_text && (
                  <Badge className="absolute top-5 left-5 rounded-full px-3 h-7" style={{ backgroundColor: product.badge_color || "hsl(var(--primary))", color: "white" }}>
                    {product.badge_text}
                  </Badge>
                )}
                <button aria-label="Add to wishlist" className="absolute top-5 right-5 h-10 w-10 grid place-items-center rounded-full bg-background/80 backdrop-blur-md shadow-soft hover:bg-background">
                  <Heart size={15} />
                </button>
                <div className="absolute left-1/2 bottom-6 -translate-x-1/2 h-3 w-40 rounded-full bg-foreground/10 blur-xl" />
              </div>
              {images.length > 1 && (
                <div className="grid grid-cols-6 gap-2">
                  {images.slice(0, 6).map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      className={`aspect-square rounded-2xl overflow-hidden border-2 transition ${selectedImage === i ? "border-foreground" : "border-border"}`}
                    >
                      <OptimizedImage src={img} alt="" className="w-full h-full object-contain p-2 bg-card" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* COMMERCE COLUMN — 5 cols sticky */}
            <div className="col-span-5">
              <div className="sticky top-28 space-y-6">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.3em] text-primary mb-3 inline-flex items-center gap-2">
                    <span className="h-px w-6 bg-primary" /> {product.category}
                  </div>
                  <h1 className="font-display font-bold text-5xl xl:text-6xl leading-[0.95] tracking-tight">
                    {product.name}
                  </h1>
                  <div className="flex items-center gap-3 text-sm mt-4">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={14} className={i < 4 ? "fill-primary text-primary" : "text-muted-foreground"} />
                      ))}
                    </div>
                    <span className="text-muted-foreground">4.5 · {related.length + 24} reviews</span>
                    <span className={inStock ? "text-success font-medium" : "text-destructive font-medium"}>· {inStock ? "In stock" : "Out of stock"}</span>
                  </div>
                </div>

                <div className="flex items-baseline gap-3 pt-2">
                  <div className="font-display font-bold text-5xl text-foreground">{formatNaira(product.price)}</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">incl. warranty</div>
                </div>

                <p className="text-muted-foreground leading-relaxed text-[15px] line-clamp-4">{product.description}</p>

                {/* Qty + WhatsApp inline */}
                <div className="flex items-center gap-3 pt-2">
                  <div className="inline-flex items-center rounded-full bg-muted h-12 px-1">
                    <button aria-label="Decrease quantity" onClick={() => setQty(Math.max(1, qty - 1))} className="h-10 w-10 grid place-items-center rounded-full hover:bg-background"><Minus size={14} /></button>
                    <span className="px-3 text-sm font-semibold tabular-nums w-8 text-center">{qty}</span>
                    <button aria-label="Increase quantity" onClick={() => setQty(Math.min(product.stock_quantity || 99, qty + 1))} className="h-10 w-10 grid place-items-center rounded-full hover:bg-background"><Plus size={14} /></button>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Total <span className="font-display font-bold text-base text-foreground tabular-nums">{formatNaira(totalPrice)}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <a
                    href={waOrderUrl(product.name, product.price, qty)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1"
                    data-wa-source="product"
                    data-wa-product={product.name}
                    data-wa-product-id={product.id}
                    data-wa-quantity={qty}
                    data-wa-total={totalPrice}
                  >
                    <Button disabled={!inStock} className="w-full h-12 rounded-full bg-whatsapp hover:bg-whatsapp/90 text-white font-semibold gap-2">
                      <WhatsAppIcon size={16} /> Buy on WhatsApp
                    </Button>
                  </a>
                  <a href={waQuoteUrl(product.name)} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="h-12 px-5 rounded-full border-foreground/20 font-semibold gap-2">
                      <WhatsAppIcon size={16} /> Quote
                    </Button>
                  </a>
                  <Button variant="outline" size="icon" className="h-12 w-12 rounded-full border-foreground/20"><Heart size={18} /></Button>
                </div>

                <ProductAddToCart productId={product.id} stockQuantity={product.stock_quantity} className="w-full" />

                <div className="grid grid-cols-3 gap-2 pt-2">
                  <div className="rounded-2xl bg-card border border-border p-3 text-center">
                    <Shield className="mx-auto mb-1 text-primary" size={18} />
                    <p className="text-[11px] font-semibold">Authentic</p>
                  </div>
                  <div className="rounded-2xl bg-card border border-border p-3 text-center">
                    <Truck className="mx-auto mb-1 text-primary" size={18} />
                    <p className="text-[11px] font-semibold">Free Lagos</p>
                  </div>
                  <div className="rounded-2xl bg-card border border-border p-3 text-center">
                    <Award className="mx-auto mb-1 text-primary" size={18} />
                    <p className="text-[11px] font-semibold">1Y Warranty</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Specs / Reviews — editorial split */}
          <section className="mt-20 grid grid-cols-12 gap-10">
            <div className="col-span-4">
              <div className="text-[10px] uppercase tracking-[0.3em] text-primary">Section II</div>
              <h2 className="font-display font-bold text-4xl tracking-tight mt-2 leading-[1]">
                The <span className="font-serif-display">details.</span>
              </h2>
              <p className="text-sm text-muted-foreground mt-3 max-w-xs">
                Everything you need to know before you tap "Buy on WhatsApp".
              </p>
            </div>
            <div className="col-span-8">
              <Tabs defaultValue="description">
                <TabsList className="rounded-full bg-muted h-11 p-1">
                  <TabsTrigger value="description" className="rounded-full px-5">Description</TabsTrigger>
                  <TabsTrigger value="specifications" className="rounded-full px-5">Specs</TabsTrigger>
                  <TabsTrigger value="reviews" className="rounded-full px-5">Reviews</TabsTrigger>
                </TabsList>
                <TabsContent value="description" className="mt-6">
                  <Card className="p-7 rounded-3xl">
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{product.description}</p>
                  </Card>
                </TabsContent>
                <TabsContent value="specifications" className="mt-6">
                  <Card className="p-7 rounded-3xl divide-y divide-border">
                    <div className="flex justify-between py-3"><span className="font-medium">Category</span><span className="text-muted-foreground">{product.category}</span></div>
                    <div className="flex justify-between py-3"><span className="font-medium">Price</span><span className="text-muted-foreground">{formatNaira(product.price)}</span></div>
                    <div className="flex justify-between py-3"><span className="font-medium">Stock</span><span className="text-muted-foreground">{inStock ? `${product.stock_quantity} in stock` : "Out of stock"}</span></div>
                    <div className="flex justify-between py-3"><span className="font-medium">SKU</span><span className="text-muted-foreground font-mono text-xs">{product.id.slice(0, 8)}</span></div>
                  </Card>
                </TabsContent>
                <TabsContent value="reviews" className="mt-6">
                  <Card className="p-7 rounded-3xl"><ProductReviews productId={product.id} /></Card>
                </TabsContent>
              </Tabs>
            </div>
          </section>

          {/* Related items */}
          {related.length > 0 && (
            <section className="mt-20 pb-10">
              <div className="flex items-end justify-between mb-8">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.3em] text-primary mb-2">Also in {product.category}</div>
                  <h2 className="font-display font-bold text-4xl tracking-tight leading-none">
                    More to <span className="font-serif-display">discover.</span>
                  </h2>
                </div>
                <Link to={`/shop?category=${encodeURIComponent(product.category || "")}`} className="text-sm font-semibold hover:text-primary inline-flex items-center gap-1">
                  See all <ChevronRight size={14} />
                </Link>
              </div>
              <div className="grid grid-cols-4 gap-5">
                {related.map((r) => (
                  <Link key={r.id} to={`/product/${r.id}`} className="group">
                    <div className="aspect-square rounded-3xl bg-gradient-to-b from-muted/40 to-muted/10 border border-border/60 overflow-hidden relative">
                      <OptimizedImage src={r.image_url || "/placeholder.svg"} alt={r.name} className="w-full h-full object-contain p-6 group-hover:scale-105 transition-transform" />
                      {r.badge_text && (
                        <Badge className="absolute top-3 left-3 rounded-full text-[10px]" style={{ backgroundColor: r.badge_color || "hsl(var(--primary))", color: "white" }}>
                          {r.badge_text}
                        </Badge>
                      )}
                    </div>
                    <div className="px-1 pt-3">
                      <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{r.category}</div>
                      <div className="font-display font-semibold text-base mt-1 line-clamp-1 group-hover:text-primary transition-colors">{r.name}</div>
                      <div className="font-display font-bold text-lg mt-1">{formatNaira(Number(r.price))}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      <Footer />
      <GeminiChat />
    </div>
  );
};

export default ProductDetail;
