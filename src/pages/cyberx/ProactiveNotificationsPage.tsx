import { useState } from "react";
import { CyberXLayout } from "@/components/cyberx/CyberXLayout";
import { Button } from "@/components/ui/button";
import { Bell, BellOff, ShieldAlert, TrendingUp, Bug, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

const NOTIFICATIONS = [
  { id: "n1", advisor: "Threat Intel", severity: "CRITICAL", icon: ShieldAlert, iconClass: "text-destructive", title: "New CVE Exposure Detected", body: "CVE-2026-11829 (CVSS 9.8) affects your nginx versions on 7 hosts. Patch available. Exploit confirmed in the wild.", ts: "3 min ago", read: false },
  { id: "n2", advisor: "SOC Analyst", severity: "HIGH", icon: Eye, iconClass: "text-yellow-400", title: "Abnormal Outbound Traffic Pattern", body: "Host 10.2.9.44 initiated 3,200+ DNS requests in 60s. Possible DNS tunneling or C2 beaconing. Investigating.", ts: "17 min ago", read: false },
  { id: "n3", advisor: "vCISO", severity: "MEDIUM", icon: TrendingUp, iconClass: "text-primary", title: "Threat Actor Campaign Targeting FSI", body: "APT41 observed launching renewed spear-phishing campaigns against banking sector. 2 indicators matched your environment.", ts: "1h ago", read: false },
  { id: "n4", advisor: "Malware Analyst", severity: "HIGH", icon: Bug, iconClass: "text-orange-400", title: "Suspicious Binary Execution", body: "svchost.exe spawning powershell with encoded payload on host 10.5.7.12. Sandbox analysis triggered.", ts: "3h ago", read: true },
  { id: "n5", advisor: "IR Advisor", severity: "LOW", icon: Bell, iconClass: "text-accent", title: "IR Playbook Updated", body: "Playbook IR-RW-009 (Ransomware Response) revised with new containment steps following Q1 tabletop exercise.", ts: "8h ago", read: true },
];

const SEV_STYLES: Record<string, string> = {
  CRITICAL: "border-destructive/50 bg-destructive/8 text-destructive",
  HIGH: "border-yellow-400/50 bg-yellow-400/8 text-yellow-400",
  MEDIUM: "border-primary/50 bg-primary/8 text-primary",
  LOW: "border-accent/50 bg-accent/8 text-accent",
};

export function ProactiveNotificationsPage() {
  const [notifications, setNotifications] = useState(NOTIFICATIONS);

  const markAllRead = () => setNotifications((p) => p.map((n) => ({ ...n, read: true })));

  return (
    <CyberXLayout title="Proactive Notifications" breadcrumb={["CyberX", "Notifications"]}>
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{notifications.filter((n) => !n.read).length} unread alerts</span>
        <Button variant="neon" size="sm" onClick={markAllRead}>
          <BellOff className="h-3.5 w-3.5" /> Mark all read
        </Button>
      </div>

      <div className="space-y-3">
        {notifications.map((n) => {
          const Icon = n.icon;
          return (
            <div
              key={n.id}
              onClick={() => setNotifications((p) => p.map((x) => x.id === n.id ? { ...x, read: true } : x))}
              className={cn("cyberx-panel cursor-pointer p-5 transition-all hover:border-primary/40", !n.read && "border-l-4 border-l-primary")}
            >
              <div className="flex items-start gap-4">
                <div className="mt-0.5 rounded-lg border border-border/60 bg-secondary/60 p-2">
                  <Icon className={cn("h-5 w-5", n.iconClass)} />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={cn("cyberx-pill text-[10px] border", SEV_STYLES[n.severity])}>{n.severity}</span>
                    <span className="text-xs text-muted-foreground">{n.advisor} Advisor</span>
                    <span className="ml-auto text-xs text-muted-foreground">{n.ts}</span>
                    {!n.read && <span className="h-2 w-2 rounded-full bg-primary" />}
                  </div>
                  <p className="font-semibold">{n.title}</p>
                  <p className="text-sm text-muted-foreground">{n.body}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </CyberXLayout>
  );
}
