import { useState } from "react";
import { useNavigate } from "@/lib/router-compat";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Lock } from "lucide-react";

const AdminSuper = () => {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      // Clear any stale session first — a stale/expired user JWT on the
      // Authorization header can cause the gateway to reject the invoke
      // before it ever reaches the edge function (non-2xx on first try,
      // works after refresh / in incognito).
      try { await supabase.auth.signOut({ scope: "local" } as any); } catch {}

      // Call the edge function via raw fetch so we control the headers
      // exactly (anon key only, no stale bearer token).
      const SUPABASE_URL = "https://yasicaakzqqhmtgscbhg.supabase.co";
      const ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlhc2ljYWFrenFxaG10Z3NjYmhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyOTY4OTUsImV4cCI6MjA3MTg3Mjg5NX0.Fv_WBq_pw46OwE6tT3kTCzIqtgMSSO_pqaXBh8CTxrU";

      const res = await fetch(`${SUPABASE_URL}/functions/v1/adminsuper-login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: ANON,
          Authorization: `Bearer ${ANON}`,
        },
        body: JSON.stringify({ password }),
      });

      let data: any = null;
      try { data = await res.json(); } catch {}

      if (!res.ok || !data?.token_hash) {
        setError(data?.error || (res.status === 401 ? "Invalid password" : `Login failed (${res.status})`));
        setLoading(false);
        return;
      }

      const { error: otpErr } = await supabase.auth.verifyOtp({
        type: "magiclink",
        token_hash: data.token_hash,
      });
      if (otpErr) {
        setError(otpErr.message);
        setLoading(false);
        return;
      }
      navigate("/admin", { replace: true });
    } catch (err: any) {
      setError(err?.message || "Something went wrong");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <meta name="robots" content="noindex,nofollow" />
      <main className="max-w-md w-full">
      <Card className="w-full">
        <CardHeader className="text-center">
          <Lock className="w-10 h-10 mx-auto text-primary mb-3" />
          <CardTitle>Admin Access</CardTitle>
          <CardDescription>Enter the admin password to continue.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="password"
              aria-label="Admin password"
              autoComplete="current-password"
              placeholder="Admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              required
            />
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full" disabled={loading || !password}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Unlock Admin
            </Button>
          </form>
        </CardContent>
      </Card>
      </main>
    </div>
  );
};

export default AdminSuper;
