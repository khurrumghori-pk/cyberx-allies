import { UserCog, FileText, Bot, Network, Radio, Landmark, ShieldCheck, Globe2, Cpu } from "lucide-react";
import { cn } from "@/lib/utils";
import ScrollFadeIn from "@/components/cyberx/ScrollFadeIn";
import type { IndustryId } from "./IndustryToggle";

interface Advisor {
  icon: React.ElementType;
  name: string;
  desc: string;
}

const ADVISORS_BY_INDUSTRY: Record<IndustryId, Advisor[]> = {
  banking: [
    { icon: UserCog, name: "vCISO (Financial)", desc: "Strategic risk posture, board reporting, FFIEC guidelines, SLA tracking with human‑in‑the‑loop." },
    { icon: FileText, name: "Compliance & Audit", desc: "Continuous PCI/SOX validation, evidence generation, audit‑ready exports." },
    { icon: Bot, name: "Fraud Intelligence", desc: "Correlates transaction patterns with global threat intel, maps blast radius." },
    { icon: Network, name: "Third‑party Risk", desc: "Automated vendor assessment, continuous monitoring, ownership mapping." },
  ],
  telecom: [
    { icon: Radio, name: "5G Security Advisor", desc: "Monitors core network functions, slices, edge — with asset ownership and blast radius." },
    { icon: Cpu, name: "Subscriber Protection", desc: "Detects SIM swap, signaling anomalies, maps affected users." },
    { icon: Globe2, name: "Threat Intelligence", desc: "Correlates IOCs with 5G telemetry, updates risk register, tracks SLAs." },
    { icon: Bot, name: "Incident Response", desc: "Automated playbooks with human approval & audit trail." },
  ],
  government: [
    { icon: Landmark, name: "vCISO (Public Sector)", desc: "Strategic alignment with FISMA, NIST CSF, risk register & SLA enforcement." },
    { icon: ShieldCheck, name: "Compliance & Audit", desc: "FedRAMP continuous monitoring, evidence automation, audit‑ready exports." },
    { icon: Network, name: "Cross‑agency Coordination", desc: "Secure information sharing, persistent org context, approval workflows." },
    { icon: Globe2, name: "Threat Intelligence (Gov)", desc: "Classified‑feeds integration, early warning, blast radius analysis." },
  ],
};

const IndustryAdvisors = ({ industry }: { industry: IndustryId }) => {
  const advisors = ADVISORS_BY_INDUSTRY[industry];
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {advisors.map((a, i) => (
        <ScrollFadeIn key={a.name} delay={i * 80}>
          <div className="cyberx-panel p-5 space-y-3 h-full">
            <div className="h-12 w-12 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center">
              <a.icon className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground text-sm">{a.name}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">{a.desc}</p>
          </div>
        </ScrollFadeIn>
      ))}
    </div>
  );
};

export default IndustryAdvisors;
