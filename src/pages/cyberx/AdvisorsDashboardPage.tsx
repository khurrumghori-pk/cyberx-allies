import { useState, useEffect } from "react";
import { CyberXLayout } from "@/components/cyberx/CyberXLayout";
import { AdvisorCard } from "@/components/cyberx/AdvisorCard";
import { ADVISORS } from "@/data/cyberx-advisors";
import { ThreatRadarChart } from "@/components/cyberx/ThreatRadarChart";
import { PersonalitySummaryCard } from "@/components/cyberx/PersonalitySummaryCard";
import { MyDigitalTwinCard } from "@/components/cyberx/MyDigitalTwinCard";
import { Activity, ShieldAlert, Cpu, TrendingUp } from "lucide-react";
import heroBanner from "@/assets/cyberx-hero-banner.jpg";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

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
  const { user } = useAuth();
  const [memoryCounts, setMemoryCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!user) return;
    // Fetch memory counts grouped by advisor role
    const fetchMemoryCounts = async () => {
      const { data: advisors } = await supabase
        .from("advisors")
        .select("id, role")
        .or(`assigned_user_id.eq.${user.id},tenant_id.eq.${user.id}`);
      
      if (!advisors?.length) return;
      
      const { data: memories } = await supabase
        .from("twin_memories")
        .select("advisor_id");
      
      if (!memories) return;
      
      // Map advisor IDs to their roles, then count memories per role
      const idToRole: Record<string, string> = {};
      advisors.forEach(a => { idToRole[a.id] = a.role; });
      
      const counts: Record<string, number> = {};
      memories.forEach(m => {
        const role = idToRole[m.advisor_id];
        if (role) {
          // Map DB role to static advisor id
          const staticId = ADVISORS.find(a => a.role === role)?.id;
          if (staticId) {
            counts[staticId] = (counts[staticId] || 0) + 1;
          }
        }
      });
      setMemoryCounts(counts);
    };
    fetchMemoryCounts();
  }, [user]);

  return (
    <CyberXLayout title="Advisors Dashboard" breadcrumb={["CyberX", "Dashboard"]}>
      {/* Hero Banner */}
      <div className="relative rounded-xl overflow-hidden mb-6 h-48">
        <img
          src={heroBanner}
          alt="CyberX Command Center"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/60 to-transparent" />
        <div className="absolute inset-0 flex items-center p-6">
          <div>
            <h1 className="font-display text-2xl text-foreground mb-2">CyberX Command Center</h1>
            <p className="text-sm text-muted-foreground max-w-md">
              AI-powered security advisors working 24/7 to protect your organization
            </p>
          </div>
        </div>
      </div>

      {/* My Digital Twin */}
      <MyDigitalTwinCard />

      {/* KPI strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <KPI label="Active Advisors" value="7" sub="+2 this week" icon={Cpu} />
        <KPI label="Sessions Today" value="41" sub="↑ 18% vs yesterday" icon={Activity} />
        <KPI label="Open Threats" value="14" sub="3 critical" icon={ShieldAlert} />
        <KPI label="Recommendations" value="29" sub="Actioned: 21 (72%)" icon={TrendingUp} />
      </div>

      {/* Threat Radar Chart */}
      <ThreatRadarChart />

      {/* Personality Summary */}
      <PersonalitySummaryCard />

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
