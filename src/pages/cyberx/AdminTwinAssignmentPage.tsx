import { useState, useEffect } from "react";
import { CyberXLayout } from "@/components/cyberx/CyberXLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  UserPlus, Users, Bot, Shield, Trash2, Plus, Loader2, ChevronRight,
  Building2, Globe
} from "lucide-react";

interface Profile {
  id: string;
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
}

interface Advisor {
  id: string;
  name: string;
  role: string;
  tier: string | null;
  assigned_user_id: string | null;
  state: string;
}

interface Team {
  id: string;
  name: string;
  description: string | null;
  region: string | null;
  members: TeamMember[];
}

interface TeamMember {
  id: string;
  user_id: string;
  role: string;
  profile?: Profile;
  advisor?: Advisor | null;
}

export function AdminTwinAssignmentPage() {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [advisors, setAdvisors] = useState<Advisor[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"assign" | "teams">("assign");

  // Assignment form
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedAdvisor, setSelectedAdvisor] = useState("");
  const [assigning, setAssigning] = useState(false);

  // Team form
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamRegion, setNewTeamRegion] = useState("");
  const [creatingTeam, setCreatingTeam] = useState(false);
  const [addMemberTeamId, setAddMemberTeamId] = useState<string | null>(null);
  const [addMemberUserId, setAddMemberUserId] = useState("");
  const [addMemberRole, setAddMemberRole] = useState("member");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [profilesRes, advisorsRes, teamsRes, membersRes] = await Promise.all([
        supabase.from("profiles").select("*"),
        supabase.from("advisors").select("id, name, role, tier, assigned_user_id, state"),
        supabase.from("teams").select("*"),
        supabase.from("team_members").select("*"),
      ]);

      const profs = profilesRes.data || [];
      const advs = advisorsRes.data || [];
      const tms = teamsRes.data || [];
      const mems = membersRes.data || [];

      setProfiles(profs);
      setAdvisors(advs);

      // Build teams with members
      const teamsWithMembers: Team[] = tms.map((t: any) => ({
        ...t,
        members: mems
          .filter((m: any) => m.team_id === t.id)
          .map((m: any) => ({
            ...m,
            profile: profs.find((p) => p.id === m.user_id),
            advisor: advs.find((a) => a.assigned_user_id === m.user_id),
          })),
      }));
      setTeams(teamsWithMembers);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const assignTwin = async () => {
    if (!selectedUser || !selectedAdvisor) return;
    setAssigning(true);
    try {
      const { error } = await supabase
        .from("advisors")
        .update({ assigned_user_id: selectedUser } as any)
        .eq("id", selectedAdvisor);
      if (error) throw error;
      toast.success("Digital Twin assigned!");
      setSelectedUser("");
      setSelectedAdvisor("");
      fetchData();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setAssigning(false);
    }
  };

  const unassignTwin = async (advisorId: string) => {
    try {
      const { error } = await supabase
        .from("advisors")
        .update({ assigned_user_id: null } as any)
        .eq("id", advisorId);
      if (error) throw error;
      toast.success("Twin unassigned");
      fetchData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const createTeam = async () => {
    if (!newTeamName || !user) return;
    setCreatingTeam(true);
    try {
      const { error } = await supabase.from("teams").insert({
        name: newTeamName,
        region: newTeamRegion || null,
        created_by: user.id,
      } as any);
      if (error) throw error;
      toast.success(`Team "${newTeamName}" created`);
      setNewTeamName("");
      setNewTeamRegion("");
      fetchData();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setCreatingTeam(false);
    }
  };

  const addTeamMember = async (teamId: string) => {
    if (!addMemberUserId) return;
    try {
      const { error } = await supabase.from("team_members").insert({
        team_id: teamId,
        user_id: addMemberUserId,
        role: addMemberRole,
      } as any);
      if (error) throw error;
      toast.success("Member added");
      setAddMemberTeamId(null);
      setAddMemberUserId("");
      fetchData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const removeTeamMember = async (memberId: string) => {
    try {
      const { error } = await supabase.from("team_members").delete().eq("id", memberId);
      if (error) throw error;
      toast.success("Member removed");
      fetchData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const deleteTeam = async (teamId: string) => {
    try {
      const { error } = await supabase.from("teams").delete().eq("id", teamId);
      if (error) throw error;
      toast.success("Team deleted");
      fetchData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const getProfileName = (p?: Profile | null) => p?.display_name || p?.username || "Unknown";

  const assignedAdvisors = advisors.filter((a) => a.assigned_user_id);
  const unassignedAdvisors = advisors.filter((a) => !a.assigned_user_id);

  if (loading) {
    return (
      <CyberXLayout title="Digital Twin Management" breadcrumb={["CyberX", "Admin", "Twin Management"]}>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </CyberXLayout>
    );
  }

  return (
    <CyberXLayout title="Digital Twin Management" breadcrumb={["CyberX", "Admin", "Twin Management"]}>
      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={tab === "assign" ? "hero" : "outline"}
          size="sm"
          onClick={() => setTab("assign")}
        >
          <Bot className="h-4 w-4 mr-1" /> Twin Assignment
        </Button>
        <Button
          variant={tab === "teams" ? "hero" : "outline"}
          size="sm"
          onClick={() => setTab("teams")}
        >
          <Users className="h-4 w-4 mr-1" /> Team Management
        </Button>
      </div>

      {tab === "assign" && (
        <div className="space-y-6">
          {/* Assignment form */}
          <div className="cyberx-panel p-5 space-y-4">
            <h2 className="font-display text-lg text-foreground">Assign Advisor as Digital Twin</h2>
            <p className="text-xs text-muted-foreground">Select a user and an advisor template to create their personal Digital Twin</p>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">User</label>
                <select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="w-full rounded-lg border border-border bg-secondary/60 px-3 py-2 text-sm text-foreground"
                >
                  <option value="">Select user…</option>
                  {profiles.map((p) => (
                    <option key={p.id} value={p.id}>
                      {getProfileName(p)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Advisor Template</label>
                <select
                  value={selectedAdvisor}
                  onChange={(e) => setSelectedAdvisor(e.target.value)}
                  className="w-full rounded-lg border border-border bg-secondary/60 px-3 py-2 text-sm text-foreground"
                >
                  <option value="">Select advisor…</option>
                  {unassignedAdvisors.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.role}) — {a.tier}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <Button variant="hero" onClick={assignTwin} disabled={!selectedUser || !selectedAdvisor || assigning} className="w-full">
                  {assigning ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <UserPlus className="h-4 w-4 mr-1" />}
                  Assign Twin
                </Button>
              </div>
            </div>
          </div>

          {/* Current assignments */}
          <div className="cyberx-panel p-5 space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Active Digital Twins</h3>
            {assignedAdvisors.length === 0 ? (
              <p className="text-xs text-muted-foreground">No Digital Twins assigned yet.</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {assignedAdvisors.map((a) => {
                  const profile = profiles.find((p) => p.id === a.assigned_user_id);
                  return (
                    <div key={a.id} className="rounded-xl border border-border/60 bg-secondary/30 p-4 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-xs font-bold text-primary">
                          {getProfileName(profile).slice(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">{getProfileName(profile)}</p>
                          <p className="text-[10px] text-muted-foreground truncate">Twin: {a.name}</p>
                        </div>
                        <span className={cn(
                          "cyberx-pill text-[9px]",
                          a.state === "active" ? "border-accent/40 text-accent" : "border-primary/40 text-primary"
                        )}>{a.state}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-muted-foreground">{a.role} • {a.tier}</span>
                        <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive hover:text-destructive" onClick={() => unassignTwin(a.id)}>
                          <Trash2 className="h-3 w-3 mr-1" /> Unassign
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {tab === "teams" && (
        <div className="space-y-6">
          {/* Create team */}
          <div className="cyberx-panel p-5 space-y-4">
            <h2 className="font-display text-lg text-foreground">Create Team</h2>
            <p className="text-xs text-muted-foreground">Group users with similar roles across regions — their Digital Twins can collaborate</p>
            <div className="grid gap-3 sm:grid-cols-3">
              <Input
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                placeholder="Team name (e.g., SOC APAC)"
                className="bg-secondary/60"
              />
              <Input
                value={newTeamRegion}
                onChange={(e) => setNewTeamRegion(e.target.value)}
                placeholder="Region (optional)"
                className="bg-secondary/60"
              />
              <Button variant="hero" onClick={createTeam} disabled={!newTeamName || creatingTeam}>
                {creatingTeam ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Plus className="h-4 w-4 mr-1" />}
                Create Team
              </Button>
            </div>
          </div>

          {/* Teams list */}
          {teams.length === 0 ? (
            <div className="cyberx-panel p-8 text-center">
              <Building2 className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No teams created yet</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {teams.map((team) => (
                <div key={team.id} className="cyberx-panel p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-accent/20 border border-accent/40 flex items-center justify-center">
                        <Users className="h-5 w-5 text-accent" />
                      </div>
                      <div>
                        <h3 className="font-display text-base text-foreground">{team.name}</h3>
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                          {team.region && (
                            <span className="flex items-center gap-1"><Globe className="h-3 w-3" /> {team.region}</span>
                          )}
                          <span>{team.members.length} members</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setAddMemberTeamId(addMemberTeamId === team.id ? null : team.id)}>
                        <UserPlus className="h-3 w-3 mr-1" /> Add Member
                      </Button>
                      <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive" onClick={() => deleteTeam(team.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Add member form */}
                  {addMemberTeamId === team.id && (
                    <div className="flex gap-2 p-3 rounded-lg bg-secondary/40 border border-border/40">
                      <select
                        value={addMemberUserId}
                        onChange={(e) => setAddMemberUserId(e.target.value)}
                        className="flex-1 rounded-lg border border-border bg-secondary/60 px-3 py-1.5 text-xs text-foreground"
                      >
                        <option value="">Select user…</option>
                        {profiles
                          .filter((p) => !team.members.some((m) => m.user_id === p.id))
                          .map((p) => (
                            <option key={p.id} value={p.id}>{getProfileName(p)}</option>
                          ))}
                      </select>
                      <select
                        value={addMemberRole}
                        onChange={(e) => setAddMemberRole(e.target.value)}
                        className="rounded-lg border border-border bg-secondary/60 px-3 py-1.5 text-xs text-foreground"
                      >
                        <option value="member">Member</option>
                        <option value="lead">Lead</option>
                      </select>
                      <Button variant="neon" size="sm" onClick={() => addTeamMember(team.id)} disabled={!addMemberUserId}>
                        Add
                      </Button>
                    </div>
                  )}

                  {/* Members grid */}
                  {team.members.length > 0 && (
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {team.members.map((m) => (
                        <div key={m.id} className="flex items-center gap-3 rounded-lg border border-border/40 bg-secondary/20 p-3">
                          <div className="h-8 w-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-[10px] font-bold text-primary">
                            {getProfileName(m.profile).slice(0, 2).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-foreground truncate">{getProfileName(m.profile)}</p>
                            <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground">
                              <span className={cn("px-1.5 py-0.5 rounded-full border", m.role === "lead" ? "border-accent/40 text-accent" : "border-border")}>{m.role}</span>
                              {m.advisor && (
                                <span className="flex items-center gap-0.5 text-primary">
                                  <Bot className="h-2.5 w-2.5" /> {m.advisor.name}
                                </span>
                              )}
                            </div>
                          </div>
                          <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive" onClick={() => removeTeamMember(m.id)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </CyberXLayout>
  );
}
