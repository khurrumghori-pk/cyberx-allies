import { Network, Boxes, UserCheck, SlidersHorizontal } from "lucide-react";
import ScrollFadeIn from "@/components/cyberx/ScrollFadeIn";

const PILLARS = [
  { icon: Network, title: "Unified Context", desc: "Knowledge graph of assets, risks, and people" },
  { icon: Boxes, title: "Stack‑Agnostic", desc: "Works with 200+ tools you already use" },
  { icon: UserCheck, title: "Human‑in‑the‑Loop", desc: "Explainable AI with approval workflows" },
  { icon: SlidersHorizontal, title: "Flexible Workflows", desc: "Adapt to your processes, not the other way" },
];

const SolutionSection = () => (
  <section className="py-20">
    <div className="mx-auto max-w-7xl px-6">
      <ScrollFadeIn>
        <div className="space-y-3 mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-accent">The CyberX Solution</p>
          <h2 className="font-display text-2xl md:text-4xl text-foreground">
            See Everything. Know What Matters. Fix It Fast.
          </h2>
          <p className="text-muted-foreground max-w-3xl text-lg">
            End-to-end, context-aware security powered by CyberX Advisors — so you see everything, understand impact, and act with confidence.
          </p>
        </div>
      </ScrollFadeIn>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {PILLARS.map((p, i) => (
          <ScrollFadeIn key={p.title} delay={i * 80}>
            <div className="flex items-start gap-3 p-4 rounded-xl border border-border/40 bg-card/40">
              <p.icon className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-foreground text-sm">{p.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{p.desc}</p>
              </div>
            </div>
          </ScrollFadeIn>
        ))}
      </div>
    </div>
  </section>
);

export default SolutionSection;
