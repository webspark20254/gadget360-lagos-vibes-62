const BrandStory = () => (
  <section className="bg-ink text-ink-foreground py-16 md:py-28 relative overflow-hidden grain">
    <div className="container mx-auto px-5 md:px-8">
      <div className="grid md:grid-cols-12 gap-8 md:gap-12">
        <div className="md:col-span-3">
          <p className="text-[11px] uppercase tracking-[0.25em] text-primary-glow mb-3">The brand</p>
          <div className="font-serif-display text-5xl md:text-7xl text-primary leading-none">G360</div>
        </div>
        <div className="md:col-span-9 space-y-6">
          <h2 className="font-display font-bold text-3xl md:text-6xl leading-[1.05] tracking-tight max-w-3xl">
            We don't just <span className="font-serif-display text-primary-glow">sell gadgets</span> — we curate the ones worth owning.
          </h2>
          <div className="grid sm:grid-cols-2 gap-6 md:gap-10 pt-4">
            <p className="text-sm md:text-base text-ink-foreground/70 leading-relaxed">
              Born in Computer Village, Lagos. Built on a simple promise — authentic stock, fair pricing, real warranty, and a human on WhatsApp every time you message.
            </p>
            <p className="text-sm md:text-base text-ink-foreground/70 leading-relaxed">
              From the first iPhone we sold to the seven thousandth, the standard hasn't moved: if it ships from Gadget360, it's the real thing — and we'll back it up.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 md:gap-8 pt-8 border-t border-ink-foreground/15">
            {[
              { k: "2018", v: "Founded" },
              { k: "7 yrs", v: "Trusted track record" },
              { k: "99%", v: "Customer satisfaction" },
            ].map((s) => (
              <div key={s.k}>
                <div className="font-display font-bold text-2xl md:text-4xl tracking-tight">{s.k}</div>
                <div className="text-xs md:text-sm text-ink-foreground/60 mt-1">{s.v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default BrandStory;
