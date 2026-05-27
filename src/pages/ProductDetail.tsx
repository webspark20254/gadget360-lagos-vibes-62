import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Heart, Share2, Star, Shield, Truck, Award, ChevronRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LiveChat from "@/components/LiveChat";
import Seo from "@/components/Seo";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProductAddToCart from "@/components/ProductAddToCart";
import ProductReviews from "@/components/ProductReviews";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import OptimizedImage from "@/components/OptimizedImage";
import { waOrderUrl, waQuoteUrl, formatNaira } from "@/lib/whatsapp";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(0);
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
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

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-0">
      <Seo
        title={`${product.name} — ${formatNaira(product.price)} | Gadget360.ng`}
        description={`${product.name} in Lagos. ${product.description?.slice(0, 140) || "Authentic product with warranty."} Order on WhatsApp.`}
        canonical={`/product/${product.id}`}
        image={product.image_url}
        type="product"
        jsonLd={productLd}
      />
      <Header />

      {/* ===== MOBILE LAYOUT (matches inspiration: dark hero, image stage, sticky CTAs) ===== */}
      <div className="md:hidden">
        {/* Back + share bar */}
        <div className="sticky top-16 z-30 bg-background/85 backdrop-blur-xl border-b border-border/60">
          <div className="flex items-center justify-between px-4 h-12">
            <button onClick={() => navigate(-1)} className="h-9 w-9 grid place-items-center rounded-full bg-muted">
              <ArrowLeft size={16} />
            </button>
            <div className="font-display font-semibold text-sm truncate px-3">Products</div>
            <Link to="/shop" className="text-xs font-medium text-muted-foreground">Change</Link>
          </div>
        </div>

        {/* Image stage */}
        <div className="relative bg-gradient-warm">
          <div className="relative aspect-square mx-4 mt-4 rounded-[28px] overflow-hidden bg-card border border-border">
            <OptimizedImage src={currentImg} alt={product.name} className="w-full h-full object-contain p-6" priority />
            <button className="absolute top-3 right-3 h-9 w-9 grid place-items-center rounded-full glass">
              <Heart size={15} />
            </button>
            {product.badge_text && (
              <Badge className="absolute top-3 left-3 rounded-full text-[10px]" style={{ backgroundColor: product.badge_color || "hsl(var(--primary))", color: "white" }}>
                {product.badge_text}
              </Badge>
            )}
          </div>

          {/* Thumbnail strip */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto px-4 py-4 scrollbar-hide">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`shrink-0 h-16 w-16 rounded-2xl overflow-hidden border-2 transition ${
                    selectedImage === i ? "border-foreground" : "border-border"
                  }`}
                >
                  <OptimizedImage src={img} alt="" className="w-full h-full object-contain p-1.5 bg-card" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="px-5 pt-3 pb-6 space-y-4">
          <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{product.category}</div>
          <h1 className="font-display font-bold text-3xl leading-tight tracking-tight">{product.name}</h1>
          <div className="flex items-center gap-2 text-xs">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={12} className={i < 4 ? "fill-primary text-primary" : "text-muted-foreground"} />
              ))}
            </div>
            <span className="text-muted-foreground">4.5 · {inStock ? "In stock" : "Out of stock"}</span>
          </div>

          <div className="font-display font-bold text-4xl text-primary">{formatNaira(product.price)}</div>

          {/* Pill info tabs (inspiration style) */}
          <div className="grid grid-cols-3 gap-2 pt-2">
            <div className="rounded-2xl bg-cream p-3 text-center">
              <Shield size={16} className="mx-auto mb-1 text-primary" />
              <div className="text-[10px] font-medium">Authentic</div>
            </div>
            <div className="rounded-2xl bg-cream p-3 text-center">
              <Truck size={16} className="mx-auto mb-1 text-primary" />
              <div className="text-[10px] font-medium">Free Lagos</div>
            </div>
            <div className="rounded-2xl bg-cream p-3 text-center">
              <Award size={16} className="mx-auto mb-1 text-primary" />
              <div className="text-[10px] font-medium">Warranty</div>
            </div>
          </div>

          <div className="pt-2">
            <h3 className="font-display font-semibold text-sm uppercase tracking-wider mb-2">Description</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>
          </div>

          <ProductAddToCart productId={product.id} stockQuantity={product.stock_quantity} className="w-full" />
        </div>

        {/* Sticky bottom action bar */}
        <div className="fixed bottom-0 inset-x-0 z-40 glass-strong border-t border-border/60 px-4 py-3 flex gap-2">
          <a href={waQuoteUrl(product.name)} target="_blank" rel="noopener noreferrer" className="flex-1">
            <Button variant="outline" className="w-full h-12 rounded-full border-foreground/20 font-semibold gap-2">
              <WhatsAppIcon size={16} /> Quote
            </Button>
          </a>
          <a href={waOrderUrl(product.name, product.price)} target="_blank" rel="noopener noreferrer" className="flex-[1.4]">
            <Button className="w-full h-12 rounded-full bg-whatsapp hover:bg-whatsapp/90 text-white font-semibold gap-2">
              <WhatsAppIcon size={16} /> Order on WhatsApp
            </Button>
          </a>
        </div>
      </div>

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
              <Button variant="outline" size="icon" className="h-12 w-12 rounded-full border-foreground/20"><Share2 size={18} /></Button>
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
      <LiveChat />
    </div>
  );
};

export default ProductDetail;
