import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
      const { data, error: fnErr } = await supabase.functions.invoke("adminsuper-login", {
        body: { password },
      });
      if (fnErr || !data?.token_hash) {
        setError(data?.error || fnErr?.message || "Invalid password");
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
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <Lock className="w-10 h-10 mx-auto text-primary mb-3" />
          <CardTitle>Admin Access</CardTitle>
          <CardDescription>Enter the admin password to continue.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="password"
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
    </div>
  );
};

export default AdminSuper;
