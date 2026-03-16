import { Zap, ShieldCheck, ScrollText, BarChart3 } from "lucide-react";
import ScrollFadeIn from "@/components/cyberx/ScrollFadeIn";

const BULLETS = [
  { num: "01", title: "Faster threats:", desc: "adversaries innovate at machine speed; leadership cannot stay quarterly." },
  { num: "02", title: "Higher scrutiny:", desc: "compliance is no longer a back‑office ritual; it is operational and reputational." },
  { num: "03", title: "Executive demand:", desc: "boards need cyber narratives tied to growth, resilience, and trust." },
];

const FEATURES = [
  {
    icon: Zap,
    title: "Always‑on advisory layer",
    desc: "Keep a persistent cyber intelligence and guidance capability active between meetings, audits, and incidents.",
  },
  {
    icon: ShieldCheck,
    title: "Human‑led, AI‑augmented",
    desc: "Pair executive judgment with machine‑speed analysis so decisions stay strategic, contextual, and accountable.",
  },
  {
    icon: ScrollText,
    title: "Compliance with context",
    desc: "Turn control frameworks and regulatory requirements into practical guidance leaders can actually act on.",
  },
  {
    icon: BarChart3,
    title: "Board‑ready insight",
    desc: "Translate technical risk into narratives around resilience, trust, financial impact, and strategic exposure.",
  },
];

const ChallengeSection = () => (
  <section className="py-20">
    <div className="mx-auto max-w-7xl px-6">
      <div className="grid lg:grid-cols-[0.92fr_1.08fr] gap-8 items-start">
        {/* Left - sticky insight */}
        <ScrollFadeIn>
          <div className="lg:sticky lg:top-24 cyberx-panel p-7 space-y-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">Why this matters now</p>
            <h3 className="font-display text-xl text-foreground">
              The threat landscape moved. The leadership model must too.
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Traditional cybersecurity leadership was built around periodic reviews, fragmented dashboards, and talent bottlenecks. But cyber risk now mutates in real time, regulations tighten continuously, and boards expect clarity instead of jargon.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              That creates a gap: organizations need strategic cyber leadership that is more consistent, more scalable, and more responsive than a human‑only model can realistically provide.
            </p>

            <div className="space-y-3 pt-2">
              {BULLETS.map((b) => (
                <div key={b.num} className="flex gap-3 items-start">
                  <span className="flex-shrink-0 h-7 w-7 rounded-lg bg-primary/10 text-primary text-xs font-bold flex items-center justify-center mt-0.5">
                    {b.num}
                  </span>
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">{b.title}</strong> {b.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </ScrollFadeIn>

        {/* Right - thesis + features */}
        <div className="space-y-6">
          <ScrollFadeIn>
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">The new thesis</p>
              <h2 className="font-display text-2xl md:text-4xl text-foreground leading-tight max-w-[14ch]">
                From isolated expertise to scalable cyber leadership.
              </h2>
              <p className="text-muted-foreground max-w-2xl">
                AIgilityX CyberX Advisors is designed around a simple but powerful shift: not replacing the CISO, but amplifying cybersecurity leadership through AI systems that continuously observe, interpret, and advise.
              </p>
            </div>
          </ScrollFadeIn>

          <div className="grid sm:grid-cols-2 gap-4">
            {FEATURES.map((f, i) => (
              <ScrollFadeIn key={f.title} delay={i * 80}>
                <div className="cyberx-panel p-5 space-y-3 h-full">
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary/15 to-accent/15 border border-border/30 flex items-center justify-center">
                    <f.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              </ScrollFadeIn>
            ))}
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default ChallengeSection;
