import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import {
  User, Package, LogOut, ShoppingBag, Mail, Calendar, ArrowUpRight,
  Pencil, Star, Trash2, Quote, Camera, MessageSquareQuote,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GeminiChat from "@/components/GeminiChat";
import Seo from "@/components/Seo";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import { waGeneralUrl, formatNaira } from "@/lib/whatsapp";
import { Database } from "@/integrations/supabase/types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type Order = Database["public"]["Tables"]["orders"]["Row"];
type Review = Database["public"]["Tables"]["product_reviews"]["Row"] & { product?: { id: string; name: string; image_url: string | null } | null };
type Testimonial = Database["public"]["Tables"]["testimonials"]["Row"];

const statusTone: Record<string, string> = {
  completed: "bg-success text-success-foreground",
  pending: "bg-cream text-cream-foreground",
  cancelled: "bg-destructive text-destructive-foreground",
};

const Profile = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newTesti, setNewTesti] = useState({ quote: "", rating: 5, location: "" });
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) { navigate("/auth"); return; }
    loadAll();
  }, [user, navigate]);

  const loadAll = async () => {
    if (!user) return;
    try {
      const [{ data: p }, { data: o }, { data: r }, { data: t }] = await Promise.all([
        supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("orders").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("product_reviews").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("testimonials").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      ]);
      if (p) setProfile(p);
      setOrders(o || []);
      setTestimonials(t || []);

      // attach product info
      const ids = [...new Set((r || []).map((x) => x.product_id))];
      let prodMap: Record<string, any> = {};
      if (ids.length) {
        const { data: prods } = await supabase.from("products").select("id, name, image_url").in("id", ids);
        prodMap = Object.fromEntries((prods || []).map((p) => [p.id, p]));
      }
      setReviews((r || []).map((rv) => ({ ...rv, product: prodMap[rv.product_id] || null })));
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async () => {
    if (!user || !profile) return;
    setUpdating(true);
    try {
      const { error } = await supabase.from("profiles")
        .update({ full_name: profile.full_name, avatar_url: profile.avatar_url })
        .eq("user_id", user.id);
      if (error) throw error;
      toast({ title: "Saved", description: "Profile updated." });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally { setUpdating(false); }
  };

  const uploadAvatar = async (file: File) => {
    if (!user) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Image required", description: "Please choose a JPG, PNG or WebP image.", variant: "destructive" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Image too large", description: "Please upload an image under 5MB.", variant: "destructive" });
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("images", file);
      const { data, error } = await supabase.functions.invoke("upload-image", { body: formData });
      if (error) throw new Error(error.message || "Image upload failed");
      const avatar_url = data?.urls?.[0];
      if (!avatar_url) throw new Error("No image URL was returned. Please try again.");
      const { error: updateError } = await supabase.from("profiles").update({ avatar_url }).eq("user_id", user.id);
      if (updateError) throw updateError;
      setProfile((p) => p ? { ...p, avatar_url } : p);
      toast({ title: "Avatar updated", description: "Your profile photo is now live." });
    } catch (e: any) {
      toast({ title: "Upload failed", description: e.message || "Please try a different image.", variant: "destructive" });
    } finally { setUploading(false); }
  };

  const deleteReview = async (id: string) => {
    if (!confirm("Delete this review?")) return;
    const { error } = await supabase.from("product_reviews").delete().eq("id", id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    setReviews((rs) => rs.filter((r) => r.id !== id));
    toast({ title: "Review deleted" });
  };

  const postTestimonial = async () => {
    if (!user) return;
    if (newTesti.quote.trim().length < 8) {
      toast({ title: "Too short", description: "Write at least a sentence.", variant: "destructive" });
      return;
    }
    const { data, error } = await supabase.from("testimonials").insert({
      user_id: user.id,
      name: profile?.full_name || user.email?.split("@")[0] || "Customer",
      location: newTesti.location || null,
      rating: Math.max(1, Math.min(5, newTesti.rating)),
      quote: newTesti.quote.trim(),
    }).select("*").maybeSingle();
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    if (data) setTestimonials((ts) => [data, ...ts]);
    setNewTesti({ quote: "", rating: 5, location: "" });
    toast({ title: "Testimonial posted", description: "It now shows on the homepage." });
  };

  const deleteTestimonial = async (id: string) => {
    if (!confirm("Remove this testimonial?")) return;
    const { error } = await supabase.from("testimonials").delete().eq("id", id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    setTestimonials((ts) => ts.filter((t) => t.id !== id));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-5 py-20">
          <div className="animate-pulse space-y-4 max-w-xl">
            <div className="h-10 bg-muted rounded w-1/2" />
            <div className="h-40 bg-muted rounded-3xl" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  if (!user) return null;

  const initials = (profile?.full_name || user.email || "G")
    .split(" ").map((s) => s[0]).join("").slice(0, 2).toUpperCase();
  const totalSpent = orders.reduce((s, o) => s + Number(o.total_amount || 0), 0);
  const completed = orders.filter((o) => o.status === "completed").length;
  const joined = profile?.created_at ? new Date(profile.created_at) : null;

  return (
    <div className="min-h-screen bg-background">
      <Seo title="My Profile — Gadget360.ng" description="Manage your Gadget360 account, reviews and testimonials." canonical="/profile" />
      <Header />

      <section className="bg-gradient-warm border-b border-border/60 grain relative overflow-hidden">
        <div className="container mx-auto px-5 md:px-8 py-10 md:py-16">
          <div className="flex items-center justify-between text-[10px] md:text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-4">
            <span>My account</span>
            <span>{joined ? `Member since ${joined.getFullYear()}` : "Welcome"}</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-end gap-6 md:gap-10">
            <div className="relative">
              <div className="h-24 w-24 md:h-28 md:w-28 rounded-3xl overflow-hidden bg-foreground text-background grid place-items-center font-display font-bold text-4xl shadow-elegant ring-4 ring-background">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : initials}
              </div>
              <label className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-primary text-primary-foreground ring-2 ring-background grid place-items-center cursor-pointer hover:scale-105 transition">
                <Camera size={14} />
                <input type="file" accept="image/*" className="hidden" disabled={uploading}
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadAvatar(f); e.currentTarget.value = ""; }} />
              </label>
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="font-display font-bold text-4xl md:text-6xl leading-[0.95] tracking-tight">
                {profile?.full_name?.split(" ")[0] || "Hello"}<span className="text-primary">.</span>
              </h1>
              <p className="text-sm md:text-base text-muted-foreground mt-2 inline-flex items-center gap-2">
                <Mail size={14} /> {user.email}
              </p>
            </div>
            <Button onClick={async () => { await signOut(); navigate("/"); }} variant="outline" className="rounded-full h-11 px-5 border-foreground/30 gap-2 self-start md:self-end">
              <LogOut size={14} /> Sign Out
            </Button>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-5 md:px-8 py-8 md:py-12">
        {/* Stat bento */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8">
          <div className="rounded-2xl bg-cream text-cream-foreground p-4 md:p-5">
            <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Orders</div>
            <div className="font-display font-bold text-3xl md:text-4xl mt-2">{orders.length}</div>
          </div>
          <div className="rounded-2xl bg-foreground text-background p-4 md:p-5">
            <div className="text-[10px] uppercase tracking-[0.2em] opacity-60">Total spent</div>
            <div className="font-display font-bold text-2xl md:text-3xl mt-2 truncate">{formatNaira(totalSpent)}</div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4 md:p-5">
            <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Reviews</div>
            <div className="font-display font-bold text-3xl md:text-4xl mt-2">{reviews.length}</div>
          </div>
          <div className="rounded-2xl bg-whatsapp text-white p-4 md:p-5 relative overflow-hidden">
            <WhatsAppIcon size={64} className="absolute -right-3 -bottom-3 opacity-20" />
            <div className="text-[10px] uppercase tracking-[0.2em] opacity-80">Need help?</div>
            <a href={waGeneralUrl()} target="_blank" rel="noopener noreferrer" className="font-display font-bold text-lg md:text-xl mt-2 inline-flex items-center gap-1">
              Chat <ArrowUpRight size={16} />
            </a>
          </div>
        </div>

        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="rounded-full bg-muted h-12 p-1 flex flex-wrap">
            <TabsTrigger value="orders" className="rounded-full px-4 gap-1.5"><Package size={14} /> Orders</TabsTrigger>
            <TabsTrigger value="reviews" className="rounded-full px-4 gap-1.5"><Star size={14} /> Reviews</TabsTrigger>
            <TabsTrigger value="testimonials" className="rounded-full px-4 gap-1.5"><MessageSquareQuote size={14} /> Testimonials</TabsTrigger>
            <TabsTrigger value="profile" className="rounded-full px-4 gap-1.5"><User size={14} /> Details</TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="mt-2">
            {orders.length === 0 ? (
              <EmptyState icon={<ShoppingBag size={24} />} title="No orders yet" body="Start browsing — or order on WhatsApp." onPrimary={() => navigate("/shop")} primary="Browse products" />
            ) : (
              <div className="space-y-3">
                {orders.map((o) => (
                  <div key={o.id} className="rounded-2xl border border-border bg-card p-4 md:p-5 flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-muted grid place-items-center shrink-0">
                      <Package size={18} className="text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="font-mono">#{o.id.slice(0, 8)}</span>
                        <span>·</span>
                        <span className="inline-flex items-center gap-1"><Calendar size={11} />{new Date(o.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="font-display font-semibold text-base md:text-lg mt-0.5 truncate">{o.customer_name}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-display font-bold text-base md:text-lg">{formatNaira(Number(o.total_amount))}</div>
                      <Badge className={`mt-1 rounded-full text-[10px] capitalize ${statusTone[o.status] || "bg-muted text-foreground"}`}>
                        {o.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="reviews" className="mt-2">
            {reviews.length === 0 ? (
              <EmptyState icon={<Star size={24} />} title="No reviews yet" body="Bought something? Leave a review on its product page." onPrimary={() => navigate("/shop")} primary="Find products" />
            ) : (
              <div className="space-y-3">
                {reviews.map((r) => (
                  <div key={r.id} className="rounded-2xl border border-border bg-card p-4 md:p-5 flex items-start gap-4">
                    <Link to={r.product ? `/product/${r.product.id}` : "/shop"} className="h-16 w-16 rounded-xl bg-muted overflow-hidden shrink-0">
                      {r.product?.image_url ? <img src={r.product.image_url} alt="" className="w-full h-full object-contain p-1.5" /> : <div className="w-full h-full grid place-items-center text-muted-foreground"><Package size={20} /></div>}
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link to={r.product ? `/product/${r.product.id}` : "/shop"} className="font-display font-semibold hover:text-primary line-clamp-1">{r.product?.name || "Product"}</Link>
                      <div className="flex items-center gap-1 mt-1">
                        {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={12} className={i < r.rating ? "fill-primary text-primary" : "text-muted-foreground"} />)}
                        <span className="text-[11px] text-muted-foreground ml-1">{new Date(r.created_at).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-3">{r.comment}</p>
                    </div>
                    <Button onClick={() => deleteReview(r.id)} variant="ghost" size="icon" className="rounded-full text-destructive hover:bg-destructive/10 shrink-0">
                      <Trash2 size={16} />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="testimonials" className="mt-2 space-y-4">
            <div className="rounded-[28px] border border-border bg-card p-6 md:p-8">
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-primary mb-1">
                <Quote size={12} /> Live on homepage
              </div>
              <h2 className="font-display font-bold text-2xl md:text-3xl tracking-tight">Share your experience</h2>
              <p className="text-sm text-muted-foreground mt-1">Posts go live instantly on the homepage testimonials section.</p>
              <div className="grid sm:grid-cols-2 gap-3 mt-5">
                <Input value={newTesti.location} onChange={(e) => setNewTesti({ ...newTesti, location: e.target.value })} placeholder="City (e.g. Lagos)" className="h-11 rounded-xl" />
                <div className="flex items-center gap-1 h-11 px-4 rounded-xl border border-input bg-background">
                  <span className="text-xs text-muted-foreground mr-2">Rating</span>
                  {[1,2,3,4,5].map((n) => (
                    <button key={n} type="button" onClick={() => setNewTesti({ ...newTesti, rating: n })}>
                      <Star size={18} className={n <= newTesti.rating ? "fill-primary text-primary" : "text-muted-foreground"} />
                    </button>
                  ))}
                </div>
              </div>
              <Textarea value={newTesti.quote} onChange={(e) => setNewTesti({ ...newTesti, quote: e.target.value })}
                placeholder="What did you love about Gadget360?" rows={3} className="mt-3 rounded-xl" />
              <Button onClick={postTestimonial} className="mt-3 h-11 px-6 rounded-full bg-foreground text-background hover:bg-foreground/90 font-semibold">
                Post testimonial
              </Button>
            </div>

            {testimonials.length > 0 && (
              <div className="grid md:grid-cols-2 gap-3">
                {testimonials.map((t) => (
                  <div key={t.id} className="rounded-2xl border border-border bg-card p-5 relative">
                    <Quote className="absolute top-3 right-3 text-muted-foreground/30" size={20} />
                    <div className="flex items-center gap-1 mb-2">
                      {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={12} className={i < t.rating ? "fill-primary text-primary" : "text-muted-foreground"} />)}
                    </div>
                    <p className="text-sm leading-relaxed">{t.quote}</p>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                      <div className="text-xs text-muted-foreground">{t.location || "—"} · {new Date(t.created_at).toLocaleDateString()}</div>
                      <Button onClick={() => deleteTestimonial(t.id)} variant="ghost" size="icon" className="rounded-full h-8 w-8 text-destructive hover:bg-destructive/10">
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="profile" className="mt-2">
            <div className="rounded-[28px] border border-border bg-card p-6 md:p-8 max-w-2xl">
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-primary mb-1">
                <Pencil size={12} /> Personal info
              </div>
              <h2 className="font-display font-bold text-2xl md:text-3xl tracking-tight">Update your details</h2>
              <div className="grid sm:grid-cols-2 gap-4 mt-6">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1.5">Full name</label>
                  <Input value={profile?.full_name || ""} onChange={(e) => setProfile((p) => p ? { ...p, full_name: e.target.value } : p)} className="h-11 rounded-xl" placeholder="Your full name" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1.5">Email</label>
                  <Input value={user.email || ""} disabled className="h-11 rounded-xl bg-muted" />
                </div>
              </div>
              <Button onClick={updateProfile} disabled={updating} className="mt-5 h-11 px-6 rounded-full bg-foreground text-background hover:bg-foreground/90 font-semibold">
                {updating ? "Saving…" : "Save changes"}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
      <GeminiChat />
    </div>
  );
};

const EmptyState = ({ icon, title, body, onPrimary, primary }: any) => (
  <div className="rounded-[28px] border border-dashed border-border bg-card p-10 md:p-16 text-center">
    <div className="mx-auto h-16 w-16 rounded-2xl bg-muted grid place-items-center mb-4 text-muted-foreground">{icon}</div>
    <h3 className="font-display font-bold text-2xl">{title}</h3>
    <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">{body}</p>
    <div className="flex justify-center gap-2 mt-5">
      <Button onClick={onPrimary} className="h-11 rounded-full bg-foreground text-background hover:bg-foreground/90 px-5 font-semibold">{primary}</Button>
    </div>
  </div>
);

export default Profile;
