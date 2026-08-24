import { useEffect } from "react";
import { useLocation } from "@/lib/router-compat";
import { trackPageView } from "@/lib/analytics";

const PageViewTracker = () => {
  const loc = useLocation();
  useEffect(() => {
    // Don't track admin views as "site traffic"
    if (loc.pathname.startsWith("/admin")) return;
    trackPageView(loc.pathname + loc.search);
  }, [loc.pathname, loc.search]);
  return null;
};

export default PageViewTracker;
