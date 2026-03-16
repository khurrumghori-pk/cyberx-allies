import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Zap, Calendar, ArrowRight } from "lucide-react";
import ScrollFadeIn from "@/components/cyberx/ScrollFadeIn";

const HERO_STATS = [
  { value: "24/7", desc: "Continuous risk intelligence and board-ready visibility" },
  { value: "360°", desc: "Compliance, threats, posture, and decision support in one layer" },
  { value: "Human + AI", desc: "Augmented cybersecurity leadership, not autopilot governance" },
  { value: "Platform‑first", desc: "Repeatable security leadership across business units and portfolios" },
];

const SIGNALS = [
  { label: "Threat posture", value: "Elevated supply chain exposure" },
  { label: "Compliance priority", value: "NIS2 / ISO / sector controls alignment" },
  { label: "Board insight", value: "Translate cyber risk into business impact" },
  { label: "Advisor mode", value: "Recommend, explain, escalate" },
];

const TRUST_ITEMS = [
  "Continuous Risk Intelligence",
  "Compliance Guidance Engine",
  "Strategic Security Insights",
  "Executive Cyber Decision Support",
];

const HeroSection = () => (
  <section className="relative pt-28 pb-12 overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
    <div className="absolute top-20 left-1/4 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px]" />
    <div className="absolute top-40 right-1/4 w-[400px] h-[400px] rounded-full bg-accent/5 blur-[100px]" />

    <div className="relative mx-auto max-w-7xl px-6">
      {/* Split hero */}
      <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-8 items-center">
        {/* Left - Text */}
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2.5 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm text-primary backdrop-blur-sm">
            <Zap className="h-3.5 w-3.5" />
            AI‑native cybersecurity leadership for the next operating model
          </div>

          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl leading-[0.96] tracking-tight text-foreground">
            Where human judgment meets{" "}
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              machine‑speed cyber strategy.
            </span>
          </h1>

          <p className="text-lg text-muted-foreground max-w-[62ch]">
            At AIgilityX CyberX Advisors, we see the next model emerging: AI‑powered cyber advisors working alongside human CISOs to deliver continuous risk intelligence, compliance guidance, executive‑level visibility, and strategic security insight at platform scale.
          </p>

          <div className="flex flex-wrap gap-3 pt-1">
            <Button asChild variant="hero" size="lg" className="text-base px-7">
              <Link to="/auth">
                <Calendar className="mr-2 h-4 w-4" /> Book an Executive Briefing
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="text-base px-7"
              onClick={() => document.getElementById("platform")?.scrollIntoView({ behavior: "smooth" })}
            >
              Explore the Platform Model <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          {/* Quote */}
          <div className="border-l-[3px] border-primary bg-primary/5 rounded-r-2xl px-5 py-4 max-w-2xl">
            <p className="text-sm text-foreground/90">
              <strong>The future may not be CISO‑as‑a‑Service.</strong><br />
              It may be <strong className="text-primary">Cybersecurity Leadership‑as‑a‑Platform</strong> — always on, context‑aware, and built to help leaders govern faster than threats evolve.
            </p>
          </div>
        </div>

        {/* Right - Card */}
        <ScrollFadeIn delay={200}>
          <aside className="relative rounded-2xl border border-border/40 bg-gradient-to-b from-card/95 to-background/98 shadow-2xl overflow-hidden p-6 lg:p-7">
            {/* Glow blobs */}
            <div className="absolute -top-10 -right-8 w-44 h-44 rounded-full bg-primary/15 blur-[50px]" />
            <div className="absolute -bottom-14 -left-8 w-40 h-40 rounded-full bg-accent/15 blur-[50px]" />

            <div className="relative z-10 space-y-5">
              {/* Card header */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">AIgilityX Operating Signal</p>
                  <p className="font-display text-xl tracking-tight text-foreground">Cyber Advisory Control Tower</p>
                </div>
                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 text-xs text-emerald-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_6px_hsl(160_60%_50%/0.4)]" />
                  Always‑On
                </span>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-3">
                {HERO_STATS.map((s) => (
                  <div key={s.value} className="rounded-xl border border-border/30 bg-secondary/40 backdrop-blur-sm p-4">
                    <p className="font-display text-lg text-foreground mb-1">{s.value}</p>
                    <p className="text-xs text-muted-foreground leading-snug">{s.desc}</p>
                  </div>
                ))}
              </div>

              {/* Signal panel */}
              <div className="rounded-xl border border-border/30 bg-secondary/30 backdrop-blur-sm p-4 space-y-2">
                <h4 className="text-sm font-semibold text-foreground mb-3">Live strategic signal map</h4>
                {SIGNALS.map((s, i) => (
                  <div
                    key={s.label}
                    className={`flex justify-between gap-4 py-2.5 text-xs ${i < SIGNALS.length - 1 ? "border-b border-dashed border-border/30" : ""}`}
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

      {/* Trust strip */}
      <ScrollFadeIn delay={300}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-10">
          {TRUST_ITEMS.map((t) => (
            <div
              key={t}
              className="rounded-xl border border-border/30 bg-secondary/30 backdrop-blur-sm px-5 py-4 text-center text-sm text-muted-foreground"
            >
              {t}
            </div>
          ))}
        </div>
      </ScrollFadeIn>
    </div>
  </section>
);

export default HeroSection;
