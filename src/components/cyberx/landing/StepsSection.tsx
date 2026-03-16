import ScrollFadeIn from "@/components/cyberx/ScrollFadeIn";

const STEPS = [
  { num: "01", title: "Assess", desc: "Find leadership gaps and decision bottlenecks." },
  { num: "02", title: "Design", desc: "Define AI roles, human oversight, and reporting." },
  { num: "03", title: "Activate", desc: "Launch with real signals and governance." },
  { num: "04", title: "Scale", desc: "Expand across functions and geographies." },
];

const StepsSection = () => (
  <section className="py-20">
    <div className="mx-auto max-w-7xl px-6">
      <ScrollFadeIn>
        <div className="space-y-2 mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">Journey</p>
          <h2 className="font-display text-2xl md:text-4xl text-foreground leading-tight">
            Concept to command in four steps.
          </h2>
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
