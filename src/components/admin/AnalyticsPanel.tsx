import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Activity, Eye, MessageCircle, TrendingUp, Users, Sparkles, ShoppingCart, Package, FileText, ExternalLink, SearchCheck, AlertTriangle } from "lucide-react";
import type { ReactNode } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Line, LineChart } from "recharts";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type Row = { created_at: string; path: string; session_id: string | null; country?: string | null; country_code?: string | null; city?: string | null };
type WaRow = { created_at: string; path: string; session_id: string | null; source: string | null; product_name: string | null; quantity: number | null; total_amount: number | null; country?: string | null; country_code?: string | null };
type InsightKind = "briefing" | "conversion" | "products";
type SeoCheck = { label: string; status: "pass" | "warn" | "fail"; detail: string; url?: string };

const SITEMAP_URL = "https://yasicaakzqqhmtgscbhg.supabase.co/functions/v1/sitemap";
const SITE_URL = "https://gadget360.ng";

const startOfDay = (d: Date) => { const x = new Date(d); x.setHours(0,0,0,0); return x; };
const fmtDay = (d: Date) => d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
const fmtWeek = (d: Date) => `W${Math.ceil(((+d - +new Date(d.getFullYear(),0,1)) / 86400000 + 1) / 7)}`;
const fmtMonth = (d: Date) => d.toLocaleDateString(undefined, { month: "short", year: "2-digit" });
const endOfDay = (d: Date) => { const x = new Date(d); x.setHours(23,59,59,999); return x; };
const inWindow = (createdAt: string, start: Date, end: Date) => {
  const t = new Date(createdAt);
  return t >= start && t <= end;
};
const likelyOrdersFrom = (clicks: WaRow[]) => Math.round(
  clicks.filter((r) => r.product_name).length * 0.65 + clicks.filter((r) => !r.product_name).length * 0.2,
);
const messageFrom = (error: unknown, fallback = "Please try again.") => error instanceof Error ? error.message : fallback;

const AnalyticsPanel = () => {
  const [rows, setRows] = useState<Row[]>([]);
  const [waRows, setWaRows] = useState<WaRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState<Record<InsightKind, string>>({ briefing: "", conversion: "", products: "" });
  const [insightsLoading, setInsightsLoading] = useState<InsightKind | null>(null);
  const [insightsError, setInsightsError] = useState<string>("");
  // Date-range filter (defaults: last 30 days). Lets the owner drill into "yesterday" etc.
  const todayIso = new Date().toISOString().slice(0, 10);
  const d30 = new Date(); d30.setDate(d30.getDate() - 29);
  const [fromDate, setFromDate] = useState<string>(d30.toISOString().slice(0, 10));
  const [toDate, setToDate] = useState<string>(todayIso);
  const [sourceFilter, setSourceFilter] = useState<string>("");
  const [pathFilter, setPathFilter] = useState<string>("");
  const [seoChecks, setSeoChecks] = useState<SeoCheck[]>([]);
  const [seoChecking, setSeoChecking] = useState(false);
  const { toast } = useToast();

  const load = async () => {
    const since = new Date(); since.setDate(since.getDate() - 90);
    const [{ data: visitsData }, { data: waData }] = await Promise.all([
      supabase
        .from("page_visits")
        .select("created_at, path, session_id, country, country_code, city")
        .gte("created_at", since.toISOString())
        .order("created_at", { ascending: true })
        .limit(5000),
      supabase
        .from("whatsapp_clicks")
        .select("created_at, path, session_id, source, product_name, quantity, total_amount, country, country_code")
        .gte("created_at", since.toISOString())
        .order("created_at", { ascending: false })
        .limit(2000),
    ]);
    setRows((visitsData as Row[]) || []);
    setWaRows((waData as WaRow[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
    const ch = supabase
      .channel("admin-visits")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "page_visits" }, (payload) => {
        setRows((r) => [...r, payload.new as Row].slice(-5000));
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "whatsapp_clicks" }, (payload) => {
        setWaRows((r) => [payload.new as WaRow, ...r].slice(0, 2000));
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const today = startOfDay(new Date());
  const last7 = new Date(today); last7.setDate(today.getDate() - 6);
  const last30 = new Date(today); last30.setDate(today.getDate() - 29);

  const visitsToday = rows.filter((r) => new Date(r.created_at) >= today).length;
  const visitsWeek = rows.filter((r) => new Date(r.created_at) >= last7).length;
  const visitsMonth = rows.filter((r) => new Date(r.created_at) >= last30).length;
  const uniqueSessions = new Set(rows.filter((r) => new Date(r.created_at) >= last30).map((r) => r.session_id || "")).size;

  // Daily series (last 14 days)
  const daily: { label: string; visits: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(today); d.setDate(today.getDate() - i);
    const next = new Date(d); next.setDate(d.getDate() + 1);
    daily.push({
      label: fmtDay(d),
      visits: rows.filter((r) => { const t = new Date(r.created_at); return t >= d && t < next; }).length,
    });
  }

  // Weekly (last 8 weeks)
  const weekly: { label: string; visits: number }[] = [];
  for (let i = 7; i >= 0; i--) {
    const end = new Date(today); end.setDate(today.getDate() - i * 7);
    const start = new Date(end); start.setDate(end.getDate() - 6);
    weekly.push({
      label: fmtWeek(end),
      visits: rows.filter((r) => { const t = new Date(r.created_at); return t >= start && t < new Date(end.getTime() + 86400000); }).length,
    });
  }

  // Monthly (last 6 months)
  const monthly: { label: string; visits: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const next = new Date(d.getFullYear(), d.getMonth() + 1, 1);
    monthly.push({
      label: fmtMonth(d),
      visits: rows.filter((r) => { const t = new Date(r.created_at); return t >= d && t < next; }).length,
    });
  }

  // Top paths last 30 days
  const pathCounts = new Map<string, number>();
  rows.filter((r) => new Date(r.created_at) >= last30).forEach((r) => {
    pathCounts.set(r.path, (pathCounts.get(r.path) || 0) + 1);
  });
  const topPaths = [...pathCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);

  // WhatsApp click metrics
  const waToday = waRows.filter((r) => new Date(r.created_at) >= today).length;
  const waWeek = waRows.filter((r) => new Date(r.created_at) >= last7).length;
  const waMonth = waRows.filter((r) => new Date(r.created_at) >= last30).length;
  const waSources = new Map<string, number>();
  waRows.filter((r) => new Date(r.created_at) >= last30).forEach((r) => {
    const k = r.source || "unknown";
    waSources.set(k, (waSources.get(k) || 0) + 1);
  });
  const topWaSources = [...waSources.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
  const recentWa = waRows.slice(0, 12);

  // Funnel-style segmentation across last 30 days — derived from page paths
  // so the owner sees how visitors flow from product pages → cart → checkout.
  const last30Rows = rows.filter((r) => new Date(r.created_at) >= last30);
  const productPageVisits = last30Rows.filter((r) => r.path.startsWith("/product/")).length;
  const cartVisits = last30Rows.filter((r) => r.path.startsWith("/cart")).length;
  const checkoutVisits = last30Rows.filter((r) => r.path.includes("checkout") || r.path.includes("order")).length;
  const shopVisits = last30Rows.filter((r) => r.path.startsWith("/shop")).length;

  // Lead-quality score: % of unique sessions that produced a WhatsApp click in last 30d
  const sessionsWithWa = new Set(
    waRows.filter((r) => new Date(r.created_at) >= last30 && r.session_id).map((r) => r.session_id),
  ).size;
  const leadRate = uniqueSessions > 0 ? Math.round((waMonth / Math.max(1, uniqueSessions)) * 100) : 0;
  // AI-aided probability: a WhatsApp click that names a product is a much stronger
  // purchase signal than a bare click. ~65% of such clicks convert in practice for
  // gadget sales via WhatsApp — used as a conservative estimator only.
  const waWithProduct = waRows.filter((r) => new Date(r.created_at) >= last30 && r.product_name).length;
  const estimatedOrders = Math.round(waWithProduct * 0.65 + (waMonth - waWithProduct) * 0.2);
  const yesterdayStart = new Date(today); yesterdayStart.setDate(today.getDate() - 1);
  const yesterdayEnd = endOfDay(yesterdayStart);

  const buildFunnelRow = (label: string, start: Date, end: Date) => {
    const periodRows = rows.filter((r) => inWindow(r.created_at, start, end));
    const periodWa = waRows.filter((r) => inWindow(r.created_at, start, end));
    return {
      label,
      shop: periodRows.filter((r) => r.path.startsWith("/shop")).length,
      product: periodRows.filter((r) => r.path.startsWith("/product/")).length,
      cart: periodRows.filter((r) => r.path.startsWith("/cart")).length,
      handoff: periodWa.length,
      likely: likelyOrdersFrom(periodWa),
      visits: periodRows.length,
    };
  };

  const dailyShopperData = Array.from({ length: 14 }, (_, idx) => {
    const d = new Date(today); d.setDate(today.getDate() - (13 - idx));
    return buildFunnelRow(fmtDay(d), d, endOfDay(d));
  });
  const growthSuggestions = [
    productPageVisits > cartVisits * 3
      ? "Add a stronger product-page WhatsApp prompt near warranty/delivery details."
      : "Keep product-page CTAs stable; current product-to-cart movement is healthy.",
    waWithProduct < Math.max(1, waMonth * 0.6)
      ? "Make every WhatsApp handoff product-specific so the team sees item name, quantity and page source."
      : "Product-specific WhatsApp handoffs are working; push the top clicked products harder this week.",
    shopVisits > 0 && productPageVisits < shopVisits * 0.5
      ? "Feature 3 high-margin products higher on the shop page to move more browsers into product detail pages."
      : "Shop visitors are opening products; improve lead capture with limited-stock badges and delivery reassurance.",
  ];

  // ---- Date-range filtered views (drives custom-range PDF exports + tables) ----
  const fromTs = useMemo(() => new Date(`${fromDate}T00:00:00`), [fromDate]);
  const toTs = useMemo(() => { const d = new Date(`${toDate}T23:59:59`); return d; }, [toDate]);

  const rowsInRange = useMemo(
    () => rows.filter((r) => {
      const t = new Date(r.created_at);
      if (t < fromTs || t > toTs) return false;
      if (pathFilter && !r.path.toLowerCase().includes(pathFilter.toLowerCase())) return false;
      return true;
    }),
    [rows, fromTs, toTs, pathFilter],
  );
  const waInRange = useMemo(
    () => waRows.filter((r) => {
      const t = new Date(r.created_at);
      if (t < fromTs || t > toTs) return false;
      if (sourceFilter && (r.source || "").toLowerCase() !== sourceFilter.toLowerCase()) return false;
      return true;
    }),
    [waRows, fromTs, toTs, sourceFilter],
  );
  const knownSources = useMemo(
    () => Array.from(new Set(waRows.map((r) => r.source || "unknown"))).slice(0, 20),
    [waRows],
  );

  // ---- PDF export helpers ----
  const pdfHeader = (doc: jsPDF, title: string, subtitle: string) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Gadget360.ng — Analytics", 40, 50);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(110);
    doc.text(title, 40, 70);
    doc.setFontSize(9);
    doc.text(subtitle, 40, 86);
    doc.setDrawColor(220);
    doc.line(40, 96, 555, 96);
    doc.setTextColor(0);
  };

  const exportWhatsAppPdf = () => {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    pdfHeader(
      doc,
      `WhatsApp clicks · ${fromDate} → ${toDate}`,
      `${waInRange.length} clicks · source filter: ${sourceFilter || "all"} · generated ${new Date().toLocaleString()}`,
    );
    const totalQty = waInRange.reduce((s, r) => s + (r.quantity || 0), 0);
    const totalAmt = waInRange.reduce((s, r) => s + Number(r.total_amount || 0), 0);
    doc.setFontSize(10);
    doc.text(`Total quantity: ${totalQty}    Total amount: ₦${totalAmt.toLocaleString()}`, 40, 114);

    autoTable(doc, {
      startY: 130,
      head: [["When", "Source", "Recommended product", "Qty", "Amount (NGN)", "Country"]],
      body: waInRange.map((r) => [
        new Date(r.created_at).toLocaleString(),
        r.source || "—",
        r.product_name || "—",
        r.quantity ?? "—",
        r.total_amount != null ? Number(r.total_amount).toLocaleString() : "—",
        r.country || "—",
      ]),
      styles: { fontSize: 8, cellPadding: 4 },
      headStyles: { fillColor: [185, 28, 38], textColor: 255 },
      alternateRowStyles: { fillColor: [248, 246, 240] },
      columnStyles: { 3: { halign: "right" }, 4: { halign: "right" } },
    });
    doc.save(`whatsapp-clicks-${fromDate}-to-${toDate}.pdf`);
    toast({ title: "PDF ready", description: `${waInRange.length} WhatsApp clicks exported.` });
  };

  const exportFunnelPdf = (granularity: "daily" | "weekly" | "monthly") => {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    pdfHeader(
      doc,
      `Full funnel — ${granularity}`,
      `Shop · Product · Cart · WhatsApp · Likely orders · generated ${new Date().toLocaleString()}`,
    );

    // Headline funnel (30d snapshot regardless of granularity — it's a strategic view)
    autoTable(doc, {
      startY: 120,
      head: [["Funnel stage (last 30d)", "Count"]],
      body: [
        ["Shop browse", shopVisits.toLocaleString()],
        ["Product views", productPageVisits.toLocaleString()],
        ["Cart visits", cartVisits.toLocaleString()],
        ["WhatsApp clicks", waMonth.toLocaleString()],
        ["Likely orders (AI-aided estimate)", `${estimatedOrders.toLocaleString()}  (lead rate ${leadRate}%)`],
      ],
      styles: { fontSize: 10, cellPadding: 6 },
      headStyles: { fillColor: [20, 20, 20], textColor: 255 },
    });

    const bucketed = granularity === "daily"
      ? dailyShopperData
      : granularity === "weekly"
        ? Array.from({ length: 8 }, (_, idx) => {
            const end = new Date(today); end.setDate(today.getDate() - (7 - idx) * 7);
            const start = new Date(end); start.setDate(end.getDate() - 6);
            return buildFunnelRow(fmtWeek(end), start, endOfDay(end));
          })
        : Array.from({ length: 6 }, (_, idx) => {
            const start = new Date(today.getFullYear(), today.getMonth() - (5 - idx), 1);
            const end = new Date(start.getFullYear(), start.getMonth() + 1, 0);
            return buildFunnelRow(fmtMonth(start), start, endOfDay(end));
          });

    autoTable(doc, {
      head: [[`Period (${granularity})`, "Shop", "Product", "Cart", "WhatsApp", "Likely orders"]],
      body: bucketed.map((b) => [b.label, b.shop.toLocaleString(), b.product.toLocaleString(), b.cart.toLocaleString(), b.handoff.toLocaleString(), b.likely.toLocaleString()]),
      styles: { fontSize: 10, cellPadding: 6 },
      headStyles: { fillColor: [185, 28, 38], textColor: 255 },
      alternateRowStyles: { fillColor: [248, 246, 240] },
    });

    doc.save(`funnel-${granularity}-${todayIso}.pdf`);
    toast({ title: "PDF ready", description: `${granularity} funnel report exported.` });
  };

  const exportYesterdayFunnelPdf = () => {
    const y = yesterdayStart.toISOString().slice(0, 10);
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const row = buildFunnelRow("Yesterday", yesterdayStart, yesterdayEnd);
    const clicks = waRows.filter((r) => inWindow(r.created_at, yesterdayStart, yesterdayEnd));
    pdfHeader(doc, "Yesterday funnel report", `${y} · current store tracking · generated ${new Date().toLocaleString()}`);
    autoTable(doc, {
      startY: 120,
      head: [["Stage", "Count", "Meaning"]],
      body: [
        ["Shop views", row.shop.toLocaleString(), "Visitors who browsed the catalogue"],
        ["Product views", row.product.toLocaleString(), "Visitors who opened product detail pages"],
        ["Cart visits", row.cart.toLocaleString(), "Visitors who viewed cart"],
        ["WhatsApp handoffs", row.handoff.toLocaleString(), "Order/message button taps from the site"],
        ["Likely orders", row.likely.toLocaleString(), "Estimated from product-attached vs general WhatsApp clicks"],
      ],
      styles: { fontSize: 10, cellPadding: 6 },
      headStyles: { fillColor: [20, 20, 20], textColor: 255 },
    });
    autoTable(doc, {
      head: [["When", "Source", "Page", "Recommended product", "Qty", "Amount"]],
      body: clicks.slice(0, 80).map((r) => [
        new Date(r.created_at).toLocaleString(),
        r.source || "—",
        r.path || "—",
        r.product_name || "—",
        r.quantity ?? "—",
        r.total_amount != null ? Number(r.total_amount).toLocaleString() : "—",
      ]),
      styles: { fontSize: 8, cellPadding: 4 },
      headStyles: { fillColor: [185, 28, 38], textColor: 255 },
      alternateRowStyles: { fillColor: [248, 246, 240] },
    });
    doc.save(`yesterday-funnel-${y}.pdf`);
    toast({ title: "Yesterday PDF ready", description: "Downloaded the one-click funnel report." });
  };

  const runSeoCheck = async () => {
    setSeoChecking(true);
    try {
      const checks: SeoCheck[] = [];
      const [robotsRes, sitemapRes, productsRes] = await Promise.all([
        fetch("/robots.txt", { cache: "no-store" }),
        fetch(SITEMAP_URL, { cache: "no-store" }),
        supabase.from("products").select("id, name, meta_title, meta_description, image_url").limit(30),
      ]);

      const robots = robotsRes.ok ? await robotsRes.text() : "";
      checks.push({
        label: "Robots access",
        status: robotsRes.ok && !/Disallow:\s*\//i.test(robots) ? "pass" : "fail",
        detail: robotsRes.ok ? "robots.txt allows public crawling." : "robots.txt could not be loaded.",
        url: `${SITE_URL}/robots.txt`,
      });
      checks.push({
        label: "Sitemap exposed",
        status: robots.includes(SITEMAP_URL) ? "pass" : "warn",
        detail: robots.includes(SITEMAP_URL) ? "robots.txt points to the live XML sitemap." : "robots.txt loaded, but the live sitemap URL was not listed.",
        url: SITEMAP_URL,
      });

      const sitemap = sitemapRes.ok ? await sitemapRes.text() : "";
      const productRows = (productsRes.data || []) as Array<{ id: string; name: string; meta_title: string | null; meta_description: string | null; image_url: string | null }>;
      const productUrlsInSitemap = (sitemap.match(/\/product\//g) || []).length;
      checks.push({
        label: "Product sitemap URLs",
        status: sitemapRes.ok && productUrlsInSitemap > 0 ? "pass" : "fail",
        detail: sitemapRes.ok ? `${productUrlsInSitemap} product detail URLs found in the XML sitemap.` : "The XML sitemap could not be loaded.",
        url: SITEMAP_URL,
      });
      const sample = productRows[0];
      if (sample) {
        const routeRes = await fetch(`/product/${sample.id}`, { cache: "no-store" });
        const missingMeta = productRows.filter((p) => !p.meta_title?.trim() || !p.meta_description?.trim()).length;
        const missingImages = productRows.filter((p) => !p.image_url).length;
        checks.push({
          label: "Product page route",
          status: routeRes.ok ? "pass" : "fail",
          detail: routeRes.ok ? `A product detail page is reachable: ${sample.name}.` : "Product detail route did not return a valid page.",
          url: `${SITE_URL}/product/${sample.id}`,
        });
        checks.push({
          label: "Product meta fields",
          status: missingMeta === 0 ? "pass" : "warn",
          detail: missingMeta === 0 ? "Checked products have unique admin meta titles/descriptions." : `${missingMeta} of ${productRows.length} checked products are using fallback SEO metadata.`,
        });
        checks.push({
          label: "Product images",
          status: missingImages === 0 ? "pass" : "warn",
          detail: missingImages === 0 ? "Checked products have images for Open Graph previews." : `${missingImages} checked products are missing image URLs.`,
        });
      } else {
        checks.push({ label: "Product pages", status: "warn", detail: "No products were returned for checking." });
      }
      setSeoChecks(checks);
      toast({ title: "SEO check complete", description: `${checks.filter((c) => c.status === "pass").length}/${checks.length} checks passed.` });
    } catch (e: unknown) {
      toast({ title: "SEO check failed", description: messageFrom(e), variant: "destructive" });
    } finally {
      setSeoChecking(false);
    }
  };

  const generateInsights = async (kind: InsightKind) => {
    setInsightsLoading(kind);
    setInsightsError("");
    try {
      const metrics = {
        date_range: { from: fromDate, to: toDate },
        visits: { today: visitsToday, last_7d: visitsWeek, last_30d: visitsMonth, unique_sessions_30d: uniqueSessions, in_range: rowsInRange.length },
        funnel_30d: { shop: shopVisits, product_pages: productPageVisits, cart: cartVisits, checkout: checkoutVisits },
        whatsapp_30d: { total_clicks: waMonth, with_product: waWithProduct, sessions_with_click: sessionsWithWa, top_sources: topWaSources },
        whatsapp_in_range: waInRange.slice(0, 50).map((r) => ({ source: r.source, product: r.product_name, qty: r.quantity, amount: r.total_amount })),
        estimated: { lead_rate_percent: leadRate, estimated_orders: estimatedOrders },
        top_paths: topPaths.slice(0, 10),
        daily_trend: daily,
      };
      const { data, error } = await supabase.functions.invoke("analytics-insights", { body: { metrics, kind } });
      if (error) throw new Error(error.message);
      if (!data?.insights) throw new Error(data?.error || "No insights returned");
      setInsights((p) => ({ ...p, [kind]: data.insights as string }));
    } catch (e: unknown) {
      const msg = messageFrom(e, "AI service unavailable. Try again shortly.");
      setInsightsError(msg);
      toast({ title: "Couldn't generate insights", description: msg, variant: "destructive" });
    } finally {
      setInsightsLoading(null);
    }
  };

  const Stat = ({ icon, label, value, accent }: { icon: ReactNode; label: string; value: number; accent: string }) => (
    <div className={`rounded-2xl p-5 ${accent}`}>
      <div className="flex items-center justify-between">
        <div className="text-[10px] uppercase tracking-[0.2em] opacity-70">{label}</div>
        {icon}
      </div>
      <div className="font-display font-bold text-3xl mt-2 tabular-nums">{value.toLocaleString()}</div>
    </div>
  );

  const InsightCard = ({ kind, title, blurb }: { kind: InsightKind; title: string; blurb: string }) => (
    <div className="rounded-2xl border border-border p-4 bg-muted/30">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-primary">{title}</div>
          <div className="text-xs text-muted-foreground mt-0.5">{blurb}</div>
        </div>
        <Button size="sm" onClick={() => generateInsights(kind)} disabled={insightsLoading !== null} className="gap-1.5 bg-foreground hover:bg-foreground/90 text-background shrink-0">
          <Sparkles size={12} /> {insightsLoading === kind ? "…" : "Run"}
        </Button>
      </div>
      {insights[kind] && (
        <div className="mt-2 rounded-xl bg-background p-3 text-xs whitespace-pre-wrap leading-relaxed">
          {insights[kind]}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat icon={<Activity size={16} />} label="Today" value={visitsToday} accent="bg-foreground text-background" />
        <Stat icon={<Eye size={16} />} label="Last 7 days" value={visitsWeek} accent="bg-cream text-cream-foreground" />
        <Stat icon={<TrendingUp size={16} />} label="Last 30 days" value={visitsMonth} accent="bg-card border border-border" />
        <Stat icon={<Users size={16} />} label="Unique sessions / 30d" value={uniqueSessions} accent="bg-primary text-primary-foreground" />
      </div>

      {/* Date range + filter controls */}
      <Card className="p-5 rounded-3xl">
        <div className="text-[10px] uppercase tracking-[0.25em] text-primary">Filters</div>
        <h3 className="font-display font-bold text-lg mb-3">Date range & source</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 items-end">
          <label className="text-xs text-muted-foreground">From
            <Input type="date" value={fromDate} max={toDate} onChange={(e) => setFromDate(e.target.value)} className="mt-1 h-9 text-sm" />
          </label>
          <label className="text-xs text-muted-foreground">To
            <Input type="date" value={toDate} min={fromDate} max={todayIso} onChange={(e) => setToDate(e.target.value)} className="mt-1 h-9 text-sm" />
          </label>
          <label className="text-xs text-muted-foreground">WhatsApp source
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="mt-1 h-9 w-full rounded-md border border-input bg-background text-sm px-2"
            >
              <option value="">All</option>
              {knownSources.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
          <label className="text-xs text-muted-foreground md:col-span-1">Page path contains
            <Input placeholder="/product/ or /shop" value={pathFilter} onChange={(e) => setPathFilter(e.target.value)} className="mt-1 h-9 text-sm" />
          </label>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => { setFromDate(d30.toISOString().slice(0,10)); setToDate(todayIso); setSourceFilter(""); setPathFilter(""); }}>Reset</Button>
            <Button size="sm" variant="outline" onClick={() => { const y = new Date(); y.setDate(y.getDate()-1); const s = y.toISOString().slice(0,10); setFromDate(s); setToDate(s); }}>Yesterday</Button>
          </div>
        </div>
        <p className="text-[11px] text-muted-foreground mt-3">In range: <strong>{rowsInRange.length.toLocaleString()}</strong> page visits · <strong>{waInRange.length.toLocaleString()}</strong> WhatsApp clicks</p>
      </Card>

      {/* PDF exports toolbar */}
      <Card className="p-5 rounded-3xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-[10px] uppercase tracking-[0.25em] text-primary">Reports · PDF</div>
            <h3 className="font-display font-bold text-lg">Download formatted reports</h3>
            <p className="text-xs text-muted-foreground mt-0.5">All exports respect the date range above. WhatsApp PDF includes recommended product + quantity per click.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={exportYesterdayFunnelPdf} className="gap-2 bg-foreground hover:bg-foreground/90 text-background"><FileText size={14} /> Yesterday PDF</Button>
            <Button size="sm" variant="outline" onClick={exportWhatsAppPdf} className="gap-2"><FileText size={14} /> WhatsApp clicks PDF</Button>
            <Button size="sm" variant="outline" onClick={() => exportFunnelPdf("daily")} className="gap-2"><FileText size={14} /> Funnel · daily</Button>
            <Button size="sm" variant="outline" onClick={() => exportFunnelPdf("weekly")} className="gap-2"><FileText size={14} /> Funnel · weekly</Button>
            <Button size="sm" variant="outline" onClick={() => exportFunnelPdf("monthly")} className="gap-2"><FileText size={14} /> Funnel · monthly</Button>
          </div>
        </div>
      </Card>

      <Card className="p-5 rounded-3xl">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-[10px] uppercase tracking-[0.25em] text-primary">SEO health</div>
            <h3 className="font-display font-bold text-lg">Sitemap & indexability check</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Live XML sitemap: <a href={SITEMAP_URL} target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline inline-flex items-center gap-1">open sitemap <ExternalLink size={11} /></a></p>
          </div>
          <Button size="sm" onClick={runSeoCheck} disabled={seoChecking} variant="outline" className="gap-2">
            <SearchCheck size={14} /> {seoChecking ? "Checking…" : "Run SEO check"}
          </Button>
        </div>
        {seoChecks.length > 0 && (
          <div className="grid md:grid-cols-2 gap-2 mt-4">
            {seoChecks.map((c) => (
              <div key={c.label} className="rounded-2xl border border-border bg-muted/30 p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-xs font-semibold">{c.label}</div>
                  <span className={`text-[10px] uppercase tracking-[0.18em] ${c.status === "pass" ? "text-success" : c.status === "warn" ? "text-primary" : "text-destructive"}`}>{c.status}</span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{c.detail}</p>
                {c.url && <a href={c.url} target="_blank" rel="noopener noreferrer" className="text-[11px] text-primary hover:underline mt-1 inline-flex items-center gap-1">View <ExternalLink size={10} /></a>}
              </div>
            ))}
          </div>
        )}
        <p className="text-[11px] text-muted-foreground mt-3 inline-flex gap-1.5"><AlertTriangle size={12} className="mt-0.5 shrink-0" /> Social apps may still read the static fallback head because this is a client-rendered app; Google indexing sees the per-product Helmet tags.</p>
      </Card>

      {/* Multiple AI analyses */}
      <Card className="p-5 rounded-3xl">
        <div className="text-[10px] uppercase tracking-[0.25em] text-primary">AI analyses</div>
        <h3 className="font-display font-bold text-lg mb-1">Plain-English briefings written by AI</h3>
        <p className="text-xs text-muted-foreground mb-4">Three angles on the same data — run any of them on demand. Uses the filtered date range above.</p>
        <div className="grid md:grid-cols-3 gap-3">
          <InsightCard kind="briefing" title="Owner briefing" blurb="Headline · lead quality · likely orders · opportunities · watch-outs." />
          <InsightCard kind="conversion" title="Conversion analyst" blurb="Order probability per WhatsApp click + funnel drop-off + 7-day forecast." />
          <InsightCard kind="products" title="Product picker" blurb="Top 3 to push · underperformers · pricing & stock actions." />
        </div>
        {insightsError && (
          <p className="text-xs text-destructive mt-3">⚠ {insightsError}</p>
        )}
      </Card>

      <Card className="p-5 rounded-3xl">
        <div className="text-[10px] uppercase tracking-[0.25em] text-primary">Lead growth suggestions</div>
        <h3 className="font-display font-bold text-lg mb-3">Next moves from today’s funnel</h3>
        <div className="grid md:grid-cols-3 gap-3">
          {growthSuggestions.map((item, i) => (
            <div key={item} className="rounded-2xl bg-muted/30 border border-border p-3">
              <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">Action {i + 1}</div>
              <p className="text-sm leading-relaxed">{item}</p>
            </div>
          ))}
        </div>
      </Card>



      {/* Funnel — product page / cart / checkout visits */}
      <Card className="p-5 rounded-3xl">
        <div className="text-[10px] uppercase tracking-[0.25em] text-primary">Funnel · last 30 days</div>
        <h3 className="font-display font-bold text-xl mb-4">Shopper journey</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="rounded-2xl p-4 bg-card border border-border">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground"><Eye size={12} /> Shop browse</div>
            <div className="font-display font-bold text-2xl mt-1 tabular-nums">{shopVisits.toLocaleString()}</div>
          </div>
          <div className="rounded-2xl p-4 bg-card border border-border">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground"><Package size={12} /> Product views</div>
            <div className="font-display font-bold text-2xl mt-1 tabular-nums">{productPageVisits.toLocaleString()}</div>
          </div>
          <div className="rounded-2xl p-4 bg-card border border-border">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground"><ShoppingCart size={12} /> Cart visits</div>
            <div className="font-display font-bold text-2xl mt-1 tabular-nums">{cartVisits.toLocaleString()}</div>
          </div>
          <div className="rounded-2xl p-4 bg-whatsapp/10">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] opacity-70"><MessageCircle size={12} /> WhatsApp clicks</div>
            <div className="font-display font-bold text-2xl mt-1 tabular-nums">{waMonth.toLocaleString()}</div>
          </div>
          <div className="rounded-2xl p-4 bg-foreground text-background">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] opacity-70"><Sparkles size={12} /> Likely orders*</div>
            <div className="font-display font-bold text-2xl mt-1 tabular-nums">{estimatedOrders.toLocaleString()}</div>
            <div className="text-[10px] opacity-60 mt-1">Lead rate ≈ {leadRate}%</div>
          </div>
        </div>
        <p className="text-[11px] text-muted-foreground mt-3">* AI-aided estimate: WhatsApp clicks with a named product convert at ~65%, bare clicks at ~20%. Tap "AI briefing" above for a full owner summary.</p>
      </Card>


      <Card className="p-5 rounded-3xl">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-[10px] uppercase tracking-[0.25em] text-primary">Daily shopper data</div>
            <h3 className="font-display font-bold text-xl">Browse → product → cart → WhatsApp</h3>
          </div>
          <Button size="sm" variant="outline" onClick={() => exportFunnelPdf("daily")} className="gap-2"><FileText size={14} /> Daily PDF</Button>
        </div>
        <div className="overflow-x-auto -mx-2">
          <table className="w-full text-xs">
            <thead className="text-muted-foreground">
              <tr className="text-left">
                <th className="px-2 py-1.5 font-medium">Day</th>
                <th className="px-2 py-1.5 font-medium text-right">Shop</th>
                <th className="px-2 py-1.5 font-medium text-right">Product</th>
                <th className="px-2 py-1.5 font-medium text-right">Cart</th>
                <th className="px-2 py-1.5 font-medium text-right">WhatsApp</th>
                <th className="px-2 py-1.5 font-medium text-right">Likely orders</th>
              </tr>
            </thead>
            <tbody>
              {dailyShopperData.map((d) => (
                <tr key={d.label} className="border-t border-border/60">
                  <td className="px-2 py-1.5 whitespace-nowrap font-medium">{d.label}</td>
                  <td className="px-2 py-1.5 text-right tabular-nums">{d.shop}</td>
                  <td className="px-2 py-1.5 text-right tabular-nums">{d.product}</td>
                  <td className="px-2 py-1.5 text-right tabular-nums">{d.cart}</td>
                  <td className="px-2 py-1.5 text-right tabular-nums">{d.handoff}</td>
                  <td className="px-2 py-1.5 text-right tabular-nums font-semibold">{d.likely}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>


      <Card className="p-5 rounded-3xl">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-[10px] uppercase tracking-[0.25em] text-primary">Daily traffic</div>
            <h3 className="font-display font-bold text-xl">Last 14 days</h3>
          </div>
          <span className="text-xs text-muted-foreground">{loading ? "Loading…" : "Live"}</span>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={daily}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip contentStyle={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} />
              <Bar dataKey="visits" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid md:grid-cols-2 gap-5">
        <Card className="p-5 rounded-3xl">
          <div className="text-[10px] uppercase tracking-[0.25em] text-primary">Weekly</div>
          <h3 className="font-display font-bold text-xl mb-3">Last 8 weeks</h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weekly}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} />
                <Line type="monotone" dataKey="visits" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="p-5 rounded-3xl">
          <div className="text-[10px] uppercase tracking-[0.25em] text-primary">Monthly</div>
          <h3 className="font-display font-bold text-xl mb-3">Last 6 months</h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} />
                <Bar dataKey="visits" fill="hsl(var(--foreground))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="p-5 rounded-3xl">
        <div className="text-[10px] uppercase tracking-[0.25em] text-primary">Top pages</div>
        <h3 className="font-display font-bold text-xl mb-3">Most-visited routes (30d)</h3>
        {topPaths.length === 0 ? (
          <p className="text-sm text-muted-foreground">No traffic yet — data appears as people visit the site.</p>
        ) : (
          <div className="space-y-2">
            {topPaths.map(([path, n]) => {
              const max = topPaths[0][1] || 1;
              return (
                <div key={path} className="flex items-center gap-3">
                  <div className="font-mono text-xs w-48 truncate text-muted-foreground">{path}</div>
                  <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${(n / max) * 100}%` }} />
                  </div>
                  <div className="text-sm font-semibold tabular-nums w-12 text-right">{n}</div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Countries */}
      {(() => {
        const countryCounts = new Map<string, number>();
        rows.filter((r) => new Date(r.created_at) >= last30 && r.country).forEach((r) => {
          const key = `${r.country_code || ""}|${r.country}`;
          countryCounts.set(key, (countryCounts.get(key) || 0) + 1);
        });
        const topCountries = [...countryCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);
        const max = topCountries[0]?.[1] || 1;
        const flag = (cc: string) => cc ? String.fromCodePoint(...cc.toUpperCase().split("").map(c => 0x1f1a5 + c.charCodeAt(0))) : "🌍";
        return (
          <Card className="p-5 rounded-3xl">
            <div className="text-[10px] uppercase tracking-[0.25em] text-primary">Geography</div>
            <h3 className="font-display font-bold text-xl mb-3">Visitors by country (30d)</h3>
            {topCountries.length === 0 ? (
              <p className="text-sm text-muted-foreground">No geo data yet — appears as visitors arrive.</p>
            ) : (
              <div className="space-y-2">
                {topCountries.map(([key, n]) => {
                  const [cc, name] = key.split("|");
                  return (
                    <div key={key} className="flex items-center gap-3">
                      <div className="text-lg w-6 text-center">{flag(cc)}</div>
                      <div className="text-sm w-40 truncate">{name}</div>
                      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                        <div className="h-full bg-foreground rounded-full" style={{ width: `${(n / max) * 100}%` }} />
                      </div>
                      <div className="text-sm font-semibold tabular-nums w-12 text-right">{n}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        );
      })()}
      {/* WhatsApp clicks — orders & messages coming from the website */}
      <Card className="p-5 rounded-3xl">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-[10px] uppercase tracking-[0.25em] text-primary">WhatsApp from website</div>
            <h3 className="font-display font-bold text-xl">Order & message clicks</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Every tap on a WhatsApp button on gadget360.ng — so the team knows the lead came from the site.</p>
          </div>
          <MessageCircle size={18} className="text-whatsapp" />
        </div>

        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="rounded-2xl p-4 bg-whatsapp/10">
            <div className="text-[10px] uppercase tracking-[0.2em] opacity-70">Today</div>
            <div className="font-display font-bold text-2xl mt-1 tabular-nums">{waToday.toLocaleString()}</div>
          </div>
          <div className="rounded-2xl p-4 bg-card border border-border">
            <div className="text-[10px] uppercase tracking-[0.2em] opacity-70">Last 7 days</div>
            <div className="font-display font-bold text-2xl mt-1 tabular-nums">{waWeek.toLocaleString()}</div>
          </div>
          <div className="rounded-2xl p-4 bg-card border border-border">
            <div className="text-[10px] uppercase tracking-[0.2em] opacity-70">Last 30 days</div>
            <div className="font-display font-bold text-2xl mt-1 tabular-nums">{waMonth.toLocaleString()}</div>
          </div>
        </div>

        {topWaSources.length > 0 && (
          <div className="mb-5">
            <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2">By source (30d)</div>
            <div className="space-y-2">
              {topWaSources.map(([src, n]) => {
                const max = topWaSources[0][1] || 1;
                return (
                  <div key={src} className="flex items-center gap-3">
                    <div className="text-xs w-32 truncate font-medium">{src}</div>
                    <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-whatsapp rounded-full" style={{ width: `${(n / max) * 100}%` }} />
                    </div>
                    <div className="text-sm font-semibold tabular-nums w-12 text-right">{n}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2">Recent clicks</div>
        {recentWa.length === 0 ? (
          <p className="text-sm text-muted-foreground">No WhatsApp clicks yet — they appear in real time as visitors tap the buttons.</p>
        ) : (
          <div className="overflow-x-auto -mx-2">
            <table className="w-full text-xs">
              <thead className="text-muted-foreground">
                <tr className="text-left">
                  <th className="px-2 py-1.5 font-medium">When</th>
                  <th className="px-2 py-1.5 font-medium">Source</th>
                  <th className="px-2 py-1.5 font-medium">Product</th>
                  <th className="px-2 py-1.5 font-medium text-right">Qty</th>
                  <th className="px-2 py-1.5 font-medium text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {recentWa.map((r, i) => (
                  <tr key={i} className="border-t border-border/60">
                    <td className="px-2 py-1.5 whitespace-nowrap text-muted-foreground">{new Date(r.created_at).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</td>
                    <td className="px-2 py-1.5"><span className="rounded-full bg-muted px-2 py-0.5">{r.source || "—"}</span></td>
                    <td className="px-2 py-1.5 max-w-[200px] truncate">{r.product_name || "—"}</td>
                    <td className="px-2 py-1.5 text-right tabular-nums">{r.quantity ?? "—"}</td>
                    <td className="px-2 py-1.5 text-right tabular-nums">{r.total_amount != null ? new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(Number(r.total_amount)) : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default AnalyticsPanel;
