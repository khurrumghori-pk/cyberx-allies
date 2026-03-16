import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Zap, Calendar, ArrowRight } from "lucide-react";
import ScrollFadeIn from "@/components/cyberx/ScrollFadeIn";

const HERO_STATS = [
  { value: "24/7", desc: "Always‑on risk visibility" },
  { value: "360°", desc: "Threats, compliance & posture" },
  { value: "AI + Human", desc: "Augmented, not autopilot" },
  { value: "Scale", desc: "Across BUs & portfolios" },
];

const SIGNALS = [
  { label: "Threat posture", value: "Supply chain elevated" },
  { label: "Compliance", value: "NIS2 / ISO alignment" },
  { label: "Board insight", value: "Risk → business impact" },
  { label: "Advisor mode", value: "Recommend & escalate" },
];

const HeroSection = () => (
  <section className="relative pt-28 pb-12 overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
    <div className="absolute top-20 left-1/4 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px]" />
    <div className="absolute top-40 right-1/4 w-[400px] h-[400px] rounded-full bg-accent/5 blur-[100px]" />

    <div className="relative mx-auto max-w-7xl px-6">
      <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-8 items-center">
        {/* Left */}
        <div className="space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm text-primary backdrop-blur-sm">
            <Zap className="h-3.5 w-3.5" />
            Cybersecurity Leadership‑as‑a‑Platform
          </div>

          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl leading-[0.96] tracking-tight text-foreground">
            Your AI co‑pilot for{" "}
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              cyber strategy.
            </span>
          </h1>

          <p className="text-lg text-muted-foreground max-w-xl">
            AI advisors that work alongside CISOs — delivering continuous risk intelligence, compliance guidance, and board‑ready insight at platform scale.
          </p>

          <div className="flex flex-wrap gap-3">
            <Button asChild variant="hero" size="lg" className="text-base px-7">
              <Link to="/auth">
                <Calendar className="mr-2 h-4 w-4" /> Book a Briefing
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="text-base px-7"
              onClick={() => document.getElementById("platform")?.scrollIntoView({ behavior: "smooth" })}
            >
              See How It Works <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Right - Card */}
        <ScrollFadeIn delay={200}>
          <aside className="relative rounded-2xl border border-border/40 bg-gradient-to-b from-card/95 to-background/98 shadow-2xl overflow-hidden p-6 lg:p-7">
            <div className="absolute -top-10 -right-8 w-44 h-44 rounded-full bg-primary/15 blur-[50px]" />
            <div className="absolute -bottom-14 -left-8 w-40 h-40 rounded-full bg-accent/15 blur-[50px]" />

            <div className="relative z-10 space-y-5">
              <div className="flex items-start justify-between gap-3">
                <p className="font-display text-lg tracking-tight text-foreground">Cyber Advisory Tower</p>
                <span className="inline-flex items-center gap-2 rounded-full bg-accent/10 border border-accent/20 px-3 py-1.5 text-xs text-accent">
                  <span className="h-2 w-2 rounded-full bg-accent shadow-[0_0_6px_hsl(var(--accent)/0.4)]" />
                  Live
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {HERO_STATS.map((s) => (
                  <div key={s.value} className="rounded-xl border border-border/30 bg-secondary/40 backdrop-blur-sm p-3">
                    <p className="font-display text-lg text-foreground">{s.value}</p>
                    <p className="text-[11px] text-muted-foreground leading-snug">{s.desc}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-xl border border-border/30 bg-secondary/30 backdrop-blur-sm p-4 space-y-1">
                {SIGNALS.map((s, i) => (
                  <div
                    key={s.label}
                    className={`flex justify-between gap-4 py-2 text-xs ${i < SIGNALS.length - 1 ? "border-b border-dashed border-border/30" : ""}`}
                  >
                    <span className="text-muted-foreground">{s.label}</span>
                    <span className="font-semibold text-foreground text-right">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </ScrollFadeIn>
      </div>
    </div>
  </section>
);

export default HeroSection;
