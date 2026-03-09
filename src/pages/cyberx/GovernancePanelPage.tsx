import { CyberXLayout } from "@/components/cyberx/CyberXLayout";
import { ShieldCheck, Lock, FileText, Users, AlertTriangle, Eye, Scale, Globe, Server } from "lucide-react";
import { cn } from "@/lib/utils";

// SRS Section 5: Security & Sovereignty Controls
const AUDIT_LOGS = [
  { id: "a1", user: "analyst@corp.com", action: "Query — IR Advisor", resource: "Incident IR-2024-019", ts: "2026-03-09 09:14", level: "info" },
  { id: "a2", user: "ciso@corp.com", action: "Viewed Advisor Analytics", resource: "Analytics Dashboard", ts: "2026-03-09 09:01", level: "info" },
  { id: "a3", user: "system", action: "Proactive Alert Triggered", resource: "CVE-2024-38063", ts: "2026-03-09 08:47", level: "warn" },
  { id: "a4", user: "admin@corp.com", action: "Advisor Builder — Activated", resource: "Threat Hunter v2", ts: "2026-03-08 17:30", level: "info" },
  { id: "a5", user: "guest@corp.com", action: "Unauthorized Route Access Blocked", resource: "/advisors/governance", ts: "2026-03-08 15:22", level: "critical" },
  { id: "a6", user: "analyst@corp.com", action: "Memory Search", resource: "Collective Cyber Memory", ts: "2026-03-08 14:11", level: "info" },
  { id: "a7", user: "system", action: "Advisor Prompt DNA Updated", resource: "SOC Analyst v1.2", ts: "2026-03-08 12:00", level: "info" },
  { id: "a8", user: "system", action: "Policy Guardrail Triggered", resource: "Data Exfiltration Attempt", ts: "2026-03-08 11:30", level: "critical" },
];

const LEVEL_STYLES: Record<string, string> = {
  info: "text-primary", warn: "text-yellow-400", critical: "text-destructive",
};

const PERMISSIONS = [
  { role: "Admin", access: "Full access — all modules, advisor creation, governance, user management", users: 3 },
  { role: "vCISO", access: "All advisors, governance (read), analytics, builder", users: 2 },
  { role: "SOC Analyst", access: "Advisors (active), chat, memory (read), notifications", users: 8 },
  { role: "Threat Hunter", access: "Advisors, team twin, memory, marketplace", users: 4 },
  { role: "Compliance Officer", access: "Governance (read), compliance mapping, audit logs", users: 2 },
  { role: "Read Only", access: "Dashboard, notifications only", users: 6 },
];

// SRS Section 6: Compliance Mapping
const COMPLIANCE_FRAMEWORKS = [
  { name: "NIST CSF", status: "compliant", coverage: 92, controls: 108 },
  { name: "ISO 27001", status: "compliant", coverage: 88, controls: 114 },
  { name: "SOC 2", status: "compliant", coverage: 95, controls: 64 },
  { name: "GDPR", status: "partial", coverage: 78, controls: 42 },
  { name: "PCI DSS", status: "compliant", coverage: 91, controls: 78 },
  { name: "NCA/NESA", status: "partial", coverage: 72, controls: 56 },
];

// SRS Section 5: Security Controls
const SECURITY_CONTROLS = [
  { control: "Zero Trust", description: "Each agent interaction authenticated and authorized. No implicit trust.", icon: Lock, status: "active" },
  { control: "RBAC & IAM", description: "Integration with enterprise identity providers; per-advisor access rights.", icon: Users, status: "active" },
  { control: "Encryption", description: "TLS for APIs; AES-256 for storage; HSM support.", icon: ShieldCheck, status: "active" },
  { control: "Audit & Logging", description: "Immutable logs of all chats, decisions, model versions.", icon: FileText, status: "active" },
  { control: "Data Provenance", description: "Sources of knowledge tagged; Advisors cite source docs.", icon: Eye, status: "active" },
  { control: "Data Residency", description: "All data within customer domain. Geo-zone isolation.", icon: Globe, status: "active" },
];

export function GovernancePanelPage() {
  return (
    <CyberXLayout title="Governance, Compliance & Audit" breadcrumb={["CyberX", "Governance"]}>
      {/* KPIs */}
      <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
        {[
          { icon: ShieldCheck, label: "Security Controls", value: "6", sub: "All active" },
          { icon: Scale, label: "Compliance Frameworks", value: "6", sub: "4 fully compliant" },
          { icon: FileText, label: "Audit Events (7d)", value: "1,204", sub: "8 critical" },
          { icon: AlertTriangle, label: "Policy Violations", value: "3", sub: "2 resolved", highlight: true },
        ].map((k) => (
          <div key={k.label} className="cyberx-kpi space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{k.label}</span>
              <k.icon className={cn("h-4 w-4", k.highlight ? "text-destructive" : "text-primary")} />
            </div>
            <p className={cn("font-display text-2xl", k.highlight ? "text-destructive" : "text-foreground")}>{k.value}</p>
            <p className="text-xs text-muted-foreground">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Security Controls - SRS Section 5 */}
      <div className="cyberx-panel p-5 space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Security & Sovereignty Controls</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SECURITY_CONTROLS.map((c) => (
            <div key={c.control} className="flex items-start gap-3 rounded-lg bg-secondary/30 border border-border/40 p-3">
              <c.icon className="h-5 w-5 shrink-0 text-accent mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">{c.control}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{c.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Compliance Mapping - SRS Section 6 */}
      <div className="cyberx-panel p-5 space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Compliance Framework Mapping</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {COMPLIANCE_FRAMEWORKS.map((f) => (
            <div key={f.name} className="rounded-lg bg-secondary/30 border border-border/40 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium text-foreground">{f.name}</span>
                <span className={cn(
                  "text-[10px] px-2 py-0.5 rounded-full border font-semibold",
                  f.status === "compliant" ? "bg-accent/20 text-accent border-accent/40" : "bg-yellow-400/20 text-yellow-400 border-yellow-400/40"
                )}>{f.status === "compliant" ? "Compliant" : "Partial"}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-secondary overflow-hidden">
                <div className={cn("h-full rounded-full", f.status === "compliant" ? "bg-accent" : "bg-yellow-400")} style={{ width: `${f.coverage}%` }} />
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>{f.coverage}% coverage</span>
                <span>{f.controls} controls</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Audit Log */}
        <div className="cyberx-panel p-5 space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Audit Log</h3>
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {AUDIT_LOGS.map((l) => (
              <div key={l.id} className="flex flex-wrap items-start gap-2 border-b border-border/40 py-2.5 text-xs">
                <span className={cn("font-semibold uppercase", LEVEL_STYLES[l.level])}>{l.level}</span>
                <span className="text-muted-foreground">{l.ts}</span>
                <span className="font-medium">{l.action}</span>
                <span className="ml-auto text-muted-foreground">{l.user}</span>
              </div>
            ))}
          </div>
        </div>

        {/* RBAC Permissions */}
        <div className="cyberx-panel p-5 space-y-3">
          <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            <Users className="h-4 w-4" /> Role-Based Access Control
          </h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground">
                <th className="pb-2 pr-4">Role</th>
                <th className="pb-2 pr-4">Access</th>
                <th className="pb-2">Users</th>
              </tr>
            </thead>
            <tbody>
              {PERMISSIONS.map((p) => (
                <tr key={p.role} className="border-b border-border/40">
                  <td className="py-2.5 pr-4 font-semibold whitespace-nowrap">{p.role}</td>
                  <td className="py-2.5 pr-4 text-xs text-muted-foreground">{p.access}</td>
                  <td className="py-2.5 text-muted-foreground">{p.users}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </CyberXLayout>
  );
}
