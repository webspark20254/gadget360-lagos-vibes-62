import { Phone, Mail, MapPin } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const Footer = () => {
  return (
    <footer className="bg-foreground text-background">
      <div className="container mx-auto px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <img src="/favicon.png" alt="Gadget360.ng" className="h-8 w-8 rounded-md" />
              <span className="font-display font-bold text-lg tracking-tight">Gadget360<span className="text-primary-glow">.ng</span></span>
            </div>
            <p className="text-background/60 text-sm leading-relaxed">
              Your trusted gadget store in Lagos. Authentic products, warranty available. Buy · Sell · Swap.
            </p>
            <div className="flex gap-2">
              {[
                { href: "https://www.facebook.com/share/1AFDYyR6RC/?mibextid=wwXIfr", src: "/lovable-uploads/4b216da9-22ab-450e-acb1-bb3dbc10b238.png", alt: "Facebook" },
                { href: "https://www.instagram.com/gadget360ngbackuppage", src: "/lovable-uploads/cbe3d69a-9a8d-4e4c-84f8-857386f55748.png", alt: "Instagram" },
                { href: "https://wa.me/2347067894474", src: "/lovable-uploads/c9fd8577-52ae-4feb-bdf2-503f9e458bdc.png", alt: "WhatsApp" },
                { href: "https://www.threads.net/@gadget360.ng", src: "/lovable-uploads/0cd8ddce-afe1-47f0-91b5-776628bb7751.png", alt: "Threads" },
              ].map((s) => (
                <a key={s.alt} href={s.href} target="_blank" rel="noopener noreferrer"
                  className="h-9 w-9 grid place-items-center rounded-full bg-background/10 hover:bg-primary transition-colors">
                  <img src={s.src} className="w-4 h-4" alt={s.alt} />
                </a>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-[11px] uppercase tracking-[0.2em] text-background/50">Visit us</h3>
            <div className="space-y-2 text-sm text-background/75">
              <div className="flex items-start gap-2"><MapPin size={14} className="mt-0.5 shrink-0" /><span>24 Adegbola Street, Ikeja, Lagos</span></div>
              <div className="flex items-start gap-2"><MapPin size={14} className="mt-0.5 shrink-0" /><span>8 Oshitelu Street, Computer Village, Ikeja</span></div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-[11px] uppercase tracking-[0.2em] text-background/50">Shop</h3>
            <div className="space-y-2 text-sm">
              <a href="/shop" className="block text-background/75 hover:text-primary-glow transition-colors">All Products</a>
              <a href="/shop?category=Phones" className="block text-background/75 hover:text-primary-glow transition-colors">Smartphones</a>
              <a href="/shop?category=Laptops" className="block text-background/75 hover:text-primary-glow transition-colors">Laptops</a>
              <a href="/shop?category=Apple" className="block text-background/75 hover:text-primary-glow transition-colors">Apple</a>
              <a href="/shop?category=Consoles%20%26%20Games" className="block text-background/75 hover:text-primary-glow transition-colors">Consoles & Games</a>
              <a href="/contact" className="block text-background/75 hover:text-primary-glow transition-colors">Contact</a>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-[11px] uppercase tracking-[0.2em] text-background/50">Get in touch</h3>
            <div className="space-y-2 text-sm">
              <a href="tel:+2347067894474" className="flex items-center gap-2 text-background/75 hover:text-primary-glow transition-colors"><Phone size={14} /> +234 706 789 4474</a>
              <a href="tel:+2348108418727" className="flex items-center gap-2 text-background/75 hover:text-primary-glow transition-colors"><Phone size={14} /> +234 810 841 8727</a>
              <a href="mailto:gadget360ng@gmail.com" className="flex items-center gap-2 text-background/75 hover:text-primary-glow transition-colors"><Mail size={14} /> gadget360ng@gmail.com</a>
            </div>
            <a href="https://wa.me/2347067894474" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center justify-center h-10 px-5 mt-2 rounded-full bg-whatsapp hover:bg-whatsapp/90 text-white text-xs font-medium transition-colors">
              WhatsApp Us
            </a>
          </div>
        </div>

        <Separator className="my-10 bg-background/10" />

        <div className="flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-background/50">
          <p>© 2026 Gadget360.ng — All rights reserved.</p>
          <div className="flex gap-5">
            <span>Privacy</span><span>Terms</span><span>Returns & Warranty</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
