import ScrollFadeIn from "@/components/cyberx/ScrollFadeIn";

const STEPS = [
  { num: 1, title: "Discover", desc: "100% asset coverage — surface all assets instantly via zero‑agent discovery." },
  { num: 2, title: "Contextualize", desc: "Auto‑build a living knowledge graph with real‑time risk scores." },
  { num: 3, title: "Analyze", desc: "Cut alert noise by 60%, reduce MTTD from days to hours." },
  { num: 4, title: "Act", desc: "50% faster MTTR — trigger workflows, auto‑remediate, escalate only when needed." },
];

const StepsSection = () => (
  <section className="py-20">
    <div className="mx-auto max-w-7xl px-6">
      <ScrollFadeIn>
        <div className="text-center mb-12 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">How It Works</p>
          <h2 className="font-display text-2xl md:text-4xl text-foreground">From Alert to Action in Minutes</h2>
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
