import type { ReactNode } from "react";
import { Link } from "@/lib/router-compat";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import { Button } from "@/components/ui/button";
import { waGeneralUrl } from "@/lib/whatsapp";
import { ChevronRight } from "lucide-react";
import { LEGAL_PAGES, LAST_UPDATED } from "@/lib/legal";


interface LegalLayoutProps {
  title: string;
  kicker: string;
  intro: string;
  seoTitle: string;
  seoDescription: string;
  canonical: string;
  children: ReactNode;
}

const LegalLayout = ({
  title,
  kicker,
  intro,
  seoTitle,
  seoDescription,
  canonical,
  children,
}: LegalLayoutProps) => (
  <div className="min-h-screen bg-background">
    <Seo
      title={seoTitle}
      description={seoDescription}
      canonical={canonical}
      jsonLd={{
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: title,
        description: seoDescription,
        url: `https://gadgets360.ng${canonical}`,
        publisher: { "@type": "Organization", name: "Gadget360.ng" },
        dateModified: "2026-08-26",
      }}
    />
    <Header />

    {/* Editorial masthead — same scale language as the rest of the site */}
    <section className="border-b border-border/60 bg-cream text-cream-foreground">
      <div className="container mx-auto px-5 md:px-8 py-12 md:py-20">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-5">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight size={12} />
          <span className="text-foreground/70">{kicker}</span>
        </nav>
        <h1 className="font-display font-bold text-[38px] sm:text-[56px] md:text-[76px] leading-[0.92] tracking-[-0.035em] max-w-4xl">
          {title}
        </h1>
        <p className="mt-5 max-w-2xl text-sm md:text-base text-muted-foreground leading-relaxed">{intro}</p>
        <p className="mt-4 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          Last updated · {LAST_UPDATED}
        </p>
      </div>
    </section>

    <div className="container mx-auto px-5 md:px-8 py-12 md:py-16">
      <div className="grid lg:grid-cols-[220px_1fr] gap-10 lg:gap-16">
        {/* Sibling policy nav */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <h2 className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-3">Policies</h2>
          <div className="flex flex-wrap lg:flex-col gap-1.5">
            {LEGAL_PAGES.map((p) => (
              <Link
                key={p.to}
                to={p.to}
                className="px-3 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                {p.label}
              </Link>
            ))}
          </div>
        </aside>

        <article className="max-w-3xl space-y-8 text-[15px] leading-relaxed text-foreground/85 [&_h2]:font-display [&_h2]:font-bold [&_h2]:text-2xl [&_h2]:md:text-3xl [&_h2]:tracking-tight [&_h2]:text-foreground [&_h2]:mb-3 [&_h3]:font-semibold [&_h3]:text-base [&_h3]:text-foreground [&_h3]:mb-1.5 [&_ul]:space-y-2 [&_ul]:pl-5 [&_ul]:list-disc [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2">
          {children}

          <div className="rounded-3xl border border-border bg-card p-6 md:p-8">
            <h2 className="!mb-2">Questions about this policy?</h2>
            <p className="text-sm text-muted-foreground mb-5">
              Talk to a real person at Gadget360.ng — we reply on WhatsApp during store hours, or you can
              reach us from the <Link to="/contact">contact page</Link>.
            </p>
            <a href={waGeneralUrl("I have a question about your store policies.")} target="_blank" rel="noopener noreferrer">
              <Button className="h-12 px-6 rounded-full bg-whatsapp hover:bg-whatsapp/90 text-white font-semibold gap-2">
                <WhatsAppIcon size={16} /> Ask on WhatsApp
              </Button>
            </a>
          </div>
        </article>
      </div>
    </div>

    <Footer />
  </div>
);

export default LegalLayout;
