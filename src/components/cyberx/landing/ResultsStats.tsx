import { CheckCircle } from "lucide-react";
import ScrollFadeIn from "@/components/cyberx/ScrollFadeIn";

const STATS = [
  { value: "176", label: "Hours/month saved", sub: "62% reduction in CMDB workload" },
  { value: "2,000+", label: "Hours saved annually", sub: "Reinvested in strategic work" },
  { value: "70%", label: "Faster MTTD", sub: "Detection from months to minutes" },
  { value: "~50%", label: "Faster MTTR", sub: "Remediation speed doubled" },
];

const PROOF_POINTS = [
  "Real-time discovery cycles — from months to instant",
  "Continuous compliance posture — always audit‑ready",
  "Multi‑agent consensus — decisions you can trust",
];

const ResultsStats = () => (
  <section className="py-16 border-y border-border/40 bg-secondary/30">
    <div className="mx-auto max-w-7xl px-6">
      <ScrollFadeIn>
        <div className="text-center mb-10 space-y-2">
          <h2 className="font-display text-2xl md:text-3xl text-foreground">Measurable Outcomes</h2>
          <p className="text-muted-foreground">Real impact from day one — without adding headcount</p>
        </div>
      </ScrollFadeIn>
      <div className="grid grid-cols-2 gap-5 max-w-3xl mx-auto">
        {STATS.map((s, i) => (
          <ScrollFadeIn key={s.label} delay={i * 100}>
            <div className="rounded-xl border border-border/40 bg-card/40 backdrop-blur-sm p-6 space-y-1.5">
              <p className="font-display text-3xl md:text-4xl text-primary">{s.value}</p>
              <p className="text-sm font-semibold text-foreground">{s.label}</p>
              <p className="text-xs text-muted-foreground">{s.sub}</p>
            </div>
          </ScrollFadeIn>
        ))}
      </div>
      <ScrollFadeIn delay={500}>
        <div className="flex flex-wrap justify-center gap-6 pt-8 text-xs text-muted-foreground">
          {PROOF_POINTS.map((p) => (
            <span key={p} className="flex items-center gap-1.5">
              <CheckCircle className="h-3.5 w-3.5 text-primary" /> {p}
            </span>
          ))}
        </div>
      </ScrollFadeIn>
    </div>
  </section>
);

export default ResultsStats;
