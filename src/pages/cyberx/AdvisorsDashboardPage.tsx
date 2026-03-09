import { CyberXLayout } from "@/components/cyberx/CyberXLayout";
import { AdvisorCard } from "@/components/cyberx/AdvisorCard";
import { ADVISORS } from "@/data/cyberx-advisors";
import { Activity, ShieldAlert, Cpu, TrendingUp } from "lucide-react";

const KPI = ({ label, value, sub, icon: Icon }: { label: string; value: string; sub: string; icon: React.FC<{ className?: string }> }) => (
  <div className="cyberx-kpi space-y-2">
    <div className="flex items-center justify-between">
      <span className="text-xs text-muted-foreground">{label}</span>
      <Icon className="h-4 w-4 text-primary" />
    </div>
    <p className="font-display text-2xl text-foreground">{value}</p>
    <p className="text-xs text-muted-foreground">{sub}</p>
  </div>
);

export function AdvisorsDashboardPage() {
  return (
    <CyberXLayout title="Advisors Dashboard" breadcrumb={["CyberX", "Dashboard"]}>
      {/* KPI strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <KPI label="Active Advisors" value="7" sub="+2 this week" icon={Cpu} />
        <KPI label="Sessions Today" value="41" sub="↑ 18% vs yesterday" icon={Activity} />
        <KPI label="Open Threats" value="14" sub="3 critical" icon={ShieldAlert} />
        <KPI label="Recommendations" value="29" sub="Actioned: 21 (72%)" icon={TrendingUp} />
      </div>

      {/* Advisor cards */}
      <div>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-muted-foreground">Your Advisor Panel</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ADVISORS.map((a) => (
            <AdvisorCard key={a.id} advisor={a} />
          ))}
        </div>
      </div>
    </CyberXLayout>
  );
}
