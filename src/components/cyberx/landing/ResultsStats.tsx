import ScrollFadeIn from "@/components/cyberx/ScrollFadeIn";

const STATS = [
  { value: "70%", label: "Less Alert Noise", sub: "Filter irrelevant alerts, focus on what matters" },
  { value: "50%", label: "Faster MTTR", sub: "Automated workflows speed incident resolution" },
  { value: "100%", label: "Audit Ready", sub: "Continuous compliance: SOC 2, ISO 27001, PCI DSS" },
  { value: "40%", label: "Less Blind Spots", sub: "Automated asset discovery eliminates hidden risks" },
];

const ResultsStats = () => (
  <section className="py-16 border-y border-border/40 bg-secondary/30">
    <div className="mx-auto max-w-7xl px-6">
      <ScrollFadeIn>
        <div className="text-center mb-10 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">Measurable Impact</p>
          <h2 className="font-display text-2xl md:text-3xl text-foreground">The Results · From Day One</h2>
        </div>
      </ScrollFadeIn>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {STATS.map((s, i) => (
          <ScrollFadeIn key={s.label} delay={i * 100}>
            <div className="cyberx-panel p-6 text-center space-y-1.5">
              <p className="font-display text-3xl md:text-4xl text-primary">{s.value}</p>
              <p className="text-sm font-semibold text-foreground">{s.label}</p>
              <p className="text-xs text-muted-foreground">{s.sub}</p>
            </div>
          </ScrollFadeIn>
        ))}
      </div>
    </div>
  </section>
);

export default ResultsStats;
