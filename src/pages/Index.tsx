import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar, ArrowRight } from "lucide-react";
import ScrollFadeIn from "@/components/cyberx/ScrollFadeIn";
import HeroSection from "@/components/cyberx/landing/HeroSection";
import IndustryToggle, { type IndustryId } from "@/components/cyberx/landing/IndustryToggle";
import ChallengeSection from "@/components/cyberx/landing/ChallengeSection";
import SolutionSection from "@/components/cyberx/landing/SolutionSection";
import CoreCapabilitiesSection from "@/components/cyberx/landing/CoreCapabilitiesSection";
import OfferingsSection from "@/components/cyberx/landing/OfferingsSection";
import StepsSection from "@/components/cyberx/landing/StepsSection";
import FAQSection from "@/components/cyberx/landing/FAQSection";
import IndustryAdvisors from "@/components/cyberx/landing/IndustryAdvisors";

const Index = () => {
  const [industry, setIndustry] = useState<IndustryId>("banking");

  return (
    <main className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 border border-border/30 flex items-center justify-center">
              <span className="font-display text-sm text-foreground">AX</span>
            </div>
            <span className="font-display text-base tracking-wide text-foreground">
              CyberX Advisors
            </span>
          </div>
          <div className="hidden md:flex items-center gap-1">
            {[
              { label: "Vision", id: "vision" },
              { label: "Platform", id: "platform" },
              { label: "Capabilities", id: "capabilities" },
              { label: "Engagement", id: "engagement" },
              { label: "Advisors", id: "advisors" },
              { label: "FAQ", id: "faq" },
            ].map((nav) => (
              <button
                key={nav.id}
                onClick={() => document.getElementById(nav.id)?.scrollIntoView({ behavior: "smooth" })}
                className="px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-secondary/50"
              >
                {nav.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="sm">
              <Link to="/auth">Sign In</Link>
            </Button>
            <Button asChild variant="hero" size="sm">
              <Link to="/auth">Get Started</Link>
            </Button>
          </div>
        </div>
      </nav>

      <HeroSection />

      <div id="vision"><ChallengeSection /></div>
      <div id="platform"><SolutionSection /></div>
      <div id="capabilities"><CoreCapabilitiesSection /></div>
      <div id="engagement"><OfferingsSection /></div>
      <div id="steps"><StepsSection /></div>

      <div id="advisors">
        <section className="py-20 bg-secondary/30 border-y border-border/40">
          <div className="mx-auto max-w-7xl px-6">
            <ScrollFadeIn>
              <div className="text-center mb-8 space-y-2">
                <p className="text-xs font-semibold uppercase tracking-widest text-accent">Sector expertise</p>
                <h2 className="font-display text-2xl md:text-4xl text-foreground">Industry AI Advisors</h2>
              </div>
              <div className="flex justify-center mb-8">
                <IndustryToggle active={industry} onChange={setIndustry} />
              </div>
            </ScrollFadeIn>
            <IndustryAdvisors industry={industry} />
          </div>
        </section>
      </div>

      <div id="faq"><FAQSection /></div>

      {/* Final CTA */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-6">
          <ScrollFadeIn>
            <div
              className="relative rounded-2xl border border-border/30 overflow-hidden p-10 md:p-14 text-center space-y-5"
              style={{
                background: "radial-gradient(circle at top right, hsl(var(--primary) / 0.12), transparent 40%), radial-gradient(circle at bottom left, hsl(var(--accent) / 0.14), transparent 40%), linear-gradient(180deg, hsl(var(--card)), hsl(var(--background)))",
              }}
            >
              <h2 className="font-display text-2xl md:text-3xl text-foreground">
                Ready to lead faster than threats evolve?
              </h2>
              <div className="flex flex-wrap justify-center gap-4">
                <Button asChild variant="hero" size="lg" className="text-base px-8">
                  <Link to="/auth">
                    <Calendar className="mr-2 h-4 w-4" /> Book a Briefing
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="text-base px-8">
                  <Link to="/auth">
                    Request Pilot <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </ScrollFadeIn>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-6">
        <div className="mx-auto max-w-7xl px-6 flex flex-wrap items-center justify-between gap-4">
          <span className="text-sm font-semibold text-foreground">AIgilityX CyberX Advisors</span>
          <span className="text-xs text-muted-foreground">© 2026 · Human‑led. AI‑accelerated.</span>
        </div>
      </footer>
    </main>
  );
};

export default Index;
