import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CheckCircle2, Loader2, MailWarning, ShoppingBag, MessageCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

/**
 * Landing page that Supabase's confirmation email links to.
 * By the time this page mounts, the Supabase client (with detectSessionInUrl)
 * has already parsed the token in the URL hash and established the session.
 */
const Welcome = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");
  const [name, setName] = useState<string>("");

  useEffect(() => {
    let mounted = true;
    const check = async () => {
      // Give the SDK a moment to finish parsing the URL hash
      await new Promise((r) => setTimeout(r, 400));
      const { data, error } = await supabase.auth.getSession();
      if (!mounted) return;
      if (error || !data.session) {
        setStatus("error");
        return;
      }
      setName(
        (data.session.user.user_metadata?.full_name as string)?.split(" ")[0] ||
          data.session.user.email?.split("@")[0] ||
          "",
      );
      setStatus("ok");
      // Clean the hash from the URL bar
      if (window.location.hash) {
        window.history.replaceState(null, "", window.location.pathname);
      }
    };
    void check();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Welcome to Gadget360.ng — Account Confirmed"
        description="Your Gadget360.ng account is now active. Start shopping authentic phones, laptops and gadgets with fast delivery across Nigeria."
        canonical="/welcome"
      />
      <Header />

      <main className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-2xl mx-auto text-center">
          {status === "loading" && (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-muted-foreground">Confirming your account…</p>
            </div>
          )}

          {status === "ok" && (
            <>
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-6">
                <CheckCircle2 className="h-9 w-9 text-primary" />
              </div>
              <h1 className="text-3xl md:text-5xl font-semibold tracking-tight mb-4">
                {name ? `Welcome, ${name} 👋` : "Welcome to Gadget360.ng"}
              </h1>
              <p className="text-base md:text-lg text-muted-foreground mb-8">
                Your email is confirmed and your account is ready. You now have
                access to faster checkout, order tracking, saved carts and
                priority WhatsApp support from our Lagos team.
              </p>

              <div className="grid sm:grid-cols-2 gap-3 max-w-md mx-auto mb-10">
                <Button asChild size="lg" className="rounded-full h-12">
                  <Link to="/shop">
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    Start shopping
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="rounded-full h-12">
                  <a
                    href="https://wa.me/2348108418727?text=Hi%20Gadget360%2C%20I%20just%20signed%20up%20on%20the%20website."
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Chat on WhatsApp
                  </a>
                </Button>
              </div>

              <div className="rounded-2xl border bg-card/50 p-6 text-left text-sm text-muted-foreground">
                <p className="font-medium text-foreground mb-2">A quick note from our team</p>
                <p>
                  Every product we sell is authentic and inspected before it
                  leaves our Lagos office. If anything ever feels off — a price,
                  a delivery estimate, a product photo — reply to any order on
                  WhatsApp and a real person will sort it out. Thanks for
                  trusting us.
                </p>
              </div>
            </>
          )}

          {status === "error" && (
            <>
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 mb-6">
                <MailWarning className="h-9 w-9 text-destructive" />
              </div>
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">
                This confirmation link didn't work
              </h1>
              <p className="text-muted-foreground mb-8">
                It may have expired or already been used. Sign in to continue,
                or request a new confirmation email from the sign-up page.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={() => navigate("/auth")} size="lg" className="rounded-full h-12">
                  Go to sign in
                </Button>
                <Button asChild size="lg" variant="outline" className="rounded-full h-12">
                  <a href="https://wa.me/2348108418727?text=Hi%20Gadget360%2C%20my%20confirmation%20link%20didn%27t%20work.">
                    Contact support
                  </a>
                </Button>
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Welcome;
