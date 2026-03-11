import { TrendingUp, Bot, Swords, Cpu } from "lucide-react";
import ScrollFadeIn from "@/components/cyberx/ScrollFadeIn";

const ROADMAP = [
  { icon: TrendingUp, title: "Predictive Risk Forecasting", desc: "Sovereign AI models that predict emerging risk hotspots before they become incidents — using your organization's own threat history.", tag: "Coming Soon" },
  { icon: Bot, title: "Autonomous Remediation", desc: "End‑to‑end remediation workflows with full auditability, human oversight, and institutional memory of every action taken.", tag: "In Development" },
  { icon: Swords, title: "Adversarial Simulation", desc: "Continuous red‑teaming powered by your advisors' collective memory — testing controls against threats specific to your environment.", tag: "Research" },
  { icon: Cpu, title: "OT/IoT Sovereign Twins", desc: "Specialized digital twin advisors for operational technology and IoT — persistent expertise for environments where turnover is critical.", tag: "Planned" },
];

const RoadmapSection = () => (
  <section className="py-20">
    <div className="mx-auto max-w-7xl px-6">
      <ScrollFadeIn>
        <div className="cyberx-panel p-8 md:p-12 bg-gradient-to-br from-secondary/80 to-card/90 border-primary/20 space-y-8">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-[hsl(45_100%_60%)]">Roadmap</p>
            <h2 className="font-display text-2xl md:text-3xl text-foreground">The Road Ahead: Sovereign Capabilities</h2>
            <p className="text-muted-foreground">Continuously evolving — your advisors get smarter with every interaction.</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {ROADMAP.map((r, i) => (
              <ScrollFadeIn key={r.title} delay={i * 80}>
                <div className="rounded-xl border border-border/40 bg-background/30 backdrop-blur-sm p-5 space-y-3 h-full hover:bg-background/50 transition-colors">
                  <span className="inline-block rounded-full bg-[hsl(45_100%_60%)]/20 text-[hsl(45_100%_60%)] text-[10px] font-bold px-3 py-0.5 border border-[hsl(45_100%_60%)]/30">
                    {r.tag}
                  </span>
                  <r.icon className="h-8 w-8 text-primary" />
                  <h3 className="font-semibold text-foreground text-sm">{r.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{r.desc}</p>
                </div>
              </ScrollFadeIn>
            ))}
          </div>
        </div>
      </ScrollFadeIn>
    </div>
  </section>
);

export default RoadmapSection;
