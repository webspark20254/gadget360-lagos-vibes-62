import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import { WHATSAPP_NUMBER, formatNaira } from "@/lib/whatsapp";

interface CartItem {
  id: string;
  quantity: number;
  product: { id: string; name: string; price: number; image_url: string; stock_quantity: number };
}

const Cart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) { navigate("/auth"); return; }
    loadCartItems();
  }, [user, navigate]);

  const loadCartItems = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("cart_items")
        .select("id, quantity, product:products(id, name, price, image_url, stock_quantity)")
        .eq("user_id", user.id);
      if (error) throw error;
      const norm = (data || []).map((item: any) => ({
        ...item,
        product: Array.isArray(item.product) ? item.product[0] : item.product,
      })) as CartItem[];
      setCartItems(norm.filter((i) => i.product));
    } catch (e) {
      console.error(e);
      toast({ title: "Error", description: "Failed to load cart", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (id: string, qty: number) => {
    if (qty <= 0) return removeItem(id);
    setCartItems((prev) => prev.map((i) => (i.id === id ? { ...i, quantity: qty } : i)));
    await supabase.from("cart_items").update({ quantity: qty }).eq("id", id);
  };

  const removeItem = async (id: string) => {
    setCartItems((prev) => prev.filter((i) => i.id !== id));
    await supabase.from("cart_items").delete().eq("id", id);
    toast({ title: "Item removed" });
  };

  const total = cartItems.reduce((s, i) => s + i.product.price * i.quantity, 0);

  const sendOnWhatsApp = () => {
    const lines = cartItems
      .map((i) => `• ${i.product.name} ×${i.quantity} — ${formatNaira(i.product.price * i.quantity)}`)
      .join("\n");
    const text = `Hi Gadget360.ng! I'd like to order the following:\n\n${lines}\n\nTotal: ${formatNaira(total)}\n\nPlease confirm availability & delivery. Thank you!`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, "_blank");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center text-sm text-muted-foreground">Loading cart…</div>
        <Footer />
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-5 py-20 text-center">
          <ShoppingBag className="mx-auto h-14 w-14 text-muted-foreground mb-4" />
          <h2 className="font-display font-bold text-3xl mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-6 text-sm">Add a gadget you love to get started.</p>
          <Button onClick={() => navigate("/shop")} className="rounded-full h-11 px-6">Browse Shop</Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-36 lg:pb-0">
      <Header />
      <div className="container mx-auto px-5 md:px-8 py-6 md:py-10">
        <Link to="/shop" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary mb-4">
          <ArrowLeft size={14} /> Continue shopping
        </Link>
        <h1 className="font-display font-bold text-3xl md:text-5xl tracking-tight mb-6 md:mb-10">
          Your <span className="font-serif-display text-primary">cart</span>
        </h1>

        <div className="grid lg:grid-cols-3 gap-6 lg:gap-10">
          {/* Items */}
          <div className="lg:col-span-2 space-y-3">
            {cartItems.map((item) => (
              <div key={item.id} className="rounded-2xl border border-border bg-card p-3 md:p-4">
                <div className="flex gap-3 md:gap-4">
                  <Link to={`/product/${item.product.id}`} className="h-20 w-20 md:h-24 md:w-24 rounded-xl bg-muted overflow-hidden shrink-0">
                    <img src={item.product.image_url} alt={item.product.name} className="w-full h-full object-contain p-1.5" />
                  </Link>
                  <div className="flex-1 min-w-0 flex flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <Link to={`/product/${item.product.id}`} className="text-sm md:text-base font-semibold leading-snug line-clamp-2 hover:text-primary">
                        {item.product.name}
                      </Link>
                      <button onClick={() => removeItem(item.id)} className="text-muted-foreground hover:text-destructive p-1 -mr-1" aria-label="Remove">
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="font-display font-bold text-primary text-base md:text-lg mt-0.5">
                      {formatNaira(item.product.price)}
                    </div>
                    {item.product.stock_quantity < 10 && (
                      <Badge variant="destructive" className="mt-1 self-start text-[10px] rounded-full">
                        Only {item.product.stock_quantity} left
                      </Badge>
                    )}
                    <div className="mt-auto pt-2 flex items-center justify-between">
                      <div className="inline-flex items-center rounded-full bg-muted">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="h-8 w-8 grid place-items-center rounded-full hover:bg-muted-foreground/10">
                          <Minus size={14} />
                        </button>
                        <span className="px-3 text-sm font-semibold tabular-nums">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} disabled={item.quantity >= item.product.stock_quantity} className="h-8 w-8 grid place-items-center rounded-full hover:bg-muted-foreground/10 disabled:opacity-40">
                          <Plus size={14} />
                        </button>
                      </div>
                      <div className="text-sm font-semibold tabular-nums">
                        {formatNaira(item.product.price * item.quantity)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary (desktop) */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 rounded-2xl border border-border bg-card p-6 space-y-4">
              <h2 className="font-display font-bold text-xl">Order summary</h2>
              <div className="space-y-2 text-sm">
                {cartItems.map((i) => (
                  <div key={i.id} className="flex justify-between gap-3">
                    <span className="text-muted-foreground truncate">{i.product.name} ×{i.quantity}</span>
                    <span className="font-medium shrink-0">{formatNaira(i.product.price * i.quantity)}</span>
                  </div>
                ))}
              </div>
              <Separator />
              <div className="flex items-end justify-between">
                <span className="text-xs uppercase tracking-wider text-muted-foreground">Total</span>
                <span className="font-display font-bold text-2xl">{formatNaira(total)}</span>
              </div>
              <Button onClick={sendOnWhatsApp} className="w-full h-12 rounded-full bg-whatsapp hover:bg-whatsapp/90 text-white font-semibold gap-2">
                <WhatsAppIcon size={16} /> Order on WhatsApp
              </Button>
              <p className="text-[11px] text-muted-foreground text-center">Orders are processed personally on WhatsApp.</p>
            </div>
          </aside>
        </div>
      </div>

      {/* Mobile sticky checkout bar */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 glass-strong border-t border-border/60 px-4 py-3">
        <div className="flex items-end justify-between mb-2">
          <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Total</span>
          <span className="font-display font-bold text-xl">{formatNaira(total)}</span>
        </div>
        <Button onClick={sendOnWhatsApp} className="w-full h-12 rounded-full bg-whatsapp hover:bg-whatsapp/90 text-white font-semibold gap-2">
          <WhatsAppIcon size={16} /> Order on WhatsApp
        </Button>
      </div>

      <Footer />
    </div>
  );
};

export default Cart;
