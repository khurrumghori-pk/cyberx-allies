import { Brain, CheckCircle, Target, FolderOpen, Globe, Handshake } from "lucide-react";
import ScrollFadeIn from "@/components/cyberx/ScrollFadeIn";

const CAPABILITIES = [
  {
    icon: Brain,
    title: "Continuous risk intelligence",
    desc: "Monitor evolving cyber exposure across operations, vendors, assets, and strategic initiatives with live prioritization logic.",
  },
  {
    icon: CheckCircle,
    title: "Compliance guidance engine",
    desc: "Map regulatory demands into action paths, evidence cues, and executive summaries that reduce audit friction.",
  },
  {
    icon: Target,
    title: "Strategic decision support",
    desc: "Support leadership trade‑offs on investments, controls, incident response, third‑party risk, and security roadmaps.",
  },
  {
    icon: FolderOpen,
    title: "Board and leadership reporting",
    desc: "Provide clear narratives, posture summaries, and escalation insights for non‑technical stakeholders.",
  },
  {
    icon: Globe,
    title: "Portfolio‑scale consistency",
    desc: "Extend cyber leadership patterns across subsidiaries, public entities, business units, or client portfolios.",
  },
  {
    icon: Handshake,
    title: "Advisor collaboration workflows",
    desc: "Ensure human experts review, refine, and govern recommendations so accountability stays anchored in leadership.",
  },
];

const CoreCapabilitiesSection = () => (
  <section className="py-20">
    <div className="mx-auto max-w-7xl px-6">
      <ScrollFadeIn>
        <div className="space-y-3 mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">Core capabilities</p>
          <h2 className="font-display text-2xl md:text-4xl text-foreground leading-tight max-w-[20ch]">
            What AIgilityX CyberX Advisors delivers.
          </h2>
          <p className="text-muted-foreground max-w-3xl">
            The model is built for organizations that need more than technical defense. They need guidance, cadence, governance, and a way to scale scarce cyber leadership across complex operations.
          </p>
        </div>
      </ScrollFadeIn>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {CAPABILITIES.map((c, i) => (
          <ScrollFadeIn key={c.title} delay={i * 80}>
            <div className="cyberx-panel p-6 space-y-3 h-full hover:bg-card/60 transition-colors">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary/15 to-accent/15 border border-border/30 flex items-center justify-center">
                <c.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">{c.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{c.desc}</p>
            </div>
          </ScrollFadeIn>
        ))}
      </div>
    </div>
  </section>
);

export default CoreCapabilitiesSection;
