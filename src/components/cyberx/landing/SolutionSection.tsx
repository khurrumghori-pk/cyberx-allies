import ScrollFadeIn from "@/components/cyberx/ScrollFadeIn";

const FRAMEWORK = [
  { num: 1, title: "Sense", desc: "Continuously absorb signals from threats, vulnerabilities, policies, controls, regulations, and business context." },
  { num: 2, title: "Interpret", desc: "Convert raw data into meaningful intelligence: what matters now, what is changing, and what needs leadership attention." },
  { num: 3, title: "Advise", desc: "Recommend actions, trade‑offs, and response options tailored for CISOs, CIOs, risk leaders, and boards." },
];

const SolutionSection = () => (
  <section className="py-20">
    <div className="mx-auto max-w-7xl px-6">
      <ScrollFadeIn>
        <div className="space-y-3 mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">Platform architecture</p>
          <h2 className="font-display text-2xl md:text-4xl text-foreground leading-tight max-w-[20ch]">
            Cybersecurity Leadership‑as‑a‑Platform, explained.
          </h2>
          <p className="text-muted-foreground max-w-3xl">
            Think of it as a strategic cyber operating layer that sits between security operations, compliance functions, executive leadership, and the board. It does not merely detect issues. It interprets them, prioritizes them, and frames them for action.
          </p>
        </div>
      </ScrollFadeIn>

      <div className="grid gap-5 md:grid-cols-3 mb-8">
        {FRAMEWORK.map((f, i) => (
          <ScrollFadeIn key={f.num} delay={i * 100}>
            <div className="cyberx-panel p-6 space-y-4 h-full">
              <span className="inline-flex h-10 w-10 rounded-xl bg-accent/15 text-accent items-center justify-center font-bold text-sm">
                {f.num}
              </span>
              <h3 className="font-display text-xl text-foreground">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          </ScrollFadeIn>
        ))}
      </div>

      {/* Quote band */}
      <ScrollFadeIn delay={300}>
        <div className="rounded-2xl border border-border/30 bg-gradient-to-br from-primary/5 to-accent/8 p-8 md:p-10 text-center">
          <p className="font-display text-xl md:text-2xl lg:text-3xl text-foreground leading-snug max-w-[36ch] mx-auto tracking-tight">
            Not another dashboard. Not another alert stream.{" "}
            <span className="text-primary">A strategic co‑pilot for cyber leadership.</span>
          </p>
        </div>
      </ScrollFadeIn>
    </div>
  </section>
);

export default SolutionSection;
