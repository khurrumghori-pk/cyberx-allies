import { useState } from "react";
import { CyberXLayout } from "@/components/cyberx/CyberXLayout";
import { Button } from "@/components/ui/button";
import { Search, Brain, Tag, Clock, Network, FileText, AlertTriangle, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

// SRS Section 7: Cyber Memory & Knowledge Graph
const MEMORY_ENTRIES = [
  { id: "1", type: "Incident", title: "Ransomware Campaign — H1 2023", advisors: ["IR Advisor", "SOC Analyst"], summary: "LockBit 3.0 targeted finance cluster. Dwell time: 6 days. Contained via network segmentation. 14 hosts isolated.", ts: "2023-06-14", severity: "critical", sources: ["SIEM Logs", "EDR Alert", "IR Playbook RW-003"], graphNodes: 12 },
  { id: "2", type: "Threat Actor", title: "APT41 Campaign Intelligence", advisors: ["Threat Intel"], summary: "State-sponsored group. Active in APAC FSI sector. TTPs: supply chain, zero-day exploitation (CVE-2023-44487). Linked to 3 past incidents.", ts: "2023-11-02", severity: "high", sources: ["STIX Feed", "Mandiant Intel"], graphNodes: 8 },
  { id: "3", type: "Vulnerability", title: "Log4Shell Exposure Assessment", advisors: ["Vulnerability Mgmt", "SOC Analyst"], summary: "12 affected services. 8 patched within 24h. 4 mitigated via WAF rule. Full remediation: 72h. CVSS 10.0.", ts: "2021-12-12", severity: "critical", sources: ["Qualys Scan", "NVD"], graphNodes: 6 },
  { id: "4", type: "Policy", title: "Zero Trust Network Architecture Decision", advisors: ["vCISO", "Security Architect"], summary: "Board-approved ZTA roadmap. Phase 1: identity perimeter. Phase 2: micro-segmentation. Phase 3: data-centric controls.", ts: "2024-01-21", severity: "medium", sources: ["Board Minutes", "NIST SP 800-207"], graphNodes: 15 },
  { id: "5", type: "Playbook", title: "Lateral Movement Response Playbook IR-LM-003", advisors: ["IR Advisor"], summary: "Trigger: SMB beacon spike. Steps: isolate, forensic image, netflow analysis, credential reset, threat hunt.", ts: "2024-03-09", severity: "high", sources: ["IR Playbook Library"], graphNodes: 4 },
  { id: "6", type: "Decision", title: "SSH Disable Decision — DMZ Servers", advisors: ["Threat Hunter", "Security Architect", "vCISO"], summary: "Multi-agent consensus: disable SSH on 10 non-critical servers, enforce 2FA on remainder. Conflict resolved via vCISO arbitration.", ts: "2024-09-15", severity: "medium", sources: ["Multi-Agent Chat Log", "SOAR Playbook"], graphNodes: 7 },
  { id: "7", type: "Compliance", title: "SOC 2 Type II Readiness Assessment", advisors: ["Compliance Officer", "vCISO"], summary: "95% control coverage. 3 gaps identified in change management. Remediation plan approved for Q1 2025.", ts: "2024-11-20", severity: "low", sources: ["Audit Report", "ServiceNow"], graphNodes: 9 },
];

const TYPE_COLORS: Record<string, string> = {
  Incident: "text-destructive border-destructive/40",
  "Threat Actor": "text-yellow-400 border-yellow-400/40",
  Vulnerability: "text-orange-400 border-orange-400/40",
  Policy: "text-accent border-accent/40",
  Playbook: "text-primary border-primary/40",
  Decision: "text-[hsl(267_90%_66%)] border-[hsl(267_90%_66%/0.4)]",
  Compliance: "text-accent border-accent/40",
};

const TYPE_ICONS: Record<string, typeof Shield> = {
  Incident: AlertTriangle,
  "Threat Actor": AlertTriangle,
  Vulnerability: AlertTriangle,
  Policy: Shield,
  Playbook: FileText,
  Decision: Brain,
  Compliance: Shield,
};

const TYPES = ["All", "Incident", "Threat Actor", "Vulnerability", "Policy", "Playbook", "Decision", "Compliance"];

export function CollectiveMemoryPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  
  const filtered = MEMORY_ENTRIES.filter((e) => {
    const matchesSearch = !search || e.title.toLowerCase().includes(search.toLowerCase()) || e.summary.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === "All" || e.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <CyberXLayout title="Collective Cyber Memory" breadcrumb={["CyberX", "Memory"]}>
      {/* Knowledge Graph Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="cyberx-kpi space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Memory Entries</span>
            <Brain className="h-4 w-4 text-primary" />
          </div>
          <p className="font-display text-2xl text-foreground">{MEMORY_ENTRIES.length}</p>
          <p className="text-xs text-muted-foreground">Active records</p>
        </div>
        <div className="cyberx-kpi space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Graph Nodes</span>
            <Network className="h-4 w-4 text-accent" />
          </div>
          <p className="font-display text-2xl text-foreground">{MEMORY_ENTRIES.reduce((a, e) => a + e.graphNodes, 0)}</p>
          <p className="text-xs text-muted-foreground">Connected entities</p>
        </div>
        <div className="cyberx-kpi space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Source Documents</span>
            <FileText className="h-4 w-4 text-primary" />
          </div>
          <p className="font-display text-2xl text-foreground">{new Set(MEMORY_ENTRIES.flatMap((e) => e.sources)).size}</p>
          <p className="text-xs text-muted-foreground">Indexed sources</p>
        </div>
        <div className="cyberx-kpi space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Critical Items</span>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </div>
          <p className="font-display text-2xl text-destructive">{MEMORY_ENTRIES.filter((e) => e.severity === "critical").length}</p>
          <p className="text-xs text-muted-foreground">Require attention</p>
        </div>
      </div>

      {/* Search */}
      <div className="cyberx-panel p-5 flex items-center gap-3">
        <Brain className="h-5 w-5 shrink-0 text-primary" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search institutional cyber memory — incidents, actors, playbooks, decisions…"
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
        />
        <Button variant="hero" size="sm">
          <Search className="h-4 w-4" /> Search
        </Button>
      </div>

      {/* Type Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {TYPES.map((t) => (
          <button
            key={t}
            onClick={() => setTypeFilter(t)}
            className={cn(
              "rounded-lg border px-3 py-1.5 text-xs whitespace-nowrap transition-all",
              typeFilter === t ? "border-primary bg-primary/10 text-foreground" : "border-border bg-secondary/50 text-muted-foreground hover:border-primary/50"
            )}
          >{t}</button>
        ))}
      </div>

      {/* Memory Entries */}
      <div className="space-y-3">
        {filtered.map((e) => {
          const TypeIcon = TYPE_ICONS[e.type] ?? Brain;
          return (
            <div key={e.id} className="cyberx-panel p-5 space-y-3 hover:border-primary/40 transition-all cursor-pointer">
              <div className="flex flex-wrap items-center gap-2">
                <span className={cn("cyberx-pill border", TYPE_COLORS[e.type] ?? "text-muted-foreground")}>{e.type}</span>
                <h3 className="text-sm font-semibold text-foreground">{e.title}</h3>
                <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" /> {e.ts}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{e.summary}</p>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex flex-wrap gap-2">
                  {e.advisors.map((a) => (
                    <span key={a} className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Tag className="h-3 w-3" /> {a}
                    </span>
                  ))}
                </div>
                <div className="ml-auto flex items-center gap-3 text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Network className="h-3 w-3" /> {e.graphNodes} nodes
                  </span>
                  <span className="flex items-center gap-1">
                    <FileText className="h-3 w-3" /> {e.sources.length} sources
                  </span>
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <p className="py-10 text-center text-sm text-muted-foreground">No memory entries match your query.</p>
        )}
      </div>
    </CyberXLayout>
  );
}
