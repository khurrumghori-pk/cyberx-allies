import { useState } from "react";
import { CyberXLayout } from "@/components/cyberx/CyberXLayout";
import { Button } from "@/components/ui/button";
import { Download, Star, ShieldCheck } from "lucide-react";

const MARKETPLACE_ADVISORS = [
  { id: "m1", name: "RedTeam Emulator", tier: "Premium", tags: ["Red Team", "Offensive"], rating: 4.8, installs: 412, description: "Simulates advanced threat actor TTPs for proactive defense validation. MITRE-mapped attack chains." },
  { id: "m2", name: "Compliance Shield Advisor", tier: "Enterprise", tags: ["Compliance", "Governance"], rating: 4.6, installs: 310, description: "Automates audit preparation for PCI-DSS, ISO27001, SOC2, and NIST CSF frameworks." },
  { id: "m3", name: "OT/ICS Security Advisor", tier: "Specialty", tags: ["OT", "ICS", "SCADA"], rating: 4.9, installs: 189, description: "Specialized advisor for operational technology environments, IEC 62443 compliance, and PLC threat analysis." },
  { id: "m4", name: "Cloud Security Advisor", tier: "Standard", tags: ["Cloud", "AWS", "Azure"], rating: 4.5, installs: 530, description: "Monitors cloud misconfigurations, IAM drift, and cross-cloud threat movement in real time." },
  { id: "m5", name: "Insider Threat Advisor", tier: "Premium", tags: ["Insider", "UEBA"], rating: 4.7, installs: 275, description: "Behavioral baseline engine detects anomalous user patterns with UEBA integration support." },
  { id: "m6", name: "Threat Hunting Advisor", tier: "Standard", tags: ["Hunting", "Hypothesis"], rating: 4.9, installs: 601, description: "Generates proactive hunt hypotheses from MITRE ATT&CK, threat reports, and historical telemetry." },
];

const TIER_COLORS: Record<string, string> = { Premium: "text-[hsl(48_96%_53%)]", Enterprise: "text-[hsl(267_90%_66%)]", Specialty: "text-accent", Standard: "text-primary" };

export function AdvisorMarketplacePage() {
  const [installed, setInstalled] = useState<Set<string>>(new Set(["m4", "m6"]));

  return (
    <CyberXLayout title="Advisor Marketplace" breadcrumb={["CyberX", "Marketplace"]}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {MARKETPLACE_ADVISORS.map((a) => (
          <div key={a.id} className="cyberx-panel p-5 space-y-3 hover:border-primary/40 transition-all">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold">{a.name}</h3>
                <span className={`text-xs font-medium ${TIER_COLORS[a.tier]}`}>{a.tier}</span>
              </div>
              {installed.has(a.id) && <ShieldCheck className="h-5 w-5 shrink-0 text-accent" />}
            </div>
            <p className="text-sm text-muted-foreground">{a.description}</p>
            <div className="flex flex-wrap gap-2">
              {a.tags.map((t) => <span key={t} className="cyberx-pill">{t}</span>)}
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                {a.rating} · {a.installs} installs
              </div>
              <Button
                size="sm"
                variant={installed.has(a.id) ? "neon" : "hero"}
                onClick={() => setInstalled((p) => { const n = new Set(p); n.has(a.id) ? n.delete(a.id) : n.add(a.id); return n; })}
              >
                <Download className="h-3.5 w-3.5" />
                {installed.has(a.id) ? "Uninstall" : "Install"}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </CyberXLayout>
  );
}
