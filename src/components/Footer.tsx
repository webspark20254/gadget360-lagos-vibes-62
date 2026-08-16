import { Phone, Mail, MapPin, ArrowUpRight } from "lucide-react";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import BrandLogo from "@/components/BrandLogo";


const Footer = () => (
  <footer className="bg-ink text-ink-foreground relative overflow-hidden">
    <div className="container mx-auto px-5 md:px-8 py-16 md:py-24">
      {/* Huge brand mark */}
      <div className="mb-12 md:mb-20">
        <div className="font-display font-bold text-[64px] sm:text-[120px] md:text-[200px] leading-[0.85] tracking-[-0.05em]">
          Gadget<span className="font-serif-display text-primary">360</span>
        </div>
        <div className="font-serif-display text-primary-glow text-2xl md:text-4xl -mt-2 md:-mt-6">.ng</div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-10">
        <div className="col-span-2 space-y-4">
          <div className="flex items-center gap-2.5">
            <BrandLogo size={44} variant="dark" />
            <span className="font-display font-bold text-lg tracking-tight">Gadget360<span className="font-serif-display text-primary-glow">.ng</span></span>
          </div>

          <p className="text-ink-foreground/60 text-sm leading-relaxed max-w-sm">
            Your trusted gadget plug in Lagos. Authentic phones, laptops, consoles & accessories — buy, sell, swap with warranty.
          </p>
          <div className="flex gap-2 pt-2">
            {[
              { href: "https://www.facebook.com/share/1AFDYyR6RC/?mibextid=wwXIfr", src: "/lovable-uploads/4b216da9-22ab-450e-acb1-bb3dbc10b238.png", alt: "Follow Gadget360.ng on Facebook" },
              { href: "https://www.instagram.com/gadget360ngbackuppage", src: "/lovable-uploads/cbe3d69a-9a8d-4e4c-84f8-857386f55748.png", alt: "Follow Gadget360.ng on Instagram" },
              { href: "https://wa.me/2348108418727", src: "/lovable-uploads/c9fd8577-52ae-4feb-bdf2-503f9e458bdc.png", alt: "Chat with Gadget360.ng on WhatsApp" },
              { href: "https://www.threads.net/@gadget360.ng", src: "/lovable-uploads/0cd8ddce-afe1-47f0-91b5-776628bb7751.png", alt: "Follow Gadget360.ng on Threads" },
            ].map((s) => (
              <a key={s.alt} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.alt}
                className="h-10 w-10 grid place-items-center rounded-full bg-ink-foreground/10 hover:bg-primary transition-colors">
                <img src={s.src} className="w-4 h-4" alt={s.alt} />
              </a>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-[11px] uppercase tracking-[0.2em] text-ink-foreground/50">Visit</h3>
          <div className="space-y-2.5 text-sm text-ink-foreground/75">
            <div className="flex items-start gap-2"><MapPin size={14} className="mt-0.5 shrink-0" /><span>24 Adegbola St, Ikeja, Lagos</span></div>
            <div className="flex items-start gap-2"><MapPin size={14} className="mt-0.5 shrink-0" /><span>8 Oshitelu St, Computer Village</span></div>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-[11px] uppercase tracking-[0.2em] text-ink-foreground/50">Reach us</h3>
          <div className="space-y-2.5 text-sm">
            <a href="tel:+2347067894474" className="flex items-center gap-2 text-ink-foreground/75 hover:text-primary-glow transition-colors"><Phone size={14} /> +234 706 789 4474</a>
            <a href="tel:+2348108418727" className="flex items-center gap-2 text-ink-foreground/75 hover:text-primary-glow transition-colors"><Phone size={14} /> +234 810 841 8727</a>
            <a href="mailto:gadget360ng@gmail.com" className="flex items-center gap-2 text-ink-foreground/75 hover:text-primary-glow transition-colors"><Mail size={14} /> gadget360ng@gmail.com</a>
          </div>
          <a href="https://wa.me/2348108418727" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 h-10 px-4 mt-3 rounded-full bg-whatsapp hover:bg-whatsapp/90 text-white text-xs font-semibold transition-colors">
            <WhatsAppIcon size={13} /> WhatsApp Us <ArrowUpRight size={14} />
          </a>

        </div>
      </div>

      <div className="mt-14 pt-6 border-t border-ink-foreground/15 flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-ink-foreground/50">
        <p>© 2026 Gadget360.ng — All rights reserved.</p>
        <div className="flex gap-5"><span>Privacy</span><span>Terms</span><span>Returns & Warranty</span></div>
      </div>
    </div>
  </footer>
);

export default Footer;
