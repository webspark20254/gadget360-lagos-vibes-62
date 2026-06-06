import { useEffect } from "react";
import { trackWhatsAppClick } from "@/lib/analytics";

// Infer a coarse source label from the originating element so admins can
// see which surface drove the click (product card, cart, header, etc).
const inferSource = (el: HTMLElement): string => {
  const explicit = el.closest<HTMLElement>("[data-wa-source]")?.dataset.waSource;
  if (explicit) return explicit;
  const path = typeof window !== "undefined" ? window.location.pathname : "/";
  if (path.startsWith("/product/")) return "product";
  if (path.startsWith("/cart")) return "cart";
  if (path.startsWith("/admin")) return "admin";
  if (path.startsWith("/profile")) return "profile";
  if (path.startsWith("/contact")) return "contact";
  if (path === "/" || path === "") return "home";
  return "other";
};

/**
 * Global, low-overhead listener: any click on a link pointing to wa.me
 * records a row in `whatsapp_clicks`. Fires before the new tab opens so
 * the redirect is never blocked.
 */
const WhatsAppClickTracker = () => {
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const link = target.closest<HTMLAnchorElement>('a[href*="wa.me/"]');
      if (!link) return;

      const wrapper = link.closest<HTMLElement>("[data-wa-product]");
      const productName = wrapper?.dataset.waProduct ?? null;
      const productId = wrapper?.dataset.waProductId ?? null;
      const qtyAttr = wrapper?.dataset.waQuantity;
      const totalAttr = wrapper?.dataset.waTotal;

      void trackWhatsAppClick({
        source: inferSource(link),
        product_id: productId,
        product_name: productName,
        quantity: qtyAttr ? Number(qtyAttr) : null,
        total_amount: totalAttr ? Number(totalAttr) : null,
      });
    };
    document.addEventListener("click", handler, { capture: true });
    return () => document.removeEventListener("click", handler, { capture: true } as AddEventListenerOptions);
  }, []);

  return null;
};

export default WhatsAppClickTracker;
