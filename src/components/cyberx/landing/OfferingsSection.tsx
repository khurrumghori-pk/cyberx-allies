import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import ScrollFadeIn from "@/components/cyberx/ScrollFadeIn";

const PLANS = [
  {
    title: "Readiness Sprint",
    price: "4–6 weeks",
    features: ["Cyber posture gap review", "Board narrative design", "AI use‑case mapping"],
    cta: "Request Sprint",
    featured: false,
  },
  {
    title: "Platform Pilot",
    price: "8–12 weeks",
    features: ["Continuous risk & compliance signals", "CISO co‑pilot workflows", "Governance dashboards"],
    cta: "Start Pilot",
    featured: true,
  },
  {
    title: "Strategic Partnership",
    price: "Ongoing",
    features: ["Operating model evolution", "Human + AI orchestration", "Executive briefings & roadmap"],
    cta: "Discuss",
    featured: false,
  },
];

const OfferingsSection = () => (
  <section className="py-20">
    <div className="mx-auto max-w-7xl px-6">
      <ScrollFadeIn>
        <div className="space-y-2 mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-accent">Engagement</p>
          <h2 className="font-display text-2xl md:text-4xl text-foreground leading-tight">
            Start where you are.
          </h2>
        </div>
      </ScrollFadeIn>

      <div className="grid gap-5 md:grid-cols-3">
        {PLANS.map((p, i) => (
          <ScrollFadeIn key={p.title} delay={i * 100}>
            <div
              className={`cyberx-panel p-6 space-y-4 h-full flex flex-col relative overflow-hidden ${
                p.featured ? "border-primary/40 ring-1 ring-primary/20" : ""
              }`}
            >
              {p.featured && (
                <span className="absolute top-4 right-[-30px] rotate-[35deg] bg-gradient-to-r from-primary to-accent text-background text-[10px] font-extrabold uppercase tracking-wider px-10 py-1">
                  Recommended
                </span>
              )}
              <h3 className="font-display text-lg text-foreground">{p.title}</h3>
              <p className="font-display text-2xl text-foreground tracking-tight">{p.price}</p>
              <div className="space-y-2 flex-1">
                {p.features.map((f) => (
                  <div key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                    {f}
                  </div>
                ))}
              </div>
              <Button asChild variant={p.featured ? "hero" : "outline"} className="w-full">
                <Link to="/auth">{p.cta}</Link>
              </Button>
            </div>
          </ScrollFadeIn>
        ))}
      </div>
    </div>
  </section>
);

export default OfferingsSection;
