import { UserX, AlertCircle, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import ScrollFadeIn from "@/components/cyberx/ScrollFadeIn";

const CHALLENGES = [
  {
    icon: UserX,
    title: "Too Few Analysts",
    desc: "Talent is scarce, yet tool sprawl keeps growing. Teams juggle multiple vendors, wasting hours switching contexts.",
    color: "text-[hsl(30_100%_40%)]",
  },
  {
    icon: AlertCircle,
    title: "Too Many Alerts",
    desc: "Security teams face thousands of alerts but not enough hands to respond, leading to missed threats and preventable breaches.",
    color: "text-[hsl(30_100%_40%)]",
  },
  {
    icon: Flame,
    title: "Rising Costs & Burnout",
    desc: "Budget limits block new hires, so existing teams overwork, morale drops, burnout spreads, and attackers exploit cracks.",
    color: "text-[hsl(30_100%_40%)]",
  },
];

const ChallengeSection = () => (
  <section className="py-20 bg-secondary/30 border-y border-border/40">
    <div className="mx-auto max-w-7xl px-6">
      <ScrollFadeIn>
        <div className="text-center mb-12 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-destructive">The Real Problem</p>
          <h2 className="font-display text-2xl md:text-4xl text-foreground leading-tight">
            Cybersecurity Isn't Failing from Attacks —<br className="hidden md:block" /> It's Failing from the Headcount Gap
          </h2>
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
