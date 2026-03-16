import { Brain, CheckCircle, Target, FolderOpen, Globe, Handshake } from "lucide-react";
import ScrollFadeIn from "@/components/cyberx/ScrollFadeIn";

const CAPABILITIES = [
  { icon: Brain, title: "Risk intelligence", desc: "Live prioritization across ops, vendors, and initiatives." },
  { icon: CheckCircle, title: "Compliance engine", desc: "Regulations mapped to actions and evidence cues." },
  { icon: Target, title: "Decision support", desc: "Trade‑off analysis for investments, controls, and response." },
  { icon: FolderOpen, title: "Board reporting", desc: "Clear narratives for non‑technical stakeholders." },
  { icon: Globe, title: "Portfolio scale", desc: "Consistent leadership across subsidiaries and BUs." },
  { icon: Handshake, title: "Human governance", desc: "Experts review and refine every recommendation." },
];

const CoreCapabilitiesSection = () => (
  <section className="py-20">
    <div className="mx-auto max-w-7xl px-6">
      <ScrollFadeIn>
        <div className="space-y-2 mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">Capabilities</p>
          <h2 className="font-display text-2xl md:text-4xl text-foreground leading-tight">
            What you get.
          </h2>
        </div>
      </ScrollFadeIn>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CAPABILITIES.map((c, i) => (
          <ScrollFadeIn key={c.title} delay={i * 80}>
            <div className="cyberx-panel p-5 space-y-2 h-full hover:bg-card/60 transition-colors">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/15 to-accent/15 border border-border/30 flex items-center justify-center">
                <c.icon className="h-4 w-4 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground text-sm">{c.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{c.desc}</p>
            </div>
          </ScrollFadeIn>
        ))}
      </div>
    </div>
  </section>
);

export default CoreCapabilitiesSection;
