import { useState } from "react";
import { CyberXLayout } from "@/components/cyberx/CyberXLayout";
import { Button } from "@/components/ui/button";
import { PlugZap, CheckCircle, XCircle, Settings, RefreshCw, Shield, Database, AlertTriangle, Cloud, Key, Ticket } from "lucide-react";
import { cn } from "@/lib/utils";

// SRS Section 4: Full Integration Points
const INTEGRATIONS = [
  // SIEM
  { id: "splunk", label: "Splunk SIEM", category: "SIEM", status: "connected", desc: "Full telemetry ingestion via HEC. 12,400 events/min.", dataFlow: "Bidirectional" },
  { id: "sentinel", label: "Microsoft Sentinel", category: "SIEM", status: "connected", desc: "Automated analytic rule sync. KQL queries enabled.", dataFlow: "Bidirectional" },
  { id: "qradar", label: "IBM QRadar", category: "SIEM", status: "disconnected", desc: "API token required for log correlation.", dataFlow: "Read" },
  { id: "elastic", label: "Elastic Security", category: "SIEM", status: "pending", desc: "Elasticsearch connector configuring.", dataFlow: "Bidirectional" },
  // EDR
  { id: "crowdstrike", label: "CrowdStrike Falcon", category: "EDR", status: "connected", desc: "Real-time endpoint telemetry via Streaming API.", dataFlow: "Read" },
  { id: "sentinelone", label: "SentinelOne", category: "EDR", status: "pending", desc: "OAuth handshake in progress.", dataFlow: "Read" },
  { id: "defender", label: "Microsoft Defender", category: "EDR", status: "connected", desc: "Alert enrichment and response actions enabled.", dataFlow: "Bidirectional" },
  // SOAR
  { id: "palo", label: "Palo Alto XSOAR", category: "SOAR", status: "connected", desc: "Playbook orchestration active. 34 playbooks synced.", dataFlow: "Bidirectional" },
  { id: "phantom", label: "Splunk SOAR", category: "SOAR", status: "disconnected", desc: "Requires on-prem connector agent.", dataFlow: "Bidirectional" },
  { id: "xsiam", label: "Cortex XSIAM", category: "SOAR", status: "pending", desc: "Onboarding in progress.", dataFlow: "Bidirectional" },
  // Threat Intel
  { id: "stix", label: "STIX/TAXII Feeds", category: "Threat Intel", status: "connected", desc: "Automated IOC ingestion from ISAC feeds.", dataFlow: "Read" },
  { id: "mandiant", label: "Mandiant Intel", category: "Threat Intel", status: "connected", desc: "APT attribution and campaign tracking.", dataFlow: "Read" },
  { id: "virustotal", label: "VirusTotal", category: "Threat Intel", status: "connected", desc: "Malware hash lookups and file analysis.", dataFlow: "Read" },
  // Vuln Scanners
  { id: "qualys", label: "Qualys VMDR", category: "Vuln Scanners", status: "connected", desc: "Vulnerability scan reports synced daily. 2,400 assets.", dataFlow: "Read" },
  { id: "tenable", label: "Tenable Nessus", category: "Vuln Scanners", status: "disconnected", desc: "API key required for integration.", dataFlow: "Read" },
  // IAM / Cloud
  { id: "okta", label: "Okta IAM", category: "IAM/Cloud", status: "connected", desc: "User privilege data and MFA status monitoring.", dataFlow: "Read" },
  { id: "aws", label: "AWS Security Hub", category: "IAM/Cloud", status: "pending", desc: "CloudTrail and GuardDuty integration.", dataFlow: "Read" },
  // Ticketing
  { id: "servicenow", label: "ServiceNow ITSM", category: "Ticketing", status: "connected", desc: "Incident ticket creation and status sync.", dataFlow: "Bidirectional" },
  { id: "jira", label: "Jira Security", category: "Ticketing", status: "disconnected", desc: "Task tracking and vulnerability remediation.", dataFlow: "Bidirectional" },
  // Knowledge
  { id: "confluence", label: "Confluence Wiki", category: "Knowledge", status: "connected", desc: "Playbooks and policy docs auto-indexed.", dataFlow: "Read" },
  { id: "sharepoint", label: "SharePoint", category: "Knowledge", status: "pending", desc: "Document library sync pending approval.", dataFlow: "Read" },
];

const STATUS_CONFIG: Record<string, { icon: typeof CheckCircle; color: string; label: string }> = {
  connected: { icon: CheckCircle, color: "text-accent", label: "Connected" },
  disconnected: { icon: XCircle, color: "text-destructive", label: "Disconnected" },
  pending: { icon: RefreshCw, color: "text-yellow-400", label: "Pending" },
};

const CATEGORY_ICONS: Record<string, typeof Shield> = {
  SIEM: Database,
  EDR: Shield,
  SOAR: RefreshCw,
  "Threat Intel": AlertTriangle,
  "Vuln Scanners": AlertTriangle,
  "IAM/Cloud": Cloud,
  Ticketing: Ticket,
  Knowledge: Key,
};

const CATS = ["All", "SIEM", "EDR", "SOAR", "Threat Intel", "Vuln Scanners", "IAM/Cloud", "Ticketing", "Knowledge"];

export function IntegrationPanelPage() {
  const [cat, setCat] = useState("All");
  const filtered = cat === "All" ? INTEGRATIONS : INTEGRATIONS.filter((i) => i.category === cat);

  const stats = {
    connected: INTEGRATIONS.filter((i) => i.status === "connected").length,
    pending: INTEGRATIONS.filter((i) => i.status === "pending").length,
    disconnected: INTEGRATIONS.filter((i) => i.status === "disconnected").length,
  };

  return (
    <CyberXLayout title="Integration Panel" breadcrumb={["CyberX", "Integrations"]}>
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="cyberx-kpi flex items-center gap-3">
          <CheckCircle className="h-6 w-6 text-accent" />
          <div>
            <p className="font-display text-xl text-foreground">{stats.connected}</p>
            <p className="text-xs text-muted-foreground">Connected</p>
          </div>
        </div>
        <div className="cyberx-kpi flex items-center gap-3">
          <RefreshCw className="h-6 w-6 text-yellow-400" />
          <div>
            <p className="font-display text-xl text-foreground">{stats.pending}</p>
            <p className="text-xs text-muted-foreground">Pending</p>
          </div>
        </div>
        <div className="cyberx-kpi flex items-center gap-3">
          <XCircle className="h-6 w-6 text-destructive" />
          <div>
            <p className="font-display text-xl text-foreground">{stats.disconnected}</p>
            <p className="text-xs text-muted-foreground">Disconnected</p>
          </div>
        </div>
      </div>

      {/* Category filters */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {CATS.map((c) => (
          <button key={c} onClick={() => setCat(c)} className={cn("rounded-lg border px-3 py-2 text-xs whitespace-nowrap", cat === c ? "border-primary bg-primary/10 text-foreground" : "border-border bg-secondary/50 text-muted-foreground hover:border-primary/50")}>
            {c} {c !== "All" && <span className="ml-1 text-[10px]">({INTEGRATIONS.filter((i) => i.category === c).length})</span>}
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
                  <p className="font-semibold text-foreground">{integration.label}</p>
                  <p className="text-xs text-muted-foreground">{integration.category}</p>
                </div>
                <Icon className={cn("h-5 w-5 shrink-0", cfg.color)} />
              </div>
              <p className="text-sm text-muted-foreground">{integration.desc}</p>
              <div className="flex items-center justify-between">
                <span className="text-[10px] px-2 py-0.5 rounded bg-secondary border border-border text-muted-foreground">
                  {integration.dataFlow}
                </span>
                <Button size="sm" variant={integration.status === "connected" ? "neon" : "hero"} className="h-7 text-xs">
                  <Settings className="h-3 w-3" />
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
