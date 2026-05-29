import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
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
  const { user } = useAuth();
  const [selectedImage, setSelectedImage] = useState(0);
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState<"about" | "specs" | "reviews">("about");
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
      url: `https://gadget360.ng/product/${product.id}`,
      seller: { "@type": "Organization", name: "Gadget360.ng" },
    },
  };

  const addToCart = async () => {
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

  return (
    <div className="min-h-screen bg-background">


      <Seo
        title={`${product.name} — ${formatNaira(product.price)} | Gadget360.ng`}
        description={`${product.name} in Lagos. ${product.description?.slice(0, 140) || "Authentic product with warranty."} Order on WhatsApp.`}
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
            <h1 className="font-display font-bold text-[34px] leading-[1.05] tracking-tight">Products</h1>
            <Link to="/shop" className="text-xs font-medium text-muted-foreground hover:text-primary pb-1.5">
              Change Product
            </Link>
          </div>
        </div>

        {/* Image stage — large, soft pedestal */}
        <div className="relative mx-5 mt-3 rounded-[28px] bg-gradient-to-b from-muted/40 to-muted/20 aspect-[4/4] overflow-hidden">
          <OptimizedImage src={currentImg} alt={product.name} className="absolute inset-0 w-full h-full object-contain p-8" priority />
          <button className="absolute top-3 right-3 h-9 w-9 grid place-items-center rounded-full bg-background/70 backdrop-blur-md shadow-soft">
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
                <h2 className="font-display font-bold text-2xl leading-tight mt-1">{product.name}</h2>
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
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="h-10 w-10 grid place-items-center rounded-full hover:bg-background/10"><Minus size={14} /></button>
              <span className="px-2 text-sm font-semibold tabular-nums w-7 text-center">{qty}</span>
              <button onClick={() => setQty(Math.min(product.stock_quantity || 99, qty + 1))} className="h-10 w-10 grid place-items-center rounded-full hover:bg-background/10"><Plus size={14} /></button>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={addToCart} disabled={!inStock} variant="outline" className="flex-1 h-12 rounded-full border-background/30 bg-transparent text-background hover:bg-background hover:text-foreground font-semibold text-xs">
              Add to Cart
            </Button>
            <a href={waOrderUrl(product.name, totalPrice)} target="_blank" rel="noopener noreferrer" className="flex-[1.2]">
              <Button disabled={!inStock} className="w-full h-12 rounded-full bg-whatsapp hover:bg-whatsapp/90 text-white font-semibold gap-2 text-xs">
                <WhatsAppIcon size={14} /> Buy Now
              </Button>
            </a>
          </div>
        </section>


      {/* ===== DESKTOP LAYOUT ===== */}
      <main className="hidden md:block container mx-auto px-8 py-10">
        <div className="flex items-center gap-2 mb-6 text-xs text-muted-foreground uppercase tracking-wider">
          <Link to="/" className="hover:text-primary">Home</Link>
          <ChevronRight size={12} />
          <Link to="/shop" className="hover:text-primary">Shop</Link>
          <ChevronRight size={12} />
          <Link to={`/shop?category=${encodeURIComponent(product.category || "")}`} className="hover:text-primary">{product.category}</Link>
          <ChevronRight size={12} />
          <span className="text-foreground normal-case tracking-normal font-medium">{product.name}</span>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          <div className="space-y-4">
            <div className="aspect-square rounded-[28px] overflow-hidden bg-card border border-border relative">
              <OptimizedImage src={currentImg} alt={product.name} className="w-full h-full object-contain p-10" priority />
              {product.badge_text && (
                <Badge className="absolute top-4 left-4 rounded-full" style={{ backgroundColor: product.badge_color || "hsl(var(--primary))", color: "white" }}>
                  {product.badge_text}
                </Badge>
              )}
            </div>
            {images.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`aspect-square rounded-xl overflow-hidden border-2 transition ${selectedImage === i ? "border-foreground" : "border-border"}`}
                  >
                    <OptimizedImage src={img} alt="" className="w-full h-full object-contain p-2 bg-card" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <div className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-3">{product.category}</div>
              <h1 className="font-display font-bold text-5xl leading-[0.95] tracking-tight mb-4">{product.name}</h1>
              <div className="flex items-center gap-3 text-sm">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} className={i < 4 ? "fill-primary text-primary" : "text-muted-foreground"} />
                  ))}
                </div>
                <span className="text-muted-foreground">4.5 (Reviews) · </span>
                <span className={inStock ? "text-success font-medium" : "text-destructive font-medium"}>{inStock ? "In stock" : "Out of stock"}</span>
              </div>
            </div>

            <div className="font-display font-bold text-5xl text-primary">{formatNaira(product.price)}</div>

            <p className="text-muted-foreground leading-relaxed">{product.description}</p>

            <div className="flex gap-2">
              <a href={waOrderUrl(product.name, product.price)} target="_blank" rel="noopener noreferrer" className="flex-1">
                <Button disabled={!inStock} className="w-full h-12 rounded-full bg-whatsapp hover:bg-whatsapp/90 text-white font-semibold gap-2">
                  <WhatsAppIcon size={16} /> Order on WhatsApp
                </Button>
              </a>
              <a href={waQuoteUrl(product.name)} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="h-12 px-5 rounded-full border-foreground/20 font-semibold gap-2">
                  <WhatsAppIcon size={16} /> Get Quote
                </Button>
              </a>
              <Button variant="outline" size="icon" className="h-12 w-12 rounded-full border-foreground/20"><Heart size={18} /></Button>
            </div>

            <ProductAddToCart productId={product.id} stockQuantity={product.stock_quantity} className="w-full" />

            <div className="grid grid-cols-3 gap-3 pt-4">
              <div className="rounded-2xl border border-border p-4 text-center">
                <Shield className="mx-auto mb-2 text-primary" size={20} />
                <p className="text-xs font-semibold">Authentic</p>
                <p className="text-[10px] text-muted-foreground">100% Original</p>
              </div>
              <div className="rounded-2xl border border-border p-4 text-center">
                <Truck className="mx-auto mb-2 text-primary" size={20} />
                <p className="text-xs font-semibold">Fast Delivery</p>
                <p className="text-[10px] text-muted-foreground">Nationwide</p>
              </div>
              <div className="rounded-2xl border border-border p-4 text-center">
                <Award className="mx-auto mb-2 text-primary" size={20} />
                <p className="text-xs font-semibold">Warranty</p>
                <p className="text-[10px] text-muted-foreground">1 Year</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16">
          <Tabs defaultValue="description">
            <TabsList className="grid w-full max-w-md grid-cols-3 rounded-full bg-muted h-11">
              <TabsTrigger value="description" className="rounded-full">Description</TabsTrigger>
              <TabsTrigger value="specifications" className="rounded-full">Specs</TabsTrigger>
              <TabsTrigger value="reviews" className="rounded-full">Reviews</TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="mt-6">
              <Card className="p-6 rounded-2xl">
                <p className="text-muted-foreground leading-relaxed">{product.description}</p>
              </Card>
            </TabsContent>
            <TabsContent value="specifications" className="mt-6">
              <Card className="p-6 rounded-2xl space-y-3">
                <div className="flex justify-between py-2 border-b border-border"><span className="font-medium">Category</span><span className="text-muted-foreground">{product.category}</span></div>
                <div className="flex justify-between py-2 border-b border-border"><span className="font-medium">Price</span><span className="text-muted-foreground">{formatNaira(product.price)}</span></div>
                <div className="flex justify-between py-2"><span className="font-medium">Stock</span><span className="text-muted-foreground">{inStock ? `${product.stock_quantity} in stock` : "Out of stock"}</span></div>
              </Card>
            </TabsContent>
            <TabsContent value="reviews" className="mt-6"><ProductReviews productId={product.id} /></TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
      <GeminiChat />
    </div>
  );
};

export default ProductDetail;
