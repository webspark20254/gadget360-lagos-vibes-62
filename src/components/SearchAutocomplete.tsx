import { useEffect, useRef, useState } from "react";
import { Search, X, ArrowRight, Tag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { CATEGORIES } from "@/lib/categories";
import { formatNaira } from "@/lib/whatsapp";

interface ProductHit {
  id: string;
  name: string;
  price: number;
  category: string;
  image_url: string | null;
}

interface Props {
  placeholder?: string;
  className?: string;
  onNavigate?: () => void;
  autoFocus?: boolean;
}

const SearchAutocomplete = ({ placeholder = "Search phones, laptops, consoles…", className = "", onNavigate, autoFocus }: Props) => {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [hits, setHits] = useState<ProductHit[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const wrap = useRef<HTMLDivElement>(null);

  // close on outside click
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (wrap.current && !wrap.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  useEffect(() => {
    const term = q.trim();
    if (!term) { setHits([]); return; }
    setLoading(true);
    const t = setTimeout(async () => {
      const { data } = await supabase
        .from("products")
        .select("id, name, price, category, image_url")
        .ilike("name", `%${term}%`)
        .limit(6);
      setHits((data || []) as ProductHit[]);
      setLoading(false);
    }, 200);
    return () => clearTimeout(t);
  }, [q]);

  const filteredCats = q.trim()
    ? CATEGORIES.filter((c) => c.name.toLowerCase().includes(q.trim().toLowerCase()))
    : CATEGORIES.slice(0, 4);

  const go = (path: string) => {
    setOpen(false);
    setQ("");
    onNavigate?.();
    navigate(path);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!q.trim()) return;
    go(`/shop?search=${encodeURIComponent(q.trim())}`);
  };

  return (
    <div ref={wrap} className={`relative ${className}`}>
      <form onSubmit={submit} className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" size={15} />
        <Input
          autoFocus={autoFocus}
          value={q}
          onChange={(e) => { setQ(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="pl-10 pr-9 h-10 rounded-full bg-muted/60 border-transparent focus:bg-background focus:border-border text-sm"
        />
        {q && (
          <button type="button" onClick={() => { setQ(""); setHits([]); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            <X size={14} />
          </button>
        )}
      </form>

      {open && (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 rounded-2xl border border-border bg-popover shadow-elegant overflow-hidden max-h-[70vh] overflow-y-auto">
          {q.trim() && (
            <div className="px-4 pt-3 pb-1">
              <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">Products</div>
              {loading && <div className="text-xs text-muted-foreground py-2">Searching…</div>}
              {!loading && hits.length === 0 && <div className="text-xs text-muted-foreground py-2">No products match "{q}".</div>}
              {hits.map((h) => (
                <Link key={h.id} to={`/product/${h.id}`} onClick={() => { setOpen(false); setQ(""); onNavigate?.(); }} className="flex items-center gap-3 py-2 px-2 -mx-2 rounded-xl hover:bg-muted transition-colors">
                  <div className="h-10 w-10 rounded-lg bg-muted overflow-hidden shrink-0">
                    {h.image_url && <img src={h.image_url} alt={h.name} className="w-full h-full object-contain p-1" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{h.name}</div>
                    <div className="text-[11px] text-muted-foreground">{h.category} · <span className="text-primary font-semibold">{formatNaira(h.price)}</span></div>
                  </div>
                  <ArrowRight size={14} className="text-muted-foreground" />
                </Link>
              ))}
              {hits.length > 0 && (
                <button onClick={submit} className="w-full text-left text-xs font-semibold text-primary py-2 mt-1 hover:underline">
                  See all results for "{q}" →
                </button>
              )}
            </div>
          )}

          <div className="px-4 py-3 border-t border-border/60">
            <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2">{q.trim() ? "Matching categories" : "Browse categories"}</div>
            <div className="flex flex-wrap gap-1.5">
              {filteredCats.map((c) => {
                const Icon = c.icon;
                return (
                  <button key={c.slug} onClick={() => go(`/shop?category=${encodeURIComponent(c.slug)}`)} className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full bg-muted hover:bg-foreground hover:text-background text-xs font-medium transition-colors">
                    <Icon size={12} /> {c.name}
                  </button>
                );
              })}
              {filteredCats.length === 0 && <span className="text-xs text-muted-foreground">No category matches.</span>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchAutocomplete;
