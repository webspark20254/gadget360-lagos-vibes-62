import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Activity, Eye, TrendingUp, Users } from "lucide-react";
import type { ReactNode } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Line, LineChart } from "recharts";

type Row = { created_at: string; path: string; session_id: string | null; country?: string | null; country_code?: string | null; city?: string | null };

const startOfDay = (d: Date) => { const x = new Date(d); x.setHours(0,0,0,0); return x; };
const fmtDay = (d: Date) => d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
const fmtWeek = (d: Date) => `W${Math.ceil(((+d - +new Date(d.getFullYear(),0,1)) / 86400000 + 1) / 7)}`;
const fmtMonth = (d: Date) => d.toLocaleDateString(undefined, { month: "short", year: "2-digit" });

const AnalyticsPanel = () => {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const since = new Date(); since.setDate(since.getDate() - 90);
    const { data } = await supabase
      .from("page_visits")
      .select("created_at, path, session_id, country, country_code, city")
      .gte("created_at", since.toISOString())
      .order("created_at", { ascending: true })
      .limit(5000);
    setRows((data as Row[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
    const ch = supabase
      .channel("admin-visits")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "page_visits" }, (payload) => {
        setRows((r) => [...r, payload.new as Row].slice(-5000));
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

  const Stat = ({ icon, label, value, accent }: { icon: ReactNode; label: string; value: number; accent: string }) => (
    <div className={`rounded-2xl p-5 ${accent}`}>
      <div className="flex items-center justify-between">
        <div className="text-[10px] uppercase tracking-[0.2em] opacity-70">{label}</div>
        {icon}
      </div>
      <div className="font-display font-bold text-3xl mt-2 tabular-nums">{value.toLocaleString()}</div>
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
    </div>
  );
};

export default AnalyticsPanel;
