import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Shield, Zap, ArrowRight, Download, ChevronRight, CheckCircle,
  MessageSquare, Calendar
} from "lucide-react";
import ScrollFadeIn from "@/components/cyberx/ScrollFadeIn";
import HeroDemoWalkthrough from "@/components/cyberx/HeroDemoWalkthrough";
import IndustryToggle, { type IndustryId } from "@/components/cyberx/landing/IndustryToggle";
import ChallengeSection from "@/components/cyberx/landing/ChallengeSection";
import SolutionSection from "@/components/cyberx/landing/SolutionSection";
import ResultsStats from "@/components/cyberx/landing/ResultsStats";
import StepsSection from "@/components/cyberx/landing/StepsSection";
import CollaborativeSection from "@/components/cyberx/landing/CollaborativeSection";
import IntegrationsStrip from "@/components/cyberx/landing/IntegrationsStrip";
import OfferingsSection from "@/components/cyberx/landing/OfferingsSection";
import IndustryAdvisors from "@/components/cyberx/landing/IndustryAdvisors";
import RoadmapSection from "@/components/cyberx/landing/RoadmapSection";

const Index = () => {
  const [industry, setIndustry] = useState<IndustryId>("banking");

  return (
    <main className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="font-display text-lg tracking-wide text-foreground">
              AIgilityX <span className="text-muted-foreground font-normal">|</span> CyberX Advisors
            </span>
            <span className="cyberx-pill text-[9px] ml-1">V2</span>
          </div>
          <div className="hidden md:flex items-center gap-1">
            {[
              { label: "Challenge", id: "challenge" },
              { label: "Platform", id: "platform" },
              { label: "Results", id: "results" },
              { label: "How It Works", id: "steps" },
              { label: "Advisors", id: "advisors" },
              { label: "Roadmap", id: "roadmap" },
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

      {/* Hero */}
      <section className="relative pt-24 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-primary/5 blur-[120px]" />

        <div className="relative mx-auto max-w-7xl px-6 pt-8">
          <div className="text-center space-y-6 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs text-primary">
              <Zap className="h-3 w-3" /> Agentic Sovereign AI for Cybersecurity
            </div>

            <h1 className="font-display text-4xl md:text-6xl leading-tight text-foreground">
              Beyond Assistants.{" "}
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                Cybersecurity Counterparts.
              </span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Enterprise‑grade AI digital twins for SOC operations, threat intelligence, and security governance — with persistent institutional memory and multi‑agent decisioning.
            </p>

            <div className="flex flex-wrap justify-center gap-4 pt-2">
              <Button asChild variant="hero" size="lg" className="text-base px-8">
                <Link to="/auth">
                  <Calendar className="mr-2 h-4 w-4" /> Request Demo
                </Link>
              </Button>
              <Button asChild variant="neon" size="lg" className="text-base px-8">
                <Link to="/install">
                  <Download className="mr-2 h-4 w-4" /> Install App
                </Link>
              </Button>
            </div>
          </div>

          <div className="mt-16">
            <HeroDemoWalkthrough />
          </div>
        </div>
      </section>

      {/* Challenge: Headcount Gap */}
      <ChallengeSection />

      {/* Solution */}
      <SolutionSection />

      {/* Results Stats */}
      <ResultsStats />

      {/* Steps */}
      <StepsSection />

      {/* Collaborative Experience */}
      <CollaborativeSection />

      {/* Integrations */}
      <IntegrationsStrip />

      {/* Offerings */}
      <OfferingsSection />

      {/* Industry-specific Advisors */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <ScrollFadeIn>
            <div className="text-center mb-8 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-accent">Sector Expertise</p>
              <h2 className="font-display text-2xl md:text-4xl text-foreground">Industry‑Specific AI Advisors</h2>
              <p className="text-muted-foreground">Select your sector to see dedicated advisor roles:</p>
            </div>
            <div className="flex justify-center mb-8">
              <IndustryToggle active={industry} onChange={setIndustry} />
            </div>
          </ScrollFadeIn>
          <IndustryAdvisors industry={industry} />
        </div>
      </section>

      {/* Roadmap */}
      <RoadmapSection />

      {/* Final CTA */}
      <ScrollFadeIn>
        <div className="mx-auto max-w-3xl px-6 mb-16">
          <div className="cyberx-panel cyberx-signature-glow p-10 text-center space-y-6">
            <Shield className="h-12 w-12 text-primary mx-auto" />
            <h2 className="font-display text-2xl md:text-3xl text-foreground">
              Your Sovereign Cyber Defense Starts Here
            </h2>
            <p className="text-muted-foreground">
              Deploy CyberX Advisors — digital twins that preserve your institutional knowledge, learn continuously, and never leave your organization.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild variant="hero" size="lg" className="text-base px-8">
                <Link to="/auth">
                  Request a Demo <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-base px-8">
                <Link to="/advisors/dashboard">
                  <MessageSquare className="mr-2 h-4 w-4" /> View Live Demo
                </Link>
              </Button>
            </div>
            <div className="flex flex-wrap justify-center gap-6 pt-2 text-xs text-muted-foreground">
              {["70% Triage Offloaded", "MTTD Cut by 40%", "MTTR Reduced 50%", "Continuous Compliance"].map((b) => (
                <span key={b} className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3 text-accent" /> {b}
                </span>
              ))}
            </div>
          </div>
        </div>
      </ScrollFadeIn>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8">
        <div className="mx-auto max-w-7xl px-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="h-4 w-4 text-primary" />
            <span>© 2026 AIgilityX CyberX Advisors · Agentic AI · Human‑Machine Symbiosis</span>
          </div>
          <div className="flex gap-4 text-xs text-muted-foreground">
            <Link to="/auth" className="hover:text-foreground">Sign In</Link>
            <Link to="/install" className="hover:text-foreground">Install App</Link>
            <Link to="/advisors/dashboard" className="hover:text-foreground">Dashboard</Link>
          </div>
        </div>
      </footer>
    </main>
  );
};

export default Index;
