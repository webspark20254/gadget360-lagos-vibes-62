import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type T = { id: string; name: string; location: string | null; rating: number; quote: string };

const defaults: T[] = [
  { id: "d1", name: "Tunde A.", location: "Lagos", rating: 5, quote: "Got my iPhone 15 Pro Max delivered same day in Lekki. Sealed, authentic, exactly as advertised. Easy 10." },
  { id: "d2", name: "Chiamaka O.", location: "Abuja", rating: 5, quote: "Bought a MacBook Air, shipped to Abuja next day with a real warranty card. Their WhatsApp support is unreal." },
  { id: "d3", name: "Seyi K.", location: "Ibadan", rating: 5, quote: "Swapped my old PS4 for a PS5 with a fair top-up. Smooth, transparent, no stories. My go-to plug now." },
];

const colors = ["bg-cream text-cream-foreground", "bg-primary text-primary-foreground", "bg-foreground text-background"];

const Testimonials = () => {
  const [items, setItems] = useState<T[]>(defaults);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("testimonials")
        .select("id, name, location, rating, quote")
        .eq("is_approved", true)
        .order("created_at", { ascending: false })
        .limit(6);
      if (!cancelled && data && data.length) setItems(data as T[]);
    })();

    const ch = supabase
      .channel("testimonials-public")
      .on("postgres_changes", { event: "*", schema: "public", table: "testimonials" }, async () => {
        const { data } = await supabase
          .from("testimonials")
          .select("id, name, location, rating, quote")
          .eq("is_approved", true)
          .order("created_at", { ascending: false })
          .limit(6);
        if (data && data.length) setItems(data as T[]);
      })
      .subscribe();

    return () => { cancelled = true; supabase.removeChannel(ch); };
  }, []);

  return (
    <section className="py-14 md:py-24 bg-background">
      <div className="container mx-auto px-5 md:px-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10 md:mb-14">
          <div>
            <p className="text-[11px] uppercase tracking-[0.25em] text-primary mb-3">Word on the street</p>
            <h2 className="font-display font-bold text-3xl md:text-5xl tracking-tight leading-[1.05] max-w-xl">
              What customers <span className="font-serif-display">whisper.</span>
            </h2>
          </div>
          <div className="flex items-center gap-1">
            {[1,2,3,4,5].map((i) => <Star key={i} size={18} className="fill-primary text-primary" />)}
            <span className="text-sm font-medium ml-2">4.9 · {items.length}+ live reviews</span>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4 md:gap-6">
          {items.slice(0, 3).map((t, i) => (
            <article
              key={t.id}
              className={`rounded-[28px] p-6 md:p-8 ${colors[i % 3]} ${i === 1 ? "md:translate-y-6" : ""} transition-transform`}
            >
              <div className="font-serif-display text-5xl leading-none mb-4 opacity-70">"</div>
              <p className="text-base md:text-lg leading-relaxed font-medium line-clamp-6">{t.quote}</p>
              <div className="mt-6 pt-6 border-t border-current/15 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-sm">{t.name}</div>
                  <div className="text-xs opacity-70">{t.location || "Nigeria"}</div>
                </div>
                <div className="flex">
                  {Array.from({ length: Math.max(1, Math.min(5, t.rating)) }).map((_, s) => (
                    <Star key={s} size={12} className="fill-current opacity-90" />
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
