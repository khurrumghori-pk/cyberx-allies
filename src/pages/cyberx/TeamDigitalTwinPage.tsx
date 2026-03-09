import { useState } from "react";
import { CyberXLayout } from "@/components/cyberx/CyberXLayout";
import { Button } from "@/components/ui/button";
import { Users, Loader2, ChevronDown } from "lucide-react";

const SAMPLE_QUERIES = [
  "How is the threat landscape evolving for our banking platform?",
  "What is the current SOC readiness posture?",
  "Which threat actors are most likely to target us this quarter?",
];

const SAMPLE_RESPONSE = `**Threat Landscape Summary — Banking Platform**

- **APT41** remains the highest-priority adversary. Recent campaigns leverage spear-phishing + supply chain infiltration targeting SWIFT gateway components.
- **Ransomware Syndicates (LockBit 4.x)**: Dwell-time in FSI sector has dropped to 4 days. Recommend increasing EDR coverage to 100% of servers.
- **Open Indicators**: 3 known C2 IPs observed in recent OSINT overlap with your perimeter firewall denies.

**Collective Recommendation**: Prioritize threat-intel enrichment pipeline, patch CVE-2024-38063 (CVSS 9.8) on 14 affected hosts, and schedule IR tabletop for Q2.`;

export function TeamDigitalTwinPage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState("");

  const ask = (q: string) => {
    const text = q || query;
    if (!text) return;
    setQuery(text);
    setLoading(true);
    setResponse("");
    setTimeout(() => {
      setLoading(false);
      setResponse(SAMPLE_RESPONSE);
    }, 1800);
  };

  return (
    <CyberXLayout title="Team Digital Twin" breadcrumb={["CyberX", "Team Twin"]}>
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <div className="cyberx-panel p-5 space-y-4">
            <h2 className="font-display text-lg">Query SOC Team Brain</h2>
            <textarea
              rows={3}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask the collective intelligence of your SOC team…"
              className="w-full rounded-lg border border-border/80 bg-secondary/60 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary resize-none"
            />
            <Button variant="hero" onClick={() => ask(query)} disabled={loading || !query}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? "Processing…" : "Ask Team"}
            </Button>
          </div>

          {response && (
            <div className="cyberx-panel border-accent/30 p-5 space-y-3">
              <p className="cyberx-pill border-accent/40 text-accent">Collective Response</p>
              <div className="prose prose-invert prose-sm max-w-none text-sm text-foreground whitespace-pre-line">{response}</div>
            </div>
          )}
        </div>

        <aside className="space-y-4">
          <div className="cyberx-panel p-4 space-y-3">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              <Users className="h-3.5 w-3.5" /> Quick Queries
            </p>
            {SAMPLE_QUERIES.map((q) => (
              <button key={q} onClick={() => ask(q)} className="block w-full rounded-lg border border-border/60 bg-secondary/50 p-3 text-left text-xs text-muted-foreground hover:border-primary hover:text-foreground transition-all">
                {q}
              </button>
            ))}
          </div>
          <div className="cyberx-panel p-4 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Team Composition</p>
            {["SOC Analyst (×3)", "Threat Hunter (×2)", "IR Advisor", "Malware Analyst", "vCISO"].map((t) => (
              <div key={t} className="flex items-center gap-2 text-sm">
                <span className="h-2 w-2 rounded-full bg-accent" />
                <span>{t}</span>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </CyberXLayout>
  );
}
