import ScrollFadeIn from "@/components/cyberx/ScrollFadeIn";

const FRAMEWORK = [
  { num: 1, title: "Sense", desc: "Absorb threat, compliance, and business signals continuously." },
  { num: 2, title: "Interpret", desc: "Surface what matters now and what needs leadership attention." },
  { num: 3, title: "Advise", desc: "Recommend actions and trade‑offs tailored for your role." },
];

const SolutionSection = () => (
  <section className="py-20">
    <div className="mx-auto max-w-7xl px-6">
      <ScrollFadeIn>
        <div className="space-y-2 mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">How it works</p>
          <h2 className="font-display text-2xl md:text-4xl text-foreground leading-tight">
            Sense. Interpret. Advise.
          </h2>
          <p className="text-muted-foreground max-w-xl">
            A strategic layer between security ops, compliance, and the board — framing issues for action, not just detection.
          </p>
        </div>
      </ScrollFadeIn>

      <div className="grid gap-5 md:grid-cols-3 mb-8">
        {FRAMEWORK.map((f, i) => (
          <ScrollFadeIn key={f.num} delay={i * 100}>
            <div className="cyberx-panel p-6 space-y-3 h-full">
              <span className="inline-flex h-10 w-10 rounded-xl bg-accent/15 text-accent items-center justify-center font-bold text-sm">
                {f.num}
              </span>
              <h3 className="font-display text-xl text-foreground">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          </ScrollFadeIn>
        ))}
      </div>

      <ScrollFadeIn delay={300}>
        <div className="rounded-2xl border border-border/30 bg-gradient-to-br from-primary/5 to-accent/8 p-8 text-center">
          <p className="font-display text-xl md:text-2xl text-foreground leading-snug max-w-[32ch] mx-auto tracking-tight">
            Not another dashboard.{" "}
            <span className="text-primary">A strategic co‑pilot for cyber leadership.</span>
          </p>
        </div>
      </ScrollFadeIn>
    </div>
  </section>
);

export default SolutionSection;
