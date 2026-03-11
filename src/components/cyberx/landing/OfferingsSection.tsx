import { Layers, UserCog, HeadphonesIcon, CheckCircle } from "lucide-react";
import ScrollFadeIn from "@/components/cyberx/ScrollFadeIn";

const OFFERINGS = [
  {
    icon: Layers,
    title: "Sovereign Security Programs",
    desc: "Curated, stack‑able security programs — each solving a point problem from visibility to compliance, with institutional memory baked in.",
    badge: "Teams solving a specific problem without overhauling their stack.",
  },
  {
    icon: UserCog,
    title: "CyberX Advisor Digital Twins",
    desc: "Agentic AI counterparts embedded in your workflows — they remember every incident, learn your environment, and act like senior analysts who never leave.",
    badge: "Lean security teams who want sovereign expertise at scale.",
  },
  {
    icon: HeadphonesIcon,
    title: "White Glove Onboarding & Support",
    desc: "Expert‑led onboarding, knowledge transfer, and round‑the‑clock support to ensure your sovereign AI capability is operational from day one.",
    badge: "From day one, your institutional knowledge is preserved.",
  },
];

const OfferingsSection = () => (
  <section className="py-20 bg-secondary/30">
    <div className="mx-auto max-w-7xl px-6">
      <ScrollFadeIn>
        <div className="text-center mb-12 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-accent">Sovereign Deployment</p>
          <h2 className="font-display text-2xl md:text-4xl text-foreground">Security Built Your Way</h2>
          <p className="text-muted-foreground">Start with what you need. Scale when you're ready. Your knowledge stays yours.</p>
        </div>
      </ScrollFadeIn>
      <div className="grid gap-6 md:grid-cols-3">
        {OFFERINGS.map((o, i) => (
          <ScrollFadeIn key={o.title} delay={i * 100}>
            <div className="cyberx-panel p-6 space-y-4 h-full flex flex-col">
              <o.icon className="h-10 w-10 text-primary" />
              <h3 className="font-display text-lg text-foreground">{o.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed flex-1">{o.desc}</p>
              <div className="rounded-xl bg-primary/10 border border-primary/20 px-4 py-2.5 text-xs text-primary flex items-start gap-2">
                <CheckCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                {o.badge}
              </div>
            </div>
          </ScrollFadeIn>
        ))}
      </div>
    </div>
  </section>
);

export default OfferingsSection;
