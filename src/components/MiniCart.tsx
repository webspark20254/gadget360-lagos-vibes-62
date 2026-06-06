import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, Link } from "react-router-dom";
import { formatNaira, waCartOrderUrl } from "@/lib/whatsapp";

interface CartItem {
  id: string;
  quantity: number;
  product: { id: string; name: string; price: number; image_url: string; stock_quantity: number };
}

const MiniCart = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  const count = items.reduce((s, i) => s + i.quantity, 0);
  const total = items.reduce((s, i) => s + i.quantity * i.product.price, 0);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("cart_items")
      .select("id, quantity, product:products(id, name, price, image_url, stock_quantity)")
      .eq("user_id", user.id);
    const norm = (data || []).map((it: any) => ({
      ...it,
      product: Array.isArray(it.product) ? it.product[0] : it.product,
    })) as CartItem[];
    setItems(norm.filter((i) => i.product));
    setLoading(false);
  };

  useEffect(() => {
    if (user) load();
    else setItems([]);
  }, [user]);

  useEffect(() => {
    if (open && user) load();
  }, [open]);

  // Realtime sync — keep badge fresh
  useEffect(() => {
    if (!user) return;
    const ch = supabase
      .channel(`cart:${user.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "cart_items", filter: `user_id=eq.${user.id}` }, () => load())
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [user]);

  const update = async (id: string, qty: number) => {
    if (qty <= 0) return remove(id);
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, quantity: qty } : i)));
    await supabase.from("cart_items").update({ quantity: qty }).eq("id", id);
  };
  const remove = async (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    await supabase.from("cart_items").delete().eq("id", id);
  };

  const sendOnWhatsApp = () => {
    const url = waCartOrderUrl(
      items.map((i) => ({ name: i.product.name, quantity: i.quantity, unitPrice: i.product.price })),
      total,
    );
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const trigger = (
    <Button variant="ghost" size="icon" className="relative rounded-full h-9 w-9" aria-label="Open cart">
      <ShoppingCart className="h-4 w-4" />
      {count > 0 && (
        <Badge className="absolute -top-1 -right-1 h-4 min-w-4 px-1 flex items-center justify-center text-[10px] bg-primary text-primary-foreground border-0">
          {count > 99 ? "99+" : count}
        </Badge>
      )}
    </Button>
  );

  if (!user) {
    return (
      <button onClick={() => navigate("/auth")} className="contents">
        {trigger}
      </button>
    );
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col p-0 bg-background">
        <SheetHeader className="px-5 py-4 border-b border-border/60">
          <SheetTitle className="font-display text-xl tracking-tight flex items-center gap-2">
            Your cart <span className="text-xs font-normal text-muted-foreground">({count} items)</span>
          </SheetTitle>
        </SheetHeader>

        {loading ? (
          <div className="flex-1 grid place-items-center text-sm text-muted-foreground">Loading…</div>
        ) : items.length === 0 ? (
          <div className="flex-1 grid place-items-center text-center px-6">
            <div>
              <ShoppingBag size={42} className="mx-auto text-muted-foreground mb-3" />
              <p className="font-display text-lg mb-1">Cart is empty</p>
              <p className="text-sm text-muted-foreground mb-5">Browse the shop and add a gadget you love.</p>
              <Button onClick={() => { setOpen(false); navigate("/shop"); }} className="rounded-full">Browse Shop</Button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2.5">
              {items.map((it) => (
                <div key={it.id} className="flex gap-3 p-2.5 rounded-2xl border border-border bg-card">
                  <div className="h-16 w-16 rounded-xl bg-muted overflow-hidden shrink-0">
                    <img src={it.product.image_url} alt={it.product.name} className="w-full h-full object-contain p-1" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link to={`/product/${it.product.id}`} onClick={() => setOpen(false)} className="block text-sm font-medium leading-snug line-clamp-2 hover:text-primary">
                      {it.product.name}
                    </Link>
                    <div className="text-sm font-display font-semibold text-primary mt-0.5">{formatNaira(it.product.price)}</div>
                    <div className="flex items-center justify-between mt-1.5">
                      <div className="inline-flex items-center rounded-full bg-muted">
                        <button aria-label="Decrease quantity" onClick={() => update(it.id, it.quantity - 1)} className="h-7 w-7 grid place-items-center rounded-full hover:bg-muted-foreground/10"><Minus size={12} /></button>
                        <span className="px-2 text-xs font-semibold tabular-nums">{it.quantity}</span>
                        <button aria-label="Increase quantity" onClick={() => update(it.id, it.quantity + 1)} disabled={it.quantity >= it.product.stock_quantity} className="h-7 w-7 grid place-items-center rounded-full hover:bg-muted-foreground/10 disabled:opacity-40"><Plus size={12} /></button>
                      </div>
                      <button onClick={() => remove(it.id)} className="text-muted-foreground hover:text-destructive p-1" aria-label="Remove item from cart"><Trash2 size={14} /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-border/60 px-4 py-4 space-y-3 bg-background">
              <div className="flex items-end justify-between">
                <span className="text-xs uppercase tracking-wider text-muted-foreground">Total</span>
                <span className="font-display font-bold text-2xl">{formatNaira(total)}</span>
              </div>
              <Button onClick={sendOnWhatsApp} className="w-full h-12 rounded-full bg-whatsapp hover:bg-whatsapp/90 text-white font-semibold gap-2">
                <WhatsAppIcon size={16} /> Send order on WhatsApp
              </Button>
              <Button variant="outline" onClick={() => { setOpen(false); navigate("/cart"); }} className="w-full h-10 rounded-full border-foreground/20 text-xs">
                View full cart
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default MiniCart;
