import { useEffect } from "react";
import type { QueryClient } from "@tanstack/react-query";
import { QueryClientProvider } from "@tanstack/react-query";
import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  Scripts,
  useRouter,
  Link,
} from "@tanstack/react-router";
import { HelmetProvider } from "react-helmet-async";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import PageViewTracker from "@/components/PageViewTracker";
import WhatsAppClickTracker from "@/components/WhatsAppClickTracker";
import AbandonedCartNudge from "@/components/AbandonedCartNudge";

import { reportLovableError } from "@/lib/lovable-error-reporting";
import appCss from "../styles.css?url";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1.0, viewport-fit=cover" },
      { name: "theme-color", content: "#C9252C" },
      { title: "Gadget360.ng — Authentic Gadgets in Lagos | Buy, Sell, Swap" },
      {
        name: "description",
        content:
          "Shop authentic smartphones, laptops, gaming consoles & accessories in Lagos. New & UK used gadgets with warranty. WhatsApp +234 810 841 8727 for orders.",
      },
      { name: "author", content: "Gadget360.ng" },
      { name: "google-site-verification", content: "google076161d0bf0c8edb" },
      {
        name: "keywords",
        content:
          "gadgets lagos, buy iphone lagos, laptops nigeria, ps5 nigeria, uk used phones, gadget360",
      },
      { name: "robots", content: "index, follow, max-image-preview:large" },
      { property: "og:title", content: "Gadget360.ng — Authentic Gadgets in Lagos" },
      {
        property: "og:description",
        content: "Shop authentic smartphones, laptops, gaming consoles & accessories in Lagos.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://gadgets360.ng/" },
      { property: "og:site_name", content: "Gadget360.ng" },
      { property: "og:locale", content: "en_NG" },
      { property: "og:image", content: "https://gadgets360.ng/og-image.jpg" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      {
        property: "og:image:alt",
        content: "Gadget360.ng — authentic phones, laptops and consoles in Lagos",
      },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Gadget360.ng — Authentic Gadgets in Lagos" },
      {
        name: "twitter:description",
        content: "Shop authentic smartphones, laptops, gaming consoles & accessories in Lagos.",
      },
      { name: "twitter:image", content: "https://gadgets360.ng/og-image.jpg" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.png", type: "image/png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,600;12..96,700;12..96,800&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap",
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          name: "Gadget360.ng",
          image: "https://gadgets360.ng/og-image.jpg",
          url: "https://gadgets360.ng",
          telephone: "+2348108418727",
          priceRange: "₦₦",
          address: {
            "@type": "PostalAddress",
            addressLocality: "Lagos",
            addressCountry: "NG",
          },
          sameAs: ["https://www.facebook.com/share/1AFDYyR6RC/"],
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundRoute,
  errorComponent: RootErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <PageViewTracker />
            <WhatsAppClickTracker />
            <AbandonedCartNudge />
            <Outlet />

          </TooltipProvider>
        </AuthProvider>
      </HelmetProvider>
    </QueryClientProvider>
  );
}

function NotFoundRoute() {
  return (
    <div className="min-h-screen grid place-items-center bg-background px-6 text-center">
      <div>
        <h1 className="font-display text-5xl font-bold mb-2">404</h1>
        <p className="text-muted-foreground mb-6">This page doesn't exist.</p>
        <Link
          to="/"
          className="inline-flex h-11 items-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}

function RootErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  console.error(error);

  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="min-h-screen grid place-items-center bg-background px-6 text-center">
      <div className="max-w-md">
        <h1 className="font-display text-2xl font-bold mb-2 text-foreground">
          This page didn't load
        </h1>
        <p className="text-muted-foreground mb-6 text-sm">
          Something went wrong on our end. Try again, or head back to the homepage.
        </p>
        <div className="flex flex-wrap gap-2 justify-center">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex h-11 items-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground"
          >
            Try again
          </button>
          <Link
            to="/"
            className="inline-flex h-11 items-center rounded-full border border-border px-6 text-sm font-semibold text-foreground"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
