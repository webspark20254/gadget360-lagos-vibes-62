import { Quote } from "lucide-react";

const items = [
  { name: "Chinedu A.", role: "Lagos", text: "Ordered an iPhone, delivered same day to Lekki. Genuine and well-packaged. Will buy again." },
  { name: "Aisha B.", role: "Abuja", text: "Swapped my old laptop for a fair price and got a MacBook with warranty. Smooth WhatsApp service." },
  { name: "Tunde O.", role: "Ikeja", text: "Their PS5 bundle was the best price I found. Walked in, walked out in 15 minutes. Top tier." },
];

const Testimonials = () => (
  <section className="py-16 md:py-24 bg-background">
    <div className="container mx-auto px-6">
      <div className="max-w-2xl mb-12">
        <p className="text-xs uppercase tracking-[0.2em] text-primary mb-3">What customers say</p>
        <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight">
          Reviews from real buyers.
        </h2>
      </div>
      <div className="grid md:grid-cols-3 gap-5">
        {items.map((t) => (
          <div key={t.name} className="rounded-2xl border border-border bg-card p-6 shadow-soft hover:shadow-card transition-shadow">
            <Quote className="text-primary mb-4" size={20} />
            <p className="text-foreground/85 leading-relaxed text-[15px]">{t.text}</p>
            <div className="mt-6 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-crimson grid place-items-center text-white font-display font-bold">
                {t.name[0]}
              </div>
              <div>
                <div className="text-sm font-semibold">{t.name}</div>
                <div className="text-xs text-muted-foreground">{t.role}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default Testimonials;
