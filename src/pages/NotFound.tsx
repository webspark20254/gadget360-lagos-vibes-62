import { useLocation, Link } from "@/lib/router-compat";
import { useEffect } from "react";
import Seo from "@/components/Seo";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Seo
        title="Page Not Found (404) — Gadget360.ng"
        description="The page you're looking for doesn't exist on Gadget360.ng. Head back to the home page or browse our shop for authentic gadgets in Lagos."
        canonical="/404"
      />
      <main className="text-center px-6">
        <h1 className="font-display font-bold text-6xl md:text-8xl tracking-tight mb-3">404</h1>
        <p className="text-lg text-muted-foreground mb-6">We couldn't find that page.</p>
        <Link to="/" className="inline-flex h-11 px-6 items-center rounded-full bg-foreground text-background text-sm font-semibold hover:bg-foreground/90">
          Return home
        </Link>
      </main>
    </div>
  );
};

export default NotFound;
