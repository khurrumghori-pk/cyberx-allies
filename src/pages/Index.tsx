import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Shield, Brain, Users, BarChart2, Zap, Lock, Globe, ArrowRight,
  MessageSquare, Bot, Bell, Download, ChevronRight, CheckCircle, Star
} from "lucide-react";
import { cn } from "@/lib/utils";
import HeroDemoWalkthrough from "@/components/cyberx/HeroDemoWalkthrough";
import ScrollFadeIn from "@/components/cyberx/ScrollFadeIn";

const METRICS = [
  { value: "6", label: "AI Advisors", sub: "Active digital twins" },
  { value: "98.7%", label: "Threat Detection", sub: "Accuracy rate" },
  { value: "<3s", label: "Response Time", sub: "Mean time to advise" },
  { value: "24/7", label: "Autonomous Ops", sub: "Zero downtime" },
];

const FEATURES = [
  {
    icon: Users,
    title: "Multi-Agent Orchestration",
    desc: "4+ AI advisors collaborate in real-time with confidence scoring and consensus voting per SRS §11 protocol.",
    color: "text-primary",
    bg: "bg-primary/10 border-primary/30",
  },
  {
    icon: Brain,
    title: "Collective Cyber Memory",
    desc: "Persistent institutional knowledge graph — incidents, threat actors, and decisions indexed across your entire security history.",
    color: "text-accent",
    bg: "bg-accent/10 border-accent/30",
  },
  {
    icon: Bot,
    title: "6-Step Advisor Builder",
    desc: "Create custom security advisors with role templates, knowledge upload, persona tuning, and AI-powered training pipeline.",
    color: "text-[hsl(38_95%_55%)]",
    bg: "bg-[hsl(38_95%_55%)]/10 border-[hsl(38_95%_55%)]/30",
  },
  {
    icon: Bell,
    title: "Real-Time Threat Alerts",
    desc: "Proactive notifications via websocket — AI-generated threat intelligence delivered to your device instantly.",
    color: "text-destructive",
    bg: "bg-destructive/10 border-destructive/30",
  },
  {
    icon: Lock,
    title: "Zero Trust Governance",
    desc: "RBAC, data residency controls, audit logging, and compliance mapping to NIST CSF, ISO 27001, SOC 2, and GDPR.",
    color: "text-[hsl(267_90%_66%)]",
    bg: "bg-[hsl(267_90%_66%)]/10 border-[hsl(267_90%_66%)]/30",
  },
  {
    icon: Globe,
    title: "20+ Security Integrations",
    desc: "Splunk, CrowdStrike, Microsoft Sentinel, XSOAR, VirusTotal, Qualys — bidirectional data flow across your stack.",
    color: "text-primary",
    bg: "bg-primary/10 border-primary/30",
  },
];

const ADVISORS_PREVIEW = [
  { name: "SOC Analyst", tier: "Tier 1", role: "Alert Triage & SIEM" },
  { name: "Threat Intel", tier: "Tier 1", role: "APT Tracking & OSINT" },
  { name: "IR Advisor", tier: "Tier 2", role: "Containment & Recovery" },
  { name: "vCISO", tier: "Leadership", role: "Risk & Board Reporting" },
  { name: "Malware Analyst", tier: "Tier 2", role: "Reverse Engineering" },
  { name: "Threat Hunter", tier: "Tier 3", role: "Proactive Hunting" },
];

const TESTIMONIALS = [
  { quote: "CyberX reduced our mean-time-to-respond by 74%. The multi-agent collaboration is unlike anything else.", author: "CISO", company: "Fortune 500 Financial" },
  { quote: "We replaced 3 point tools with CyberX. The institutional memory alone is worth 10x the investment.", author: "VP Security Ops", company: "Global Healthcare" },
];

const Index = () => {
  return (
    <main className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="font-display text-lg tracking-wide text-foreground">CyberX</span>
            <span className="cyberx-pill text-[9px] ml-1">ADVISORS</span>
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
        
        <div className="relative mx-auto max-w-7xl px-6 pt-12">
          <div className="text-center space-y-6 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs text-primary">
              <Zap className="h-3 w-3" /> Agentic Sovereign AI for Cybersecurity
            </div>
            
            <h1 className="font-display text-4xl md:text-6xl leading-tight text-foreground">
              Beyond Assistants.<br />
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                Cybersecurity Counterparts.
              </span>
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Enterprise-grade AI digital twins for SOC operations, threat intelligence, and security governance — with persistent institutional memory and multi-agent decisioning.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 pt-2">
              <Button asChild variant="hero" size="lg" className="text-base px-8">
                <Link to="/auth">
                  Start Free Trial <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="neon" size="lg" className="text-base px-8">
                <Link to="/install">
                  <Download className="mr-2 h-4 w-4" /> Install App
                </Link>
              </Button>
            </div>
          </div>

          {/* Animated product demo */}
          <div className="mt-16">
            <HeroDemoWalkthrough />
          </div>
        </div>
      </section>

      {/* Metrics */}
      <section className="py-16 border-y border-border/40 bg-secondary/30">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {METRICS.map((m, i) => (
              <ScrollFadeIn key={m.label} delay={i * 100}>
                <div className="text-center space-y-1">
                  <p className="font-display text-3xl md:text-4xl text-foreground">{m.value}</p>
                  <p className="text-sm font-semibold text-primary">{m.label}</p>
                  <p className="text-xs text-muted-foreground">{m.sub}</p>
                </div>
              </ScrollFadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <ScrollFadeIn>
            <div className="text-center mb-16 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">Platform Capabilities</p>
              <h2 className="font-display text-3xl md:text-4xl text-foreground">
                Enterprise Security, Reimagined with AI
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Every feature built to SRS specification — from multi-agent orchestration to zero trust governance.
              </p>
            </div>
          </ScrollFadeIn>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => (
              <ScrollFadeIn key={f.title} delay={i * 80}>
                <div className={cn("rounded-2xl border p-6 space-y-3 transition-all hover:scale-[1.02] h-full", f.bg)}>
                  <f.icon className={cn("h-8 w-8", f.color)} />
                  <h3 className="font-display text-lg text-foreground">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              </ScrollFadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Advisor Lineup */}
      <section className="py-20 bg-secondary/30 border-y border-border/40">
        <div className="mx-auto max-w-7xl px-6">
          <ScrollFadeIn>
            <div className="text-center mb-12 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-accent">AI Advisor Roster</p>
              <h2 className="font-display text-3xl text-foreground">6 Specialized Digital Twins</h2>
            </div>
          </ScrollFadeIn>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ADVISORS_PREVIEW.map((a, i) => (
              <ScrollFadeIn key={a.name} delay={i * 80}>
                <div className="cyberx-panel p-5 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center">
                    <Bot className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{a.name}</p>
                    <p className="text-xs text-muted-foreground">{a.role}</p>
                  </div>
                  <span className="ml-auto cyberx-pill text-[10px]">{a.tier}</span>
                </div>
              </ScrollFadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20">
        <div className="mx-auto max-w-5xl px-6">
          <ScrollFadeIn>
            <div className="text-center mb-12 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">Trusted by Security Leaders</p>
              <h2 className="font-display text-3xl text-foreground">What CISOs Are Saying</h2>
            </div>
          </ScrollFadeIn>

          <div className="grid gap-6 md:grid-cols-2">
            {TESTIMONIALS.map((t, i) => (
              <ScrollFadeIn key={i} delay={i * 120}>
                <div className="cyberx-panel p-6 space-y-4">
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map(s => <Star key={s} className="h-4 w-4 fill-primary text-primary" />)}
                  </div>
                  <p className="text-sm text-foreground italic leading-relaxed">"{t.quote}"</p>
                  <div className="text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">{t.author}</span> · {t.company}
                  </div>
                </div>
              </ScrollFadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <ScrollFadeIn>
        <div className="mx-auto max-w-3xl px-6">
          <div className="cyberx-panel cyberx-signature-glow p-10 text-center space-y-6">
            <Shield className="h-12 w-12 text-primary mx-auto" />
            <h2 className="font-display text-3xl text-foreground">
              Ready to Transform Your Security Operations?
            </h2>
            <p className="text-muted-foreground">
              Start with a free trial. No credit card required. Deploy AI advisors in minutes.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild variant="hero" size="lg" className="text-base px-8">
                <Link to="/auth">
                  Get Started Free <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-base px-8">
                <Link to="/advisors/dashboard">
                  <MessageSquare className="mr-2 h-4 w-4" /> View Live Demo
                </Link>
              </Button>
            </div>
            <div className="flex justify-center gap-6 pt-2 text-xs text-muted-foreground">
              {["SOC 2 Compliant", "NIST CSF Aligned", "Zero Trust Architecture"].map(b => (
                <span key={b} className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3 text-accent" /> {b}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8">
        <div className="mx-auto max-w-7xl px-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="h-4 w-4 text-primary" />
            <span>© 2026 CyberX Advisors. All rights reserved.</span>
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
