import { Users, Brain, Blocks, Bell, Lock, Globe } from "lucide-react";
import ScrollFadeIn from "@/components/cyberx/ScrollFadeIn";

const CAPABILITIES = [
  {
    icon: Users,
    title: "Multi‑Agent Orchestration",
    desc: "4+ AI advisors collaborate in real‑time with confidence scoring and consensus voting per SRS §11 protocol.",
    accent: "text-primary",
    border: "border-primary/30",
    bg: "bg-primary/5",
  },
  {
    icon: Brain,
    title: "Collective Cyber Memory",
    desc: "Persistent institutional knowledge graph — incidents, threat actors, and decisions indexed across your entire security history.",
    accent: "text-accent",
    border: "border-accent/30",
    bg: "bg-accent/5",
  },
  {
    icon: Blocks,
    title: "6‑Step Advisor Builder",
    desc: "Create custom security advisors with role templates, knowledge upload, persona tuning, and AI‑powered training pipeline.",
    accent: "text-[hsl(45_100%_60%)]",
    border: "border-[hsl(45_100%_60%)]/30",
    bg: "bg-[hsl(45_100%_60%)]/5",
  },
  {
    icon: Bell,
    title: "Real‑Time Threat Alerts",
    desc: "Proactive notifications via websocket — AI‑generated threat intelligence delivered to your device instantly.",
    accent: "text-destructive",
    border: "border-destructive/30",
    bg: "bg-destructive/5",
  },
  {
    icon: Lock,
    title: "Zero Trust Governance",
    desc: "RBAC, data residency controls, audit logging, and compliance mapping to NIST CSF, ISO 27001, SOC 2, and GDPR.",
    accent: "text-[hsl(270_80%_70%)]",
    border: "border-[hsl(270_80%_70%)]/30",
    bg: "bg-[hsl(270_80%_70%)]/5",
  },
  {
    icon: Globe,
    title: "20+ Security Integrations",
    desc: "Splunk, CrowdStrike, Microsoft Sentinel, XSOAR, VirusTotal, Qualys — bidirectional data flow across your stack.",
    accent: "text-primary",
    border: "border-primary/30",
    bg: "bg-primary/5",
  },
];

const SolutionSection = () => (
  <section className="py-20">
    <div className="mx-auto max-w-7xl px-6">
      <ScrollFadeIn>
        <div className="text-center mb-12 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">Platform Capabilities</p>
          <h2 className="font-display text-2xl md:text-4xl text-foreground">
            Enterprise Security, Reimagined with AI
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Every feature built to SRS specification — from multi‑agent orchestration to zero trust governance.
          </p>
        </div>
      </ScrollFadeIn>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {CAPABILITIES.map((c, i) => (
          <ScrollFadeIn key={c.title} delay={i * 80}>
            <div
              className={`rounded-xl border ${c.border} ${c.bg} backdrop-blur-sm p-6 space-y-3 h-full hover:bg-card/60 transition-colors`}
            >
              <c.icon className={`h-8 w-8 ${c.accent}`} />
              <h3 className="font-display text-lg text-foreground">{c.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{c.desc}</p>
            </div>
          </ScrollFadeIn>
        ))}
      </div>
    </div>
  </section>
);

export default SolutionSection;
