import { UserX, AlertCircle, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import ScrollFadeIn from "@/components/cyberx/ScrollFadeIn";

const CHALLENGES = [
  {
    icon: UserX,
    title: "Sovereign Knowledge Loss",
    desc: "When analysts leave, years of institutional knowledge vanish — threat context, incident history, and tribal expertise disappear overnight.",
    color: "text-[hsl(30_100%_40%)]",
  },
  {
    icon: AlertCircle,
    title: "Alert Overload, Zero Context",
    desc: "Thousands of alerts flood your SOC daily with no unified context. Without memory, every incident starts from scratch.",
    color: "text-[hsl(30_100%_40%)]",
  },
  {
    icon: Flame,
    title: "Tool Sprawl & Decision Fatigue",
    desc: "Dozens of disconnected tools, no single source of truth. Teams waste hours switching contexts while threats slip through the cracks.",
    color: "text-[hsl(30_100%_40%)]",
  },
];

const ChallengeSection = () => (
  <section className="py-20 bg-secondary/30 border-y border-border/40">
    <div className="mx-auto max-w-7xl px-6">
      <ScrollFadeIn>
        <div className="text-center mb-12 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-destructive">The Sovereignty Gap</p>
          <h2 className="font-display text-2xl md:text-4xl text-foreground leading-tight">
            Your Security Knowledge Shouldn't Walk Out the Door
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Traditional security relies on human memory. CyberX Advisors make your organization's cyber expertise permanent, sovereign, and always available.
          </p>
        </div>
      </ScrollFadeIn>
      <div className="grid gap-6 md:grid-cols-3">
        {CHALLENGES.map((c, i) => (
          <ScrollFadeIn key={c.title} delay={i * 100}>
            <div className="cyberx-panel p-6 space-y-3 h-full">
              <c.icon className={cn("h-8 w-8", c.color)} />
              <h3 className="font-display text-lg text-foreground">{c.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{c.desc}</p>
            </div>
          </ScrollFadeIn>
        ))}
      </div>
    </div>
  </section>
);

export default ChallengeSection;
