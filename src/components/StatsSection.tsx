const stats = [
  { value: "10K+", label: "Products Sold" },
  { value: "25K+", label: "Happy Customers" },
  { value: "99%", label: "Satisfaction Rate" },
  { value: "<5min", label: "WhatsApp Response" },
];

const StatsSection = () => (
  <section className="bg-foreground text-background py-16 md:py-24">
    <div className="container mx-auto px-6">
      <div className="max-w-2xl mb-12">
        <p className="text-xs uppercase tracking-[0.2em] text-primary-glow mb-3">Trusted across Nigeria</p>
        <h2 className="font-display text-3xl md:text-5xl font-bold leading-tight">
          Numbers that prove<br />we deliver.
        </h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
        {stats.map((s) => (
          <div key={s.label} className="border-t border-background/20 pt-6">
            <div className="font-display text-4xl md:text-6xl font-bold tracking-tight">{s.value}</div>
            <div className="text-sm text-background/60 mt-2">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default StatsSection;
