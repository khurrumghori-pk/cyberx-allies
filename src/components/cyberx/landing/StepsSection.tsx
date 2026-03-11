import ScrollFadeIn from "@/components/cyberx/ScrollFadeIn";

const STEPS = [
  { num: 1, title: "Capture", desc: "Ingest institutional knowledge — playbooks, incident history, analyst expertise — into persistent sovereign memory." },
  { num: 2, title: "Contextualize", desc: "Build a living knowledge graph that connects assets, risks, threats, and decisions with real‑time enrichment." },
  { num: 3, title: "Orchestrate", desc: "Multi‑agent consensus: 4+ AI advisors collaborate, score confidence, and surface actionable recommendations." },
  { num: 4, title: "Evolve", desc: "Advisors learn continuously from every interaction, building deeper expertise that never leaves your organization." },
];

const StepsSection = () => (
  <section className="py-20">
    <div className="mx-auto max-w-7xl px-6">
      <ScrollFadeIn>
        <div className="text-center mb-12 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">How It Works</p>
          <h2 className="font-display text-2xl md:text-4xl text-foreground">From Knowledge to Sovereign Intelligence</h2>
        </div>
      </ScrollFadeIn>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((s, i) => (
          <ScrollFadeIn key={s.num} delay={i * 100}>
            <div className="cyberx-panel p-6 text-center space-y-3 h-full">
              <div className="mx-auto h-12 w-12 rounded-full border border-dashed border-primary/50 bg-primary/10 flex items-center justify-center font-display text-xl text-primary">
                {s.num}
              </div>
              <h3 className="font-display text-lg text-foreground">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
            </div>
          </ScrollFadeIn>
        ))}
      </div>
    </div>
  </section>
);

export default StepsSection;
