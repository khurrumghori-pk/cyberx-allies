import { useState, useEffect } from "react";
import { CyberXLayout } from "@/components/cyberx/CyberXLayout";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Users, Bot, Loader2, Globe, UserX, Briefcase,
  ChevronDown, ChevronRight, Network, Crown, Shield
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

/* ── Types ─────────────────────────────────── */

interface Colleague {
  id: string;
  display_name: string;
  department: string | null;
  job_title: string | null;
  is_former_employee: boolean;
  advisor_id: string | null;
  advisor_name?: string;
  advisor_role?: string;
}

interface TeamColleagueLink {
  team_id: string;
  colleague_id: string;
  role: string | null;
}

interface Team {
  id: string;
  name: string;
  description: string | null;
  region: string | null;
}

interface OrgTeam extends Team {
  members: { colleague: Colleague; role: string }[];
}

/* ── Role badge styles ─────────────────────── */

const ROLE_STYLES: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
  lead: { bg: "bg-accent/20 border-accent/40", text: "text-accent", icon: <Crown className="h-3 w-3" /> },
  member: { bg: "bg-secondary/60 border-border/40", text: "text-muted-foreground", icon: null },
  admin: { bg: "bg-primary/20 border-primary/40", text: "text-primary", icon: <Shield className="h-3 w-3" /> },
};

function RoleBadge({ role }: { role: string }) {
  const s = ROLE_STYLES[role] || ROLE_STYLES.member;
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider", s.bg, s.text)}>
      {s.icon}{role}
    </span>
  );
}

/* ── Cross-team indicator ──────────────────── */

function CrossTeamBadges({ colleagueId, allLinks, teams }: { colleagueId: string; allLinks: TeamColleagueLink[]; teams: Team[] }) {
  const teamIds = allLinks.filter(l => l.colleague_id === colleagueId).map(l => l.team_id);
  if (teamIds.length <= 1) return null;
  const otherTeams = teams.filter(t => teamIds.includes(t.id));
  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {otherTeams.map(t => (
        <Tooltip key={t.id}>
          <TooltipTrigger asChild>
            <span className="inline-flex items-center gap-0.5 rounded-full bg-primary/10 border border-primary/20 px-1.5 py-0.5 text-[8px] font-medium text-primary cursor-default">
              <Network className="h-2.5 w-2.5" />{t.name}
            </span>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">Cross-team: {t.name}{t.region ? ` (${t.region})` : ""}</TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
}

/* ── Colleague Node ────────────────────────── */

function ColleagueNode({ colleague, role, allLinks, teams }: {
  colleague: Colleague; role: string; allLinks: TeamColleagueLink[]; teams: Team[];
}) {
  const initials = colleague.display_name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  const isCrossTeam = allLinks.filter(l => l.colleague_id === colleague.id).length > 1;

  return (
    <div className={cn(
      "group relative flex items-start gap-3 rounded-xl border p-3 transition-all duration-200",
      colleague.is_former_employee
        ? "border-border/30 bg-secondary/20 opacity-70 hover:opacity-100"
        : "border-border/50 bg-card/60 hover:border-primary/40 hover:bg-card/80",
      isCrossTeam && "ring-1 ring-primary/20"
    )}>
      {/* Avatar */}
      <div className={cn(
        "shrink-0 h-10 w-10 rounded-full flex items-center justify-center text-xs font-bold border",
        colleague.is_former_employee
          ? "bg-muted/40 border-border/40 text-muted-foreground"
          : "bg-primary/15 border-primary/30 text-primary"
      )}>
        {colleague.is_former_employee ? <UserX className="h-4 w-4" /> : initials}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={cn("text-sm font-semibold truncate", colleague.is_former_employee ? "text-muted-foreground line-through" : "text-foreground")}>
            {colleague.display_name}
          </span>
          <RoleBadge role={role} />
          {colleague.is_former_employee && (
            <span className="text-[9px] font-medium text-destructive/80 uppercase tracking-wider">Former</span>
          )}
        </div>

        {colleague.job_title && (
          <p className="text-[11px] text-muted-foreground flex items-center gap-1">
            <Briefcase className="h-3 w-3 shrink-0" />{colleague.job_title}
          </p>
        )}

        {colleague.advisor_name && (
          <p className="text-[10px] text-primary/80 flex items-center gap-1">
            <Bot className="h-3 w-3 shrink-0" />{colleague.advisor_name} <span className="text-muted-foreground">({colleague.advisor_role})</span>
          </p>
        )}

        <CrossTeamBadges colleagueId={colleague.id} allLinks={allLinks} teams={teams} />
      </div>
    </div>
  );
}

/* ── Team Card ─────────────────────────────── */

function TeamCard({ team, allLinks, allTeams }: { team: OrgTeam; allLinks: TeamColleagueLink[]; allTeams: Team[] }) {
  const [expanded, setExpanded] = useState(true);
  const leads = team.members.filter(m => m.role === "lead");
  const members = team.members.filter(m => m.role !== "lead");
  const formerCount = team.members.filter(m => m.colleague.is_former_employee).length;
  const crossTeamCount = team.members.filter(m => allLinks.filter(l => l.colleague_id === m.colleague.id).length > 1).length;

  return (
    <div className="relative">
      {/* Connector line from top */}
      <div className="absolute left-1/2 -top-6 w-px h-6 bg-gradient-to-b from-transparent to-border hidden lg:block" />

      <div className="cyberx-panel overflow-hidden">
        {/* Header */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center gap-3 p-4 hover:bg-secondary/30 transition-colors"
        >
          <div className="h-11 w-11 rounded-lg bg-accent/15 border border-accent/30 flex items-center justify-center shrink-0">
            <Users className="h-5 w-5 text-accent" />
          </div>
          <div className="flex-1 min-w-0 text-left">
            <h3 className="font-display text-base text-foreground">{team.name}</h3>
            <div className="flex items-center gap-3 text-[10px] text-muted-foreground mt-0.5">
              {team.region && <span className="flex items-center gap-1"><Globe className="h-3 w-3" />{team.region}</span>}
              <span>{team.members.length} members</span>
              {formerCount > 0 && <span className="text-destructive/70">{formerCount} former</span>}
              {crossTeamCount > 0 && <span className="text-primary">{crossTeamCount} cross-team</span>}
            </div>
          </div>
          {expanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
        </button>

        {/* Members */}
        {expanded && (
          <div className="px-4 pb-4 space-y-4">
            {/* Leads section */}
            {leads.length > 0 && (
              <div className="space-y-2">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-accent/70 pl-1">Team Leads</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {leads.map(m => (
                    <ColleagueNode key={m.colleague.id} colleague={m.colleague} role={m.role} allLinks={allLinks} teams={allTeams} />
                  ))}
                </div>
              </div>
            )}

            {/* Divider */}
            {leads.length > 0 && members.length > 0 && (
              <div className="relative">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border/30" /></div>
                <div className="relative flex justify-center">
                  <span className="bg-card px-3 text-[9px] uppercase tracking-widest text-muted-foreground">Members</span>
                </div>
              </div>
            )}

            {/* Members grid */}
            {members.length > 0 && (
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {members.map(m => (
                  <ColleagueNode key={m.colleague.id} colleague={m.colleague} role={m.role} allLinks={allLinks} teams={allTeams} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Page ───────────────────────────────────── */

export function OrgChartPage() {
  const [teams, setTeams] = useState<OrgTeam[]>([]);
  const [rawTeams, setRawTeams] = useState<Team[]>([]);
  const [allLinks, setAllLinks] = useState<TeamColleagueLink[]>([]);
  const [loading, setLoading] = useState(true);

  // Stats
  const [stats, setStats] = useState({ totalColleagues: 0, crossTeam: 0, former: 0, withTwin: 0 });

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [teamsRes, colleaguesRes, linksRes, advisorsRes] = await Promise.all([
        supabase.from("teams").select("*"),
        supabase.from("colleagues").select("*"),
        supabase.from("team_colleagues").select("*"),
        supabase.from("advisors").select("id, name, role"),
      ]);

      const tms: Team[] = teamsRes.data || [];
      const cols: Colleague[] = colleaguesRes.data || [];
      const links: TeamColleagueLink[] = (linksRes.data || []).map((l: any) => ({ team_id: l.team_id, colleague_id: l.colleague_id, role: l.role }));
      const advs = advisorsRes.data || [];

      // Enrich colleagues with advisor info
      const enriched = cols.map(c => {
        const adv = advs.find((a: any) => a.id === c.advisor_id);
        return { ...c, advisor_name: adv?.name, advisor_role: adv?.role };
      });

      // Build OrgTeams
      const orgTeams: OrgTeam[] = tms.map(t => ({
        ...t,
        members: links
          .filter(l => l.team_id === t.id)
          .map(l => {
            const col = enriched.find(c => c.id === l.colleague_id);
            return col ? { colleague: col, role: l.role || "member" } : null;
          })
          .filter(Boolean) as { colleague: Colleague; role: string }[],
      }));

      // Sort: leads first
      orgTeams.forEach(t => t.members.sort((a, b) => (a.role === "lead" ? -1 : 1) - (b.role === "lead" ? -1 : 1)));

      setRawTeams(tms);
      setAllLinks(links);
      setTeams(orgTeams);

      // Stats
      const crossTeamIds = new Set<string>();
      links.forEach(l => {
        if (links.filter(l2 => l2.colleague_id === l.colleague_id).length > 1) crossTeamIds.add(l.colleague_id);
      });
      setStats({
        totalColleagues: enriched.length,
        crossTeam: crossTeamIds.size,
        former: enriched.filter(c => c.is_former_employee).length,
        withTwin: enriched.filter(c => c.advisor_id).length,
      });
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <CyberXLayout title="Organization Chart" breadcrumb={["CyberX", "Team", "Org Chart"]}>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </CyberXLayout>
    );
  }

  return (
    <CyberXLayout title="Organization Chart" breadcrumb={["CyberX", "Team", "Org Chart"]}>
      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total People", value: stats.totalColleagues, icon: <Users className="h-4 w-4" />, color: "text-foreground" },
          { label: "Cross-Team", value: stats.crossTeam, icon: <Network className="h-4 w-4" />, color: "text-primary" },
          { label: "Digital Twins", value: stats.withTwin, icon: <Bot className="h-4 w-4" />, color: "text-accent" },
          { label: "Former Staff", value: stats.former, icon: <UserX className="h-4 w-4" />, color: "text-destructive/70" },
        ].map(s => (
          <div key={s.label} className="cyberx-panel p-3 flex items-center gap-3">
            <div className={cn("h-9 w-9 rounded-lg bg-secondary/60 border border-border/40 flex items-center justify-center", s.color)}>{s.icon}</div>
            <div>
              <p className={cn("text-lg font-display font-bold", s.color)}>{s.value}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 mb-6 text-[10px]">
        <span className="text-muted-foreground uppercase tracking-wider font-semibold">Legend:</span>
        <RoleBadge role="lead" />
        <RoleBadge role="member" />
        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 border border-primary/20 px-2 py-0.5 text-primary font-medium">
          <Network className="h-2.5 w-2.5" />Cross-Team
        </span>
        <span className="inline-flex items-center gap-1 text-destructive/70 font-medium">
          <UserX className="h-3 w-3" />Former Employee
        </span>
        <span className="inline-flex items-center gap-1 text-primary/80 font-medium">
          <Bot className="h-3 w-3" />Has Digital Twin
        </span>
      </div>

      {/* Teams hierarchy */}
      {teams.length === 0 ? (
        <div className="cyberx-panel p-12 text-center">
          <Network className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No teams found. Create teams in Team Digital Twin page first.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Top org node */}
          <div className="flex justify-center">
            <div className="cyberx-panel px-6 py-3 inline-flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <span className="font-display text-sm text-foreground">CyberX Organization</span>
              <span className="text-[10px] text-muted-foreground ml-2">{teams.length} teams</span>
            </div>
          </div>

          {/* Connector */}
          <div className="flex justify-center">
            <div className="w-px h-8 bg-gradient-to-b from-border to-transparent" />
          </div>

          {/* Horizontal connector bar */}
          <div className="hidden lg:block relative mx-12">
            <div className="absolute top-0 left-0 right-0 h-px bg-border" />
            <div className="flex justify-around">
              {teams.map((_, i) => (
                <div key={i} className="w-px h-6 bg-border" />
              ))}
            </div>
          </div>

          {/* Team cards */}
          <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
            {teams.map(team => (
              <TeamCard key={team.id} team={team} allLinks={allLinks} allTeams={rawTeams} />
            ))}
          </div>
        </div>
      )}
    </CyberXLayout>
  );
}
