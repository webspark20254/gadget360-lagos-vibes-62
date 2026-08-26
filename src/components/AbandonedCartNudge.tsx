import { useEffect, useRef, useState } from "react";
import { X, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useLocation, useNavigate } from "@/lib/router-compat";
import { formatNaira, waCartOrderUrl } from "@/lib/whatsapp";
import { trackWhatsAppClick } from "@/lib/analytics";

interface NudgeItem {
  id: string;
  quantity: number;
  name: string;
  price: number;
  image_url: string | null;
}

/** How long a cart must sit untouched before we nudge (ms). */
const IDLE_MS = 90_000;
/** Don't nudge the same shopper again within this window (ms). */
const SNOOZE_MS = 6 * 60 * 60 * 1000;
const SNOOZE_KEY = "g360-cart-nudge-snoozed-until";
/** Routes where a nudge would be noise — they're already checking out. */
const MUTED_PATHS = ["/cart", "/auth", "/admin", "/adminsuper", "/welcome"];

const isSnoozed = () => {
  if (typeof window === "undefined") return true;
  const until = Number(window.localStorage.getItem(SNOOZE_KEY) ?? 0);
  return Number.isFinite(until) && Date.now() < until;
};

const snooze = () => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SNOOZE_KEY, String(Date.now() + SNOOZE_MS));
};

/**
 * Abandoned-cart nudge: when a signed-in shopper has items sitting in their
 * cart and goes quiet for a while without reaching checkout, offer to hand the
 * exact basket to the sales line on WhatsApp in one tap.
 */
const AbandonedCartNudge = () => {
  const { user, loading: authLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [items, setItems] = useState<NudgeItem[]>([]);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const muted = MUTED_PATHS.some((p) => location.pathname.startsWith(p));
  const total = items.reduce((s, i) => s + i.quantity * i.price, 0);
  const count = items.reduce((s, i) => s + i.quantity, 0);

  // Load the cart, then arm an idle timer. Any cart change re-arms it, so an
  // actively shopping customer is never interrupted.
  useEffect(() => {
    if (authLoading || !user || muted || isSnoozed()) {
      setVisible(false);
      return;
    }

    let cancelled = false;

    const arm = async () => {
      const { data } = await supabase
        .from("cart_items")
        .select("id, quantity, updated_at, product:products(name, price, image_url)")
        .eq("user_id", user.id);

      if (cancelled) return;

      const rows = (data ?? [])
        .map((row: any) => {
          const product = Array.isArray(row.product) ? row.product[0] : row.product;
          return product
            ? {
                id: row.id as string,
                quantity: row.quantity as number,
                name: product.name as string,
                price: Number(product.price) || 0,
                image_url: (product.image_url as string | null) ?? null,
                updated_at: row.updated_at as string | null,
              }
            : null;
        })
        .filter(Boolean) as (NudgeItem & { updated_at: string | null })[];

      setItems(rows.map(({ updated_at: _u, ...rest }) => rest));

      clearTimeout(timerRef.current);
      if (rows.length === 0) {
        setVisible(false);
        return;
      }

      // Count idle time from the newest cart activity, so a basket that was
      // already left behind yesterday nudges almost immediately.
      const newest = rows.reduce((max, r) => {
        const t = r.updated_at ? Date.parse(r.updated_at) : 0;
        return Number.isFinite(t) && t > max ? t : max;
      }, 0);
      const elapsed = newest ? Date.now() - newest : 0;
      const wait = Math.max(5_000, IDLE_MS - elapsed);

      timerRef.current = setTimeout(() => {
        if (!cancelled && !isSnoozed()) setVisible(true);
      }, wait);
    };

    void arm();

    const channel = supabase
      .channel(`cart-nudge:${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "cart_items", filter: `user_id=eq.${user.id}` },
        () => {
          setVisible(false);
          void arm();
        },
      )
      .subscribe();

    return () => {
      cancelled = true;
      clearTimeout(timerRef.current);
      supabase.removeChannel(channel);
    };
  }, [user, authLoading, muted]);

  if (!visible || muted || items.length === 0) return null;

  const dismiss = () => {
    snooze();
    setVisible(false);
  };

  const continueOnWhatsApp = () => {
    const url = waCartOrderUrl(
      items.map((i) => ({ name: i.name, quantity: i.quantity, unitPrice: i.price })),
      total,
    );
    void trackWhatsAppClick({
      source: "abandoned-cart-nudge",
      quantity: count,
      total_amount: total,
    });
    snooze();
    setVisible(false);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const preview = items.slice(0, 3);

  return (
    <div
      role="dialog"
      aria-label="Continue your order"
      className="fixed z-40 bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:w-[366px] animate-fade-up"
    >
      <div className="rounded-3xl border border-border bg-card shadow-elegant overflow-hidden">
        <div className="flex items-start gap-3 px-5 pt-5">
          <div className="h-9 w-9 shrink-0 grid place-items-center rounded-full bg-primary/10 text-primary">
            <ShoppingBag size={16} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-display font-bold text-base leading-tight tracking-tight">
              You left {count} item{count === 1 ? "" : "s"} behind
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Still available — finish the order on WhatsApp and we'll confirm stock right away.
            </p>
          </div>
          <button
            onClick={dismiss}
            aria-label="Dismiss cart reminder"
            className="text-muted-foreground hover:text-foreground p-1 -mr-1 -mt-1"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex items-center gap-2 px-5 pt-4">
          {preview.map((i) => (
            <div key={i.id} className="h-12 w-12 rounded-xl bg-muted overflow-hidden shrink-0">
              {i.image_url ? (
                <img src={i.image_url} alt={i.name} className="w-full h-full object-contain p-1" loading="lazy" />
              ) : null}
            </div>
          ))}
          {items.length > preview.length && (
            <span className="text-xs font-medium text-muted-foreground">+{items.length - preview.length} more</span>
          )}
          <span className="ml-auto font-display font-bold text-lg">{formatNaira(total)}</span>
        </div>

        <div className="p-5 pt-4 space-y-2">
          <Button
            onClick={continueOnWhatsApp}
            className="w-full h-11 rounded-full bg-whatsapp hover:bg-whatsapp/90 text-white font-semibold gap-2"
          >
            <WhatsAppIcon size={15} /> Continue on WhatsApp
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setVisible(false);
              navigate("/cart");
            }}
            className="w-full h-10 rounded-full border-foreground/20 text-xs"
          >
            View cart
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AbandonedCartNudge;
