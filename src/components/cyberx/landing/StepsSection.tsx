import ScrollFadeIn from "@/components/cyberx/ScrollFadeIn";

const STEPS = [
  { num: "01", title: "Assess", desc: "Identify cyber leadership gaps, fragmented workflows, and decision bottlenecks." },
  { num: "02", title: "Design", desc: "Define the advisory model, AI roles, human oversight, and executive reporting needs." },
  { num: "03", title: "Activate", desc: "Launch the pilot with real signals, real governance, and measurable leadership use cases." },
  { num: "04", title: "Scale", desc: "Expand across functions, subsidiaries, geographies, or sector‑specific regulatory contexts." },
];

const StepsSection = () => (
  <section className="py-20">
    <div className="mx-auto max-w-7xl px-6">
      <ScrollFadeIn>
        <div className="space-y-3 mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">Implementation journey</p>
          <h2 className="font-display text-2xl md:text-4xl text-foreground leading-tight max-w-[24ch]">
            How organizations move from concept to cyber command advantage.
          </h2>
          <p className="text-muted-foreground max-w-3xl">
            The transition is practical. Start with visibility. Layer intelligence. Establish governance. Scale the advisory model where it matters most.
          </p>
        </div>
      </ScrollFadeIn>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((s, i) => (
          <ScrollFadeIn key={s.num} delay={i * 100}>
            <div className="cyberx-panel p-6 space-y-3 h-full">
              <span className="inline-flex h-10 w-10 rounded-xl bg-accent/15 text-accent items-center justify-center font-bold text-sm">
                {s.num}
              </span>
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
