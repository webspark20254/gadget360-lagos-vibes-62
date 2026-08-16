import { useState } from "react";
import { MapPin, Phone, Mail, Clock, Send, ArrowUpRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GeminiChat from "@/components/GeminiChat";
import Seo from "@/components/Seo";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { waGeneralUrl } from "@/lib/whatsapp";

const Contact = () => {
  const [formData, setFormData] = useState({ name: "", phone: "", email: "", message: "", preferredContact: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      toast({ title: "Message sent!", description: "We'll reply within 24 hours. For faster response, WhatsApp +234 810 841 8727." });
      setFormData({ name: "", phone: "", email: "", message: "", preferredContact: "" });
      setIsSubmitting(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Contact Gadget360.ng — Lagos Stores, WhatsApp & Phone"
        description="Visit Gadget360.ng in Ikeja and Computer Village, Lagos. Call +234 810 841 8727 or WhatsApp for instant help with phones, laptops, consoles and accessories."
        canonical="/contact"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          name: "Gadget360.ng",
          image: "https://gadgets360.ng/og-image.jpg",
          telephone: "+2348108418727",
          email: "gadget360ng@gmail.com",
          url: "https://gadgets360.ng/contact",
          priceRange: "₦₦",
          address: [
            { "@type": "PostalAddress", streetAddress: "24 Adegbola Street, Opposite Railway Line", addressLocality: "Ikeja", addressRegion: "Lagos", addressCountry: "NG" },
            { "@type": "PostalAddress", streetAddress: "8 Oshitelu Street, Opposite GT Bank, Computer Village", addressLocality: "Ikeja", addressRegion: "Lagos", addressCountry: "NG" },
          ],
          openingHoursSpecification: [{ "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"], opens: "09:00", closes: "19:00" }],
        }}
      />
      <Header />

      {/* Editorial hero */}
      <section className="bg-gradient-warm border-b border-border/60 grain relative overflow-hidden">
        <div className="container mx-auto px-5 md:px-8 py-12 md:py-24">
          <div className="flex items-center justify-between text-[10px] md:text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-4">
            <span>Get in touch</span>
            <span>Ikeja · Lagos</span>
          </div>
          <h1 className="font-display font-bold text-[40px] sm:text-6xl md:text-8xl leading-[0.95] tracking-tight max-w-4xl">
            Talk to the <span className="font-serif-display text-primary">humans</span> behind Gadget360.
          </h1>
          <p className="text-sm md:text-base text-muted-foreground mt-4 max-w-xl">
            Drop into our Lagos stores, send a message, or skip the queue — WhatsApp us and a real person replies in under 5 minutes.
          </p>
          <div className="flex flex-wrap gap-2 mt-6">
            <a href={waGeneralUrl()} target="_blank" rel="noopener noreferrer">
              <Button className="h-11 px-5 rounded-full bg-whatsapp hover:bg-whatsapp/90 text-white text-sm font-medium gap-2">
                <WhatsAppIcon size={15} /> WhatsApp +234 810 841 8727
              </Button>
            </a>
            <a href="tel:+2348108418727">
              <Button variant="outline" className="h-11 px-5 rounded-full border-foreground/30 hover:bg-foreground hover:text-background text-sm font-medium gap-2">
                <Phone size={14} /> Call us
              </Button>
            </a>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-5 md:px-8 py-10 md:py-16">
        {/* Bento grid */}
        <div className="grid md:grid-cols-12 gap-4 md:gap-5 mb-12">
          {/* Stores */}
          <div className="md:col-span-7 rounded-[28px] border border-border bg-card p-6 md:p-8">
            <div className="text-[11px] uppercase tracking-[0.25em] text-primary mb-3">Visit us</div>
            <h2 className="font-display font-bold text-2xl md:text-4xl tracking-tight mb-6">Two Lagos stores. <span className="font-serif-display">Walk in.</span></h2>
            <div className="grid sm:grid-cols-2 gap-5">
              <div className="rounded-2xl bg-muted/40 p-5">
                <MapPin className="text-primary mb-3" size={18} />
                <h3 className="font-display font-semibold text-base mb-1">Adegbola Main</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">24 Adegbola Street<br/>Opp. Railway Line<br/>Ikeja, Lagos</p>
                <a href="tel:+2348108418727" className="inline-flex items-center gap-1 text-xs font-medium text-primary mt-3 hover:underline">Call <ArrowUpRight size={12} /></a>
              </div>
              <div className="rounded-2xl bg-muted/40 p-5">
                <MapPin className="text-primary mb-3" size={18} />
                <h3 className="font-display font-semibold text-base mb-1">Computer Village</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">8 Oshitelu Street<br/>Opp. GT Bank<br/>Computer Village, Ikeja</p>
                <a href="tel:+2347067894474" className="inline-flex items-center gap-1 text-xs font-medium text-primary mt-3 hover:underline">Call <ArrowUpRight size={12} /></a>
              </div>
            </div>
          </div>

          {/* WhatsApp card */}
          <div className="md:col-span-5 rounded-[28px] bg-whatsapp text-white p-6 md:p-8 relative overflow-hidden">
            <WhatsAppIcon size={180} className="absolute -right-10 -bottom-10 opacity-15" />
            <div className="text-[11px] uppercase tracking-[0.25em] opacity-80 mb-3">Instant help</div>
            <h2 className="font-display font-bold text-2xl md:text-4xl leading-tight">WhatsApp us — replies in &lt; 5 min.</h2>
            <p className="text-sm opacity-90 mt-3 max-w-xs">Quotes, stock checks, swaps and orders. Real humans, no bots.</p>
            <a href={waGeneralUrl()} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 mt-5 h-11 px-5 rounded-full bg-white text-whatsapp text-sm font-semibold">
              <WhatsAppIcon size={14} /> Start WhatsApp chat
            </a>
          </div>

          {/* Phone */}
          <div className="md:col-span-4 rounded-[28px] bg-cream p-6">
            <Phone className="mb-3" size={18} />
            <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Phone</div>
            <div className="space-y-1 mt-2">
              <a href="tel:+2348108418727" className="block font-display font-semibold text-lg hover:text-primary">+234 810 841 8727</a>
              <a href="tel:+2347067894474" className="block font-display font-semibold text-lg hover:text-primary">+234 706 789 4474</a>
            </div>
          </div>
          {/* Email */}
          <div className="md:col-span-4 rounded-[28px] bg-foreground text-background p-6">
            <Mail className="mb-3" size={18} />
            <div className="text-[11px] uppercase tracking-[0.2em] opacity-60">Email</div>
            <a href="mailto:gadget360ng@gmail.com" className="block font-display font-semibold text-lg mt-2 hover:text-primary-glow break-all">gadget360ng@gmail.com</a>
          </div>
          {/* Hours */}
          <div className="md:col-span-4 rounded-[28px] border border-border bg-card p-6">
            <Clock className="text-primary mb-3" size={18} />
            <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Store hours</div>
            <div className="mt-2 text-sm leading-relaxed">
              <div className="font-medium">Mon – Sat</div>
              <div className="text-muted-foreground">9:00 AM – 7:00 PM</div>
              <div className="font-medium mt-2">Sunday</div>
              <div className="text-muted-foreground">Closed</div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="grid md:grid-cols-12 gap-6 md:gap-10">
          <div className="md:col-span-5">
            <div className="text-[11px] uppercase tracking-[0.25em] text-primary mb-3">Drop a line</div>
            <h2 className="font-display font-bold text-3xl md:text-5xl tracking-tight leading-[1.05]">
              Prefer to <span className="font-serif-display">write?</span>
            </h2>
            <p className="text-sm text-muted-foreground mt-3 max-w-sm">
              Tell us what you're looking for and we'll reply within 24 hours. For instant help, WhatsApp is fastest.
            </p>
          </div>
          <form onSubmit={handleSubmit} className="md:col-span-7 rounded-[28px] border border-border bg-card p-6 md:p-8 space-y-4">
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1.5">Name *</label>
                <Input name="name" value={formData.name} onChange={handleInputChange} required placeholder="Your full name" className="h-11 rounded-xl" />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1.5">Phone *</label>
                <Input name="phone" type="tel" value={formData.phone} onChange={handleInputChange} required placeholder="+234 …" className="h-11 rounded-xl" />
              </div>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1.5">Email</label>
              <Input name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="you@example.com" className="h-11 rounded-xl" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1.5">Preferred reply</label>
              <Select value={formData.preferredContact} onValueChange={(v) => setFormData({ ...formData, preferredContact: v })}>
                <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="Choose…" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="phone">Phone</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1.5">Message *</label>
              <Textarea name="message" value={formData.message} onChange={handleInputChange} required rows={5} placeholder="What gadget are you looking for?" className="rounded-xl" />
            </div>
            <Button type="submit" disabled={isSubmitting} className="w-full h-12 rounded-full bg-foreground hover:bg-foreground/90 text-background gap-2 font-semibold">
              {isSubmitting ? "Sending…" : (<><Send size={15} /> Send message</>)}
            </Button>
            <p className="text-[11px] text-muted-foreground text-center">
              * Required. For faster reply, <a href={waGeneralUrl()} className="text-primary hover:underline">WhatsApp us</a>.
            </p>
          </form>
        </div>
      </main>

      <Footer />
      <GeminiChat />
    </div>
  );
};

export default Contact;
