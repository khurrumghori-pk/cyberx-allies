import { useState } from "react";
import { CyberXLayout } from "@/components/cyberx/CyberXLayout";
import { Button } from "@/components/ui/button";
import { PlugZap, CheckCircle, XCircle, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const INTEGRATIONS = [
  { id: "splunk", label: "Splunk SIEM", category: "SIEM", status: "connected", desc: "Full telemetry ingestion via HEC. 12,400 events/min." },
  { id: "sentinel", label: "Microsoft Sentinel", category: "SIEM", status: "connected", desc: "Automated analytic rule sync enabled." },
  { id: "qradar", label: "IBM QRadar", category: "SIEM", status: "disconnected", desc: "API token required for connection." },
  { id: "crowdstrike", label: "CrowdStrike Falcon", category: "EDR", status: "connected", desc: "Real-time endpoint telemetry via Streaming API." },
  { id: "sentinelone", label: "SentinelOne", category: "EDR", status: "pending", desc: "OAuth handshake in progress." },
  { id: "defender", label: "Microsoft Defender", category: "EDR", status: "connected", desc: "Alert enrichment enabled." },
  { id: "palo", label: "Palo Alto XSOAR", category: "SOAR", status: "connected", desc: "Playbook orchestration active. 34 playbooks synced." },
  { id: "phantom", label: "Splunk SOAR (Phantom)", category: "SOAR", status: "disconnected", desc: "Requires on-prem connector agent." },
  { id: "demisto", label: "Cortex XSIAM", category: "SOAR", status: "pending", desc: "Onboarding in progress." },
];

const STATUS_CONFIG: Record<string, { icon: typeof CheckCircle; color: string; label: string }> = {
  connected: { icon: CheckCircle, color: "text-accent", label: "Connected" },
  disconnected: { icon: XCircle, color: "text-destructive", label: "Disconnected" },
  pending: { icon: PlugZap, color: "text-yellow-400", label: "Pending" },
};

const CATS = ["All", "SIEM", "EDR", "SOAR"];

export function IntegrationPanelPage() {
  const [cat, setCat] = useState("All");
  const filtered = cat === "All" ? INTEGRATIONS : INTEGRATIONS.filter((i) => i.category === cat);

  return (
    <CyberXLayout title="Integration Panel" breadcrumb={["CyberX", "Integrations"]}>
      <div className="flex gap-2">
        {CATS.map((c) => (
          <button key={c} onClick={() => setCat(c)} className={cn("rounded-lg border px-4 py-2 text-sm", cat === c ? "border-primary bg-primary/10 text-foreground" : "border-border bg-secondary/50 text-muted-foreground hover:border-primary/50")}>
            {c}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((integration) => {
          const cfg = STATUS_CONFIG[integration.status];
          const Icon = cfg.icon;
          return (
            <div key={integration.id} className="cyberx-panel p-5 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold">{integration.label}</p>
                  <p className="text-xs text-muted-foreground">{integration.category}</p>
                </div>
                <Icon className={cn("h-5 w-5 shrink-0", cfg.color)} />
              </div>
              <p className="text-sm text-muted-foreground">{integration.desc}</p>
              <div className="flex gap-2">
                <Button size="sm" variant={integration.status === "connected" ? "neon" : "hero"} className="flex-1">
                  <Settings className="h-3.5 w-3.5" />
                  {integration.status === "connected" ? "Configure" : "Connect"}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </CyberXLayout>
  );
}
