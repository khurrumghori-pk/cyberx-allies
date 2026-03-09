import { useState } from "react";
import { CyberXLayout } from "@/components/cyberx/CyberXLayout";
import { Button } from "@/components/ui/button";
import { Check, ChevronRight, Shield, BookOpen, Brain, Database, Play } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  { id: 1, label: "Role Selection", icon: Shield },
  { id: 2, label: "Knowledge Upload", icon: BookOpen },
  { id: 3, label: "Personality", icon: Brain },
  { id: 4, label: "Memory Setup", icon: Database },
  { id: 5, label: "Simulation", icon: Play },
];

const ROLES = ["SOC Analyst", "Threat Intel Advisor", "Incident Response Advisor", "Malware Analyst", "Threat Hunter", "vCISO", "Security Architect", "Detection Engineer", "Vulnerability Manager", "Cyber Risk Advisor"];

export function AdvisorBuilderPage() {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState("");
  const [personality, setPersonality] = useState("Analytical");
  const [style, setStyle] = useState("Balanced");

  return (
    <CyberXLayout title="Advisor Builder" breadcrumb={["CyberX", "Builder"]}>
      {/* Step progress */}
      <div className="cyberx-panel p-4">
        <div className="flex items-center gap-0">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center flex-1 last:flex-none">
              <button
                onClick={() => setStep(s.id)}
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-sm font-semibold transition-all",
                  step > s.id ? "border-accent bg-accent/20 text-accent" : step === s.id ? "border-primary bg-primary/20 text-primary" : "border-border bg-secondary text-muted-foreground"
                )}
              >
                {step > s.id ? <Check className="h-4 w-4" /> : <s.icon className="h-4 w-4" />}
              </button>
              <span className={cn("ml-2 hidden text-xs font-medium sm:block", step === s.id ? "text-foreground" : "text-muted-foreground")}>{s.label}</span>
              {i < STEPS.length - 1 && <div className={cn("mx-3 h-px flex-1", step > s.id ? "bg-accent/60" : "bg-border/60")} />}
            </div>
          ))}
        </div>
      </div>

      <div className="cyberx-panel p-6">
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="font-display text-lg">Select Advisor Role</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {ROLES.map((r) => (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  className={cn(
                    "rounded-lg border px-3 py-3 text-left text-sm transition-all hover:border-primary",
                    role === r ? "border-primary bg-primary/10 text-foreground" : "border-border bg-secondary/50 text-muted-foreground"
                  )}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        )}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="font-display text-lg">Knowledge Upload</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {["SOC Playbooks", "Threat Intel Feeds", "MITRE ATT&CK Framework", "CVE Databases", "Incident Reports", "Security Policies"].map((k) => (
                <label key={k} className="flex items-center gap-3 rounded-lg border border-border bg-secondary/50 p-3 cursor-pointer hover:border-primary">
                  <input type="checkbox" defaultChecked={k !== "CVE Databases"} className="accent-primary" />
                  <span className="text-sm">{k}</span>
                </label>
              ))}
            </div>
          </div>
        )}
        {step === 3 && (
          <div className="space-y-5">
            <h2 className="font-display text-lg">Personality Configuration</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Decision Style</label>
                <div className="flex gap-2">
                  {["Conservative", "Balanced", "Aggressive"].map((s) => (
                    <button key={s} onClick={() => setStyle(s)} className={cn("flex-1 rounded-lg border py-2 text-xs", style === s ? "border-primary bg-primary/10 text-foreground" : "border-border bg-secondary/50 text-muted-foreground")}>{s}</button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Communication Style</label>
                <div className="flex gap-2">
                  {["Analyst", "Executive", "Technical"].map((p) => (
                    <button key={p} onClick={() => setPersonality(p)} className={cn("flex-1 rounded-lg border py-2 text-xs", personality === p ? "border-accent bg-accent/10 text-foreground" : "border-border bg-secondary/50 text-muted-foreground")}>{p}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
        {step === 4 && (
          <div className="space-y-4">
            <h2 className="font-display text-lg">Memory Setup</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {["Enable Persistent Incident Memory", "Retain Threat Actor Profiles", "Store Decision History", "Index SOC Workflow Logs", "Build Cyber Knowledge Graph"].map((m) => (
                <label key={m} className="flex items-center gap-3 rounded-lg border border-border bg-secondary/50 p-3 cursor-pointer hover:border-primary">
                  <input type="checkbox" defaultChecked className="accent-primary" />
                  <span className="text-sm">{m}</span>
                </label>
              ))}
            </div>
          </div>
        )}
        {step === 5 && (
          <div className="space-y-4">
            <h2 className="font-display text-lg">Simulation Preview</h2>
            <div className="cyberx-panel rounded-xl p-5 space-y-3 border-primary/30">
              <p className="cyberx-pill">Advisor: {role || "SOC Analyst"}</p>
              <p className="text-sm text-muted-foreground">Test query:</p>
              <p className="rounded-lg bg-secondary/70 px-4 py-3 text-sm font-medium">"How should we respond to a ransomware alert on host 10.4.12.87?"</p>
              <div className="rounded-lg border border-accent/30 bg-accent/5 px-4 py-3 text-sm">
                <span className="font-semibold text-accent">Advisor Response: </span>
                Immediate containment via network isolation is recommended. Cross-referencing against IR-Playbook RW-005. Alerting Incident Response Advisor and vCISO for escalation. Confidence: HIGH.
              </div>
            </div>
            <Button variant="hero" className="w-full">Activate Advisor</Button>
          </div>
        )}

        <div className="mt-6 flex justify-between">
          <Button variant="neon" onClick={() => setStep((p) => Math.max(1, p - 1))} disabled={step === 1}>Back</Button>
          <Button variant="hero" onClick={() => setStep((p) => Math.min(5, p + 1))} disabled={step === 5}>
            {step === 4 ? "Run Simulation" : "Continue"} <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </CyberXLayout>
  );
}
