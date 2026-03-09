import { CyberXLayout } from "@/components/cyberx/CyberXLayout";
import { ShieldCheck, Lock, FileText, Users, AlertTriangle } from "lucide-react";

const AUDIT_LOGS = [
  { id: "a1", user: "analyst@corp.com", action: "Query — IR Advisor", resource: "Incident IR-2024-019", ts: "2026-03-09 09:14", level: "info" },
  { id: "a2", user: "ciso@corp.com", action: "Viewed Advisor Analytics", resource: "Analytics Dashboard", ts: "2026-03-09 09:01", level: "info" },
  { id: "a3", user: "system", action: "Proactive Alert Triggered", resource: "CVE-2024-38063", ts: "2026-03-09 08:47", level: "warn" },
  { id: "a4", user: "admin@corp.com", action: "Advisor Builder — Activated", resource: "Threat Hunter v2", ts: "2026-03-08 17:30", level: "info" },
  { id: "a5", user: "guest@corp.com", action: "Unauthorized Route Access Blocked", resource: "/advisors/governance", ts: "2026-03-08 15:22", level: "critical" },
  { id: "a6", user: "analyst@corp.com", action: "Memory Search", resource: "Collective Cyber Memory", ts: "2026-03-08 14:11", level: "info" },
];

const LEVEL_STYLES: Record<string, string> = {
  info: "text-primary", warn: "text-yellow-400", critical: "text-destructive",
};

const PERMISSIONS = [
  { role: "Admin", access: "Full access", users: 3 },
  { role: "vCISO", access: "All advisors, governance, analytics", users: 2 },
  { role: "SOC Analyst", access: "Advisors, chat, memory (read)", users: 8 },
  { role: "Threat Hunter", access: "Advisors, team twin, memory", users: 4 },
  { role: "Read Only", access: "Dashboard, notifications", users: 6 },
];

export function GovernancePanelPage() {
  return (
    <CyberXLayout title="Governance & Audit" breadcrumb={["CyberX", "Governance"]}>
      <div className="grid gap-5 md:grid-cols-4">
        {[
          { icon: ShieldCheck, label: "Policies Active", value: "14" },
          { icon: Lock, label: "Access Roles", value: "5" },
          { icon: FileText, label: "Audit Events (7d)", value: "1,204" },
          { icon: AlertTriangle, label: "Policy Violations", value: "3", highlight: true },
        ].map((k) => (
          <div key={k.label} className="cyberx-kpi flex items-center gap-4">
            <k.icon className={`h-8 w-8 ${k.highlight ? "text-destructive" : "text-primary"}`} />
            <div>
              <p className={`font-display text-2xl ${k.highlight ? "text-destructive" : "text-foreground"}`}>{k.value}</p>
              <p className="text-xs text-muted-foreground">{k.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="cyberx-panel p-5 space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Audit Log</h3>
          <div className="space-y-2">
            {AUDIT_LOGS.map((l) => (
              <div key={l.id} className="flex flex-wrap items-start gap-2 border-b border-border/40 py-2.5 text-xs">
                <span className={`font-semibold uppercase ${LEVEL_STYLES[l.level]}`}>{l.level}</span>
                <span className="text-muted-foreground">{l.ts}</span>
                <span className="font-medium">{l.action}</span>
                <span className="ml-auto text-muted-foreground">{l.user}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="cyberx-panel p-5 space-y-3">
          <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            <Users className="h-4 w-4" /> Role Permissions
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
                  <td className="py-2.5 pr-4 font-semibold">{p.role}</td>
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
