import { useState } from "react";
import { CyberXLayout } from "@/components/cyberx/CyberXLayout";
import { Button } from "@/components/ui/button";
import { Search, Brain, Tag, Clock } from "lucide-react";

const MEMORY_ENTRIES = [
  { id: "1", type: "Incident", title: "Ransomware Campaign — H1 2023", advisors: ["IR Advisor", "SOC Analyst"], summary: "LockBit 3.0 targeted finance cluster. Dwell time: 6 days. Contained via network segmentation. 14 hosts isolated.", ts: "2023-06-14" },
  { id: "2", type: "Threat Actor", title: "APT41 Campaign Intelligence", advisors: ["Threat Intel"], summary: "State-sponsored group. Active in APAC FSI sector. TTPs: supply chain, zero-day exploitation (CVE-2023-44487).", ts: "2023-11-02" },
  { id: "3", type: "Vulnerability", title: "Log4Shell Exposure Assessment", advisors: ["Vulnerability Mgmt", "SOC Analyst"], summary: "12 affected services. 8 patched within 24h. 4 mitigated via WAF rule. Full remediation: 72h.", ts: "2021-12-12" },
  { id: "4", type: "Policy", title: "Zero Trust Network Architecture Decision", advisors: ["vCISO", "Security Architect"], summary: "Board-approved ZTA roadmap. Phase 1: identity perimeter. Phase 2: micro-segmentation. Phase 3: data-centric controls.", ts: "2024-01-21" },
  { id: "5", type: "Playbook", title: "Lateral Movement Response Playbook IR-LM-003", advisors: ["IR Advisor"], summary: "Trigger: SMB beacon spike. Steps: isolate, forensic image, netflow analysis, credential reset, threat hunt.", ts: "2024-03-09" },
];

const TYPE_COLORS: Record<string, string> = {
  Incident: "text-destructive border-destructive/40",
  "Threat Actor": "text-yellow-400 border-yellow-400/40",
  Vulnerability: "text-orange-400 border-orange-400/40",
  Policy: "text-accent border-accent/40",
  Playbook: "text-primary border-primary/40",
};

export function CollectiveMemoryPage() {
  const [search, setSearch] = useState("");
  const filtered = MEMORY_ENTRIES.filter((e) => !search || e.title.toLowerCase().includes(search.toLowerCase()) || e.summary.toLowerCase().includes(search.toLowerCase()));

  return (
    <CyberXLayout title="Collective Cyber Memory" breadcrumb={["CyberX", "Memory"]}>
      <div className="cyberx-panel p-5 flex items-center gap-3">
        <Brain className="h-5 w-5 shrink-0 text-primary" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search institutional cyber memory…"
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
        />
        <Button variant="hero" size="sm">
          <Search className="h-4 w-4" /> Search
        </Button>
      </div>

      <div className="space-y-3">
        {filtered.map((e) => (
          <div key={e.id} className="cyberx-panel p-5 space-y-2 hover:border-primary/40 transition-all cursor-pointer">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`cyberx-pill border ${TYPE_COLORS[e.type] ?? "text-muted-foreground"}`}>{e.type}</span>
              <h3 className="text-sm font-semibold text-foreground">{e.title}</h3>
              <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" /> {e.ts}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">{e.summary}</p>
            <div className="flex flex-wrap gap-2">
              {e.advisors.map((a) => (
                <span key={a} className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <Tag className="h-3 w-3" /> {a}
                </span>
              ))}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="py-10 text-center text-sm text-muted-foreground">No memory entries match your query.</p>
        )}
      </div>
    </CyberXLayout>
  );
}
