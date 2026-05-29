import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { User, Package, LogOut, ShoppingBag, Mail, Calendar, ArrowUpRight, Pencil } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GeminiChat from "@/components/GeminiChat";
import Seo from "@/components/Seo";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import { waGeneralUrl, formatNaira } from "@/lib/whatsapp";
import { Database } from "@/integrations/supabase/types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type Order = Database["public"]["Tables"]["orders"]["Row"];

const statusTone: Record<string, string> = {
  completed: "bg-success text-success-foreground",
  pending: "bg-cream text-cream-foreground",
  cancelled: "bg-destructive text-destructive-foreground",
};

const Profile = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) { navigate("/auth"); return; }
    loadProfileData();
  }, [user, navigate]);

  const loadProfileData = async () => {
    if (!user) return;
    try {
      const [{ data: p }, { data: o }] = await Promise.all([
        supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("orders").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      ]);
      if (p) setProfile(p);
      setOrders(o || []);
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
      <Seo title="My Profile — Gadget360.ng" description="Manage your Gadget360 account and order history." canonical="/profile" />
      <Header />

      {/* Editorial hero */}
      <section className="bg-gradient-warm border-b border-border/60 grain relative overflow-hidden">
        <div className="container mx-auto px-5 md:px-8 py-10 md:py-16">
          <div className="flex items-center justify-between text-[10px] md:text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-4">
            <span>My account</span>
            <span>{joined ? `Member since ${joined.getFullYear()}` : "Welcome"}</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-end gap-6 md:gap-10">
            <div className="relative">
              <div className="h-24 w-24 md:h-28 md:w-28 rounded-3xl bg-foreground text-background grid place-items-center font-display font-bold text-4xl shadow-elegant ring-4 ring-background">
                {initials}
              </div>
              <span className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-whatsapp ring-2 ring-background grid place-items-center">
                <WhatsAppIcon size={12} className="text-white" />
              </span>
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
          <div className="rounded-2xl bg-cream p-4 md:p-5">
            <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Orders</div>
            <div className="font-display font-bold text-3xl md:text-4xl mt-2">{orders.length}</div>
          </div>
          <div className="rounded-2xl bg-foreground text-background p-4 md:p-5">
            <div className="text-[10px] uppercase tracking-[0.2em] opacity-60">Total spent</div>
            <div className="font-display font-bold text-2xl md:text-3xl mt-2 truncate">{formatNaira(totalSpent)}</div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4 md:p-5">
            <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Completed</div>
            <div className="font-display font-bold text-3xl md:text-4xl mt-2">{completed}</div>
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
          <TabsList className="rounded-full bg-muted h-12 p-1">
            <TabsTrigger value="orders" className="rounded-full px-5 gap-2"><Package size={14} /> Orders</TabsTrigger>
            <TabsTrigger value="profile" className="rounded-full px-5 gap-2"><User size={14} /> Details</TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="mt-2">
            {orders.length === 0 ? (
              <div className="rounded-[28px] border border-dashed border-border bg-card p-10 md:p-16 text-center">
                <div className="mx-auto h-16 w-16 rounded-2xl bg-muted grid place-items-center mb-4">
                  <ShoppingBag size={24} className="text-muted-foreground" />
                </div>
                <h3 className="font-display font-bold text-2xl">No orders yet</h3>
                <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
                  Start browsing — and remember, you can also order on WhatsApp for instant help.
                </p>
                <div className="flex justify-center gap-2 mt-5">
                  <Button onClick={() => navigate("/shop")} className="h-11 rounded-full bg-foreground text-background hover:bg-foreground/90 px-5 font-semibold">
                    Browse products
                  </Button>
                  <a href={waGeneralUrl()} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="h-11 rounded-full border-foreground/30 px-5 gap-2">
                      <WhatsAppIcon size={14} /> WhatsApp
                    </Button>
                  </a>
                </div>
              </div>
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

          <TabsContent value="profile" className="mt-2">
            <div className="rounded-[28px] border border-border bg-card p-6 md:p-8 max-w-2xl">
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-primary mb-1">
                <Pencil size={12} /> Personal info
              </div>
              <h2 className="font-display font-bold text-2xl md:text-3xl tracking-tight">Update your details</h2>
              <div className="grid sm:grid-cols-2 gap-4 mt-6">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1.5">Full name</label>
                  <Input
                    value={profile?.full_name || ""}
                    onChange={(e) => setProfile((p) => p ? { ...p, full_name: e.target.value } : p)}
                    className="h-11 rounded-xl"
                    placeholder="Your full name"
                  />
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

export default Profile;
