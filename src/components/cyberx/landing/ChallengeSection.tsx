import { Zap, ShieldCheck, ScrollText, BarChart3 } from "lucide-react";
import ScrollFadeIn from "@/components/cyberx/ScrollFadeIn";

const PAIN = [
  { num: "01", text: "Threats move at machine speed. Quarterly reviews don't." },
  { num: "02", text: "Compliance is now operational and reputational — not back‑office." },
  { num: "03", text: "Boards want cyber tied to growth, resilience, and trust." },
];

const PILLARS = [
  { icon: Zap, title: "Always‑on advisory", desc: "Persistent intelligence between meetings, audits, and incidents." },
  { icon: ShieldCheck, title: "Human + AI", desc: "Executive judgment paired with machine‑speed analysis." },
  { icon: ScrollText, title: "Contextual compliance", desc: "Frameworks translated into guidance you can act on." },
  { icon: BarChart3, title: "Board‑ready insight", desc: "Technical risk reframed as business narrative." },
];

const ChallengeSection = () => (
  <section className="py-20">
    <div className="mx-auto max-w-7xl px-6">
      <div className="grid lg:grid-cols-2 gap-10 items-start">
        {/* Left */}
        <ScrollFadeIn>
          <div className="lg:sticky lg:top-24 cyberx-panel p-7 space-y-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">The problem</p>
            <h3 className="font-display text-xl text-foreground">
              Cyber risk evolves daily. Leadership models haven't.
            </h3>
            <div className="space-y-3">
              {PAIN.map((b) => (
                <div key={b.num} className="flex gap-3 items-start">
                  <span className="flex-shrink-0 h-7 w-7 rounded-lg bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                    {b.num}
                  </span>
                  <p className="text-sm text-muted-foreground">{b.text}</p>
                </div>
              ))}
            </div>
          </div>
        </ScrollFadeIn>

        {/* Right */}
        <div className="space-y-6">
          <ScrollFadeIn>
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">The shift</p>
              <h2 className="font-display text-2xl md:text-4xl text-foreground leading-tight">
                Scalable cyber leadership.
              </h2>
              <p className="text-muted-foreground max-w-lg">
                Not replacing the CISO — amplifying cybersecurity leadership with AI that observes, interprets, and advises.
              </p>
            </div>
          </ScrollFadeIn>

          <div className="grid sm:grid-cols-2 gap-4">
            {PILLARS.map((f, i) => (
              <ScrollFadeIn key={f.title} delay={i * 80}>
                <div className="cyberx-panel p-5 space-y-2 h-full">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/15 to-accent/15 border border-border/30 flex items-center justify-center">
                    <f.icon className="h-4 w-4 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground text-sm">{f.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
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
