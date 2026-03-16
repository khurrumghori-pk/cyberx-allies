import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import ScrollFadeIn from "@/components/cyberx/ScrollFadeIn";

const PLANS = [
  {
    title: "Executive Readiness Sprint",
    desc: "Ideal for organizations exploring the platform model and aligning cyber priorities fast.",
    price: "4–6 weeks",
    unit: "/ advisory sprint",
    features: [
      "Cyber posture and leadership gap review",
      "Board‑level cyber narrative design",
      "Initial AI advisory use‑case map",
    ],
    cta: "Request a Sprint",
    featured: false,
  },
  {
    title: "Cyber Leadership Platform Pilot",
    desc: "Best for enterprises or public‑sector bodies validating AI‑powered cyber advisory workflows.",
    price: "8–12 weeks",
    unit: "/ pilot program",
    features: [
      "Continuous risk and compliance signal model",
      "Executive and CISO co‑pilot workflows",
      "Governance, escalation, and insight dashboards",
    ],
    cta: "Start the Pilot",
    featured: true,
  },
  {
    title: "Strategic Advisory Partnership",
    desc: "For institutions building repeatable cyber leadership capability over time.",
    price: "Ongoing",
    unit: "/ retained partnership",
    features: [
      "Operating model and governance evolution",
      "Human + AI advisory orchestration",
      "Executive briefings and strategic roadmap support",
    ],
    cta: "Discuss Partnership",
    featured: false,
  },
];

const OfferingsSection = () => (
  <section className="py-20">
    <div className="mx-auto max-w-7xl px-6">
      <ScrollFadeIn>
        <div className="space-y-3 mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-accent">Engagement models</p>
          <h2 className="font-display text-2xl md:text-4xl text-foreground leading-tight max-w-[20ch]">
            Flexible ways to activate the platform.
          </h2>
          <p className="text-muted-foreground max-w-3xl">
            Whether you are starting with an advisory sprint or building a longer‑term cyber leadership capability, the model adapts to your maturity, regulatory exposure, and executive ambition.
          </p>
        </div>
      </ScrollFadeIn>

      <div className="grid gap-5 md:grid-cols-3">
        {PLANS.map((p, i) => (
          <ScrollFadeIn key={p.title} delay={i * 100}>
            <div
              className={`cyberx-panel p-6 space-y-5 h-full flex flex-col relative overflow-hidden ${
                p.featured ? "border-primary/40 ring-1 ring-primary/20 -translate-y-1" : ""
              }`}
            >
              {p.featured && (
                <span className="absolute top-4 right-[-30px] rotate-[35deg] bg-gradient-to-r from-primary to-accent text-background text-[10px] font-extrabold uppercase tracking-wider px-10 py-1">
                  Recommended
                </span>
              )}
              <h3 className="font-display text-lg text-foreground">{p.title}</h3>
              <p className="text-sm text-muted-foreground">{p.desc}</p>
              <p className="font-display text-3xl text-foreground tracking-tight">
                {p.price} <span className="text-sm font-normal text-muted-foreground">{p.unit}</span>
              </p>
              <div className="space-y-2.5 flex-1">
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
