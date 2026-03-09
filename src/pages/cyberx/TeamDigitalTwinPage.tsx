import { useState, useEffect, useCallback } from "react";
import { CyberXLayout } from "@/components/cyberx/CyberXLayout";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import {
  Users, Bot, MessageSquare, Loader2, Send, User,
  Globe, ChevronRight, Clock, UserX, Briefcase,
  ArrowLeft, Sparkles, Plus, Trash2, Settings,
  History, X
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

/* ── Types ─────────────────────────────────────────── */

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

interface Team {
  id: string;
  name: string;
  description: string | null;
  region: string | null;
  colleagues: (Colleague & { team_role: string })[];
}

interface AdvisorOption {
  id: string;
  name: string;
  role: string;
}

interface ConvMessage {
  role: string;
  content: string;
}

interface Conversation {
  id: string;
  target_type: string;
  target_id: string;
  target_name: string;
  updated_at: string;
}

const TWIN_CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/twin-to-twin-chat`;

/* ── Feature Cards ─────────────────────────────────── */

const FEATURES = [
  { key: "colleague", title: "Ask a Colleague", desc: "Their twin preps you like your best teammate", icon: User, color: "text-primary", borderColor: "border-primary/30 hover:border-primary/60" },
  { key: "team", title: "Ask an Entire Team", desc: "One question. A whole team's answer.", icon: Users, color: "text-accent", borderColor: "border-accent/30 hover:border-accent/60" },
  { key: "proactive", title: "A Proactive Assistant", desc: "Gets essentials ready on time", icon: Sparkles, color: "text-[hsl(38_95%_55%)]", borderColor: "border-[hsl(38_95%_55%)]/30 hover:border-[hsl(38_95%_55%)]/60" },
  { key: "former", title: "Ask a Former Employee", desc: "They've moved on. Their experience hasn't.", icon: MessageSquare, color: "text-[hsl(267_90%_66%)]", borderColor: "border-[hsl(267_90%_66%)]/30 hover:border-[hsl(267_90%_66%)]/60" },
] as const;

type FeatureKey = typeof FEATURES[number]["key"];
type Mode = "overview" | "manage" | FeatureKey;

/* ── Component ─────────────────────────────────────── */

export function TeamDigitalTwinPage() {
  const { user } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [colleagues, setColleagues] = useState<Colleague[]>([]);
  const [advisorOptions, setAdvisorOptions] = useState<AdvisorOption[]>([]);
  const [loading, setLoading] = useState(true);

  // Mode & chat
  const [mode, setMode] = useState<Mode>("overview");
  const [chatTarget, setChatTarget] = useState<Colleague | null>(null);
  const [teamTarget, setTeamTarget] = useState<Team | null>(null);
  const [query, setQuery] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [messages, setMessages] = useState<ConvMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [proactiveType, setProactiveType] = useState<"brief" | "meeting" | "handoff">("brief");

  // Management dialogs
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [showAddColleague, setShowAddColleague] = useState(false);
  const [showAssignColleague, setShowAssignColleague] = useState(false);
  const [assignTeamId, setAssignTeamId] = useState("");
  const [newTeam, setNewTeam] = useState({ name: "", description: "", region: "" });
  const [newColleague, setNewColleague] = useState({ display_name: "", department: "", job_title: "", advisor_id: "", is_former: false });

  // Conversation history
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [teamsRes, colleaguesRes, teamColRes, advisorsRes] = await Promise.all([
        supabase.from("teams").select("*"),
        supabase.from("colleagues").select("*"),
        supabase.from("team_colleagues").select("*"),
        supabase.from("advisors").select("id, name, role"),
      ]);

      const advs = advisorsRes.data || [];
      setAdvisorOptions(advs);
      const cols: Colleague[] = (colleaguesRes.data || []).map((c: any) => {
        const adv = advs.find((a) => a.id === c.advisor_id);
        return { ...c, advisor_name: adv?.name, advisor_role: adv?.role };
      });
      setColleagues(cols);

      const tcData = teamColRes.data || [];
      const builtTeams: Team[] = (teamsRes.data || []).map((t: any) => ({
        ...t,
        colleagues: tcData
          .filter((tc: any) => tc.team_id === t.id)
          .map((tc: any) => {
            const col = cols.find((c) => c.id === tc.colleague_id);
            return col ? { ...col, team_role: tc.role } : null;
          })
          .filter(Boolean),
      }));
      setTeams(builtTeams);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchConversations = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("twin_conversations")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(20);
    setConversations(data || []);
  }, [user]);

  useEffect(() => { fetchData(); fetchConversations(); }, [fetchData, fetchConversations]);

  const initials = (name: string) => name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  /* ── Team / Colleague CRUD ── */

  const createTeam = async () => {
    if (!newTeam.name.trim() || !user) return;
    const { error } = await supabase.from("teams").insert({
      name: newTeam.name.trim(),
      description: newTeam.description.trim() || null,
      region: newTeam.region.trim() || null,
      created_by: user.id,
    });
    if (error) toast.error(error.message);
    else { toast.success("Team created"); setShowCreateTeam(false); setNewTeam({ name: "", description: "", region: "" }); fetchData(); }
  };

  const deleteTeam = async (id: string) => {
    if (!confirm("Delete this team?")) return;
    const { error } = await supabase.from("teams").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Team deleted"); fetchData(); }
  };

  const createColleague = async () => {
    if (!newColleague.display_name.trim() || !user) return;
    const { error } = await supabase.from("colleagues").insert({
      display_name: newColleague.display_name.trim(),
      department: newColleague.department.trim() || null,
      job_title: newColleague.job_title.trim() || null,
      advisor_id: newColleague.advisor_id || null,
      is_former_employee: newColleague.is_former,
      tenant_id: user.id,
    });
    if (error) toast.error(error.message);
    else { toast.success("Colleague added"); setShowAddColleague(false); setNewColleague({ display_name: "", department: "", job_title: "", advisor_id: "", is_former: false }); fetchData(); }
  };

  const deleteColleague = async (id: string) => {
    if (!confirm("Remove this colleague?")) return;
    const { error } = await supabase.from("colleagues").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Colleague removed"); fetchData(); }
  };

  const assignColleagueToTeam = async (colleagueId: string) => {
    if (!assignTeamId) return;
    const { error } = await supabase.from("team_colleagues").insert({
      team_id: assignTeamId,
      colleague_id: colleagueId,
      role: "member",
    });
    if (error) {
      if (error.code === "23505") toast.error("Already assigned to this team");
      else toast.error(error.message);
    } else { toast.success("Assigned to team"); setShowAssignColleague(false); fetchData(); }
  };

  const removeFromTeam = async (teamId: string, colleagueId: string) => {
    const { error } = await supabase.from("team_colleagues").delete().eq("team_id", teamId).eq("colleague_id", colleagueId);
    if (error) toast.error(error.message);
    else { toast.success("Removed from team"); fetchData(); }
  };

  /* ── Chat with conversation history ── */

  const getOrCreateConversation = async (targetType: string, targetId: string, targetName: string): Promise<string> => {
    if (conversationId) return conversationId;
    // Check for existing
    const { data: existing } = await supabase
      .from("twin_conversations")
      .select("id")
      .eq("user_id", user!.id)
      .eq("target_type", targetType)
      .eq("target_id", targetId)
      .order("updated_at", { ascending: false })
      .limit(1)
      .single();

    if (existing) {
      setConversationId(existing.id);
      // Load existing messages
      const { data: msgs } = await supabase
        .from("twin_conversation_messages")
        .select("role, content")
        .eq("conversation_id", existing.id)
        .order("created_at", { ascending: true });
      if (msgs) setMessages(msgs);
      return existing.id;
    }

    const { data: newConv } = await supabase
      .from("twin_conversations")
      .insert({ user_id: user!.id, target_type: targetType, target_id: targetId, target_name: targetName })
      .select("id")
      .single();

    const id = newConv!.id;
    setConversationId(id);
    return id;
  };

  const loadConversation = async (conv: Conversation) => {
    setConversationId(conv.id);
    const { data: msgs } = await supabase
      .from("twin_conversation_messages")
      .select("role, content")
      .eq("conversation_id", conv.id)
      .order("created_at", { ascending: true });
    setMessages(msgs || []);

    // Restore the chat mode
    const colleague = colleagues.find(c => c.id === conv.target_id);
    const team = teams.find(t => t.id === conv.target_id);

    if (conv.target_type === "colleague" && colleague) {
      setChatTarget(colleague);
      setMode("colleague");
    } else if (conv.target_type === "former" && colleague) {
      setChatTarget(colleague);
      setMode("former");
    } else if (conv.target_type === "team" && team) {
      setTeamTarget(team);
      setMode("team");
    } else if (conv.target_type === "proactive") {
      setMode("proactive");
    }
    setShowHistory(false);
    setQuery("");
  };

  const sendChat = async () => {
    if (!query.trim()) return;
    const userMsg = query.trim();
    setQuery("");
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setChatLoading(true);

    // Determine target info for conversation
    let targetType = mode as string;
    let targetId = "";
    let targetName = "";

    const body: any = { message: userMsg };

    if (mode === "colleague" && chatTarget?.advisor_id) {
      targetId = chatTarget.id;
      targetName = chatTarget.display_name;
      body.targetAdvisorId = chatTarget.advisor_id;
      body.targetUserName = chatTarget.display_name;
      body.mode = "twin";
    } else if (mode === "team" && teamTarget) {
      targetId = teamTarget.id;
      targetName = teamTarget.name;
      body.teamName = teamTarget.name;
      body.teamMembers = teamTarget.colleagues.filter(c => c.advisor_id).map(c => ({ name: c.display_name, role: c.advisor_role, advisorName: c.advisor_name }));
      body.mode = "team";
    } else if (mode === "former" && chatTarget?.advisor_id) {
      targetId = chatTarget.id;
      targetName = chatTarget.display_name;
      body.targetAdvisorId = chatTarget.advisor_id;
      body.targetUserName = chatTarget.display_name;
      body.mode = "twin";
      body.context = `This is the Digital Twin of ${chatTarget.display_name}, a former ${chatTarget.job_title} in ${chatTarget.department}.`;
    } else if (mode === "proactive") {
      targetId = "proactive";
      targetName = "Proactive Assistant";
      body.mode = "team";
      body.teamName = "All Active Colleagues";
      body.teamMembers = colleagues.filter(c => c.advisor_id && !c.is_former_employee).map(c => ({ name: c.display_name, role: c.advisor_role, advisorName: c.advisor_name }));
    }

    // Include conversation history for context
    if (messages.length > 0) {
      body.conversationHistory = messages.slice(-10);
    }

    try {
      const convId = await getOrCreateConversation(targetType, targetId, targetName);
      // Save user message
      await supabase.from("twin_conversation_messages").insert({ conversation_id: convId, role: "user", content: userMsg });

      const resp = await fetch(TWIN_CHAT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify(body),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(err.error || `HTTP ${resp.status}`);
      }
      if (!resp.body) throw new Error("No body");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let accumulated = "";
      let done = false;

      while (!done) {
        const { done: rd, value } = await reader.read();
        if (rd) break;
        buffer += decoder.decode(value, { stream: true });
        let idx: number;
        while ((idx = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") { done = true; break; }
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              accumulated += content;
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant") return [...prev.slice(0, -1), { role: "assistant", content: accumulated }];
                return [...prev, { role: "assistant", content: accumulated }];
              });
            }
          } catch { buffer = line + "\n" + buffer; break; }
        }
      }

      // Save assistant message
      if (accumulated) {
        await supabase.from("twin_conversation_messages").insert({ conversation_id: convId, role: "assistant", content: accumulated });
        await supabase.from("twin_conversations").update({ updated_at: new Date().toISOString() }).eq("id", convId);
      }
    } catch (err: any) {
      setMessages(prev => [...prev, { role: "assistant", content: `⚠ Error: ${err.message}` }]);
    } finally {
      setChatLoading(false);
    }
  };

  const goBack = () => {
    setMode("overview");
    setChatTarget(null);
    setTeamTarget(null);
    setMessages([]);
    setConversationId(null);
    setQuery("");
    fetchConversations();
  };

  const startNewChat = () => {
    setMessages([]);
    setConversationId(null);
    setQuery("");
  };

  const startColleagueChat = (c: Colleague) => { setChatTarget(c); setMode("colleague"); startNewChat(); };
  const startFormerChat = (c: Colleague) => { setChatTarget(c); setMode("former"); startNewChat(); };
  const startTeamQuery = (t: Team) => { setTeamTarget(t); setMode("team"); startNewChat(); };
  const startProactive = () => { setMode("proactive"); startNewChat(); };

  const activeColleagues = colleagues.filter(c => !c.is_former_employee && c.advisor_id);
  const formerColleagues = colleagues.filter(c => c.is_former_employee && c.advisor_id);

  if (loading) {
    return (
      <CyberXLayout title="Team Digital Twin" breadcrumb={["CyberX", "Team Twin"]}>
        <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      </CyberXLayout>
    );
  }

  return (
    <CyberXLayout title="Team Digital Twin" breadcrumb={["CyberX", "Team Twin"]}>
      {mode !== "overview" && mode !== "manage" && (
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={goBack}><ArrowLeft className="h-4 w-4 mr-1" /> Back</Button>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={startNewChat}><Plus className="h-4 w-4 mr-1" /> New Chat</Button>
            <Button variant="ghost" size="sm" onClick={() => { fetchConversations(); setShowHistory(true); }}><History className="h-4 w-4 mr-1" /> History</Button>
          </div>
        </div>
      )}

      {/* ═══ Conversation History Sidebar ═══ */}
      {showHistory && (
        <div className="cyberx-panel p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Recent Conversations</h3>
            <button onClick={() => setShowHistory(false)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
          </div>
          {conversations.length === 0 ? (
            <p className="text-xs text-muted-foreground">No conversation history yet.</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {conversations.map(conv => (
                <button key={conv.id} onClick={() => loadConversation(conv)}
                  className="w-full text-left rounded-lg border border-border/40 bg-secondary/30 p-3 hover:border-primary/40 transition-all space-y-1">
                  <p className="text-sm font-medium text-foreground">{conv.target_name}</p>
                  <p className="text-[10px] text-muted-foreground flex items-center gap-2">
                    <span className="cyberx-pill text-[9px]">{conv.target_type}</span>
                    <Clock className="h-3 w-3" /> {new Date(conv.updated_at).toLocaleDateString()}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ═══ Overview Mode ═══ */}
      {mode === "overview" && (
        <div className="space-y-6">
          {/* Feature Cards */}
          <div className="grid gap-4 sm:grid-cols-2">
            {FEATURES.map(f => (
              <button key={f.key}
                onClick={() => f.key === "proactive" ? startProactive() : setMode(f.key)}
                className={cn("cyberx-panel p-5 text-left space-y-2 transition-all cursor-pointer", f.borderColor)}>
                <f.icon className={cn("h-6 w-6", f.color)} />
                <h3 className="font-display text-base text-foreground">{f.title}</h3>
                <p className="text-xs text-muted-foreground">{f.desc}</p>
              </button>
            ))}
          </div>

          {/* Management Actions */}
          <div className="flex gap-2 flex-wrap">
            <Button variant="neon" size="sm" onClick={() => setMode("manage")}><Settings className="h-4 w-4 mr-1" /> Manage Teams & Colleagues</Button>
            <Button variant="ghost" size="sm" onClick={() => { fetchConversations(); setShowHistory(true); }}><History className="h-4 w-4 mr-1" /> Conversation History</Button>
          </div>

          {/* Teams Section */}
          {teams.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Your Teams</h2>
              {teams.map(team => (
                <div key={team.id} className="cyberx-panel p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-accent/20 border border-accent/40 flex items-center justify-center">
                        <Users className="h-5 w-5 text-accent" />
                      </div>
                      <div>
                        <h3 className="font-display text-base text-foreground">{team.name}</h3>
                        <div className="flex items-center gap-2">
                          {team.region && <span className="flex items-center gap-1 text-[10px] text-muted-foreground"><Globe className="h-3 w-3" />{team.region}</span>}
                          <span className="text-[10px] text-muted-foreground">{team.colleagues.length} members</span>
                        </div>
                      </div>
                    </div>
                    <Button variant="neon" size="sm" onClick={() => startTeamQuery(team)}>Ask Team <ChevronRight className="h-4 w-4 ml-1" /></Button>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {team.colleagues.map(c => (
                      <button key={c.id} onClick={() => startColleagueChat(c)}
                        className="rounded-xl border border-primary/20 bg-primary/5 hover:border-primary hover:bg-primary/10 p-3 text-center space-y-1.5 transition-all cursor-pointer min-w-[110px]">
                        <div className="h-9 w-9 mx-auto rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-xs font-bold text-primary">
                          {initials(c.display_name)}
                        </div>
                        <p className="text-xs font-semibold text-foreground">{c.display_name}</p>
                        <p className={cn("text-[9px]", c.team_role === "lead" ? "text-accent" : c.team_role === "advisor" ? "text-[hsl(267_90%_66%)]" : "text-muted-foreground")}>{c.team_role}</p>
                        {c.advisor_name && (
                          <div className="flex items-center justify-center gap-1 text-[9px] text-primary"><Bot className="h-3 w-3" /><span className="truncate max-w-[80px]">{c.advisor_name}</span></div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Former Employees */}
          {formerColleagues.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-2"><UserX className="h-4 w-4" /> Former Employees</h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {formerColleagues.map(c => (
                  <button key={c.id} onClick={() => startFormerChat(c)}
                    className="cyberx-panel p-4 text-left space-y-2 border-[hsl(267_90%_66%)]/20 hover:border-[hsl(267_90%_66%)]/50 transition-all cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-[hsl(267_90%_66%)]/20 border border-[hsl(267_90%_66%)]/40 flex items-center justify-center text-xs font-bold text-[hsl(267_90%_66%)]">{initials(c.display_name)}</div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{c.display_name}</p>
                        <p className="text-[10px] text-muted-foreground">{c.job_title}</p>
                      </div>
                    </div>
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" /> Knowledge preserved • <Bot className="h-3 w-3 text-[hsl(267_90%_66%)]" /> {c.advisor_name}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══ Management Mode ═══ */}
      {mode === "manage" && (
        <div className="space-y-6">
          <Button variant="ghost" size="sm" onClick={goBack}><ArrowLeft className="h-4 w-4 mr-1" /> Back</Button>

          {/* Create Team / Add Colleague buttons */}
          <div className="flex gap-3 flex-wrap">
            <Dialog open={showCreateTeam} onOpenChange={setShowCreateTeam}>
              <DialogTrigger asChild><Button variant="hero" size="sm"><Plus className="h-4 w-4" /> Create Team</Button></DialogTrigger>
              <DialogContent className="bg-background border-border">
                <DialogHeader><DialogTitle className="text-foreground">Create New Team</DialogTitle></DialogHeader>
                <div className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">Team Name</label>
                    <input value={newTeam.name} onChange={e => setNewTeam(p => ({ ...p, name: e.target.value }))} placeholder="e.g., SOC Operations" className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground outline-none focus:border-primary" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">Description</label>
                    <input value={newTeam.description} onChange={e => setNewTeam(p => ({ ...p, description: e.target.value }))} placeholder="Optional description" className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground outline-none focus:border-primary" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">Region</label>
                    <input value={newTeam.region} onChange={e => setNewTeam(p => ({ ...p, region: e.target.value }))} placeholder="e.g., North America" className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground outline-none focus:border-primary" />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" onClick={() => setShowCreateTeam(false)}>Cancel</Button>
                    <Button variant="hero" onClick={createTeam}>Create Team</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={showAddColleague} onOpenChange={setShowAddColleague}>
              <DialogTrigger asChild><Button variant="neon" size="sm"><Plus className="h-4 w-4" /> Add Colleague</Button></DialogTrigger>
              <DialogContent className="bg-background border-border">
                <DialogHeader><DialogTitle className="text-foreground">Add New Colleague</DialogTitle></DialogHeader>
                <div className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">Full Name</label>
                    <input value={newColleague.display_name} onChange={e => setNewColleague(p => ({ ...p, display_name: e.target.value }))} placeholder="e.g., Sarah Chen" className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground outline-none focus:border-primary" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <label className="text-sm text-muted-foreground">Department</label>
                      <input value={newColleague.department} onChange={e => setNewColleague(p => ({ ...p, department: e.target.value }))} placeholder="Security Operations" className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground outline-none focus:border-primary" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-muted-foreground">Job Title</label>
                      <input value={newColleague.job_title} onChange={e => setNewColleague(p => ({ ...p, job_title: e.target.value }))} placeholder="SOC Analyst" className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground outline-none focus:border-primary" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">Assign Advisor (Digital Twin)</label>
                    <Select value={newColleague.advisor_id} onValueChange={v => setNewColleague(p => ({ ...p, advisor_id: v }))}>
                      <SelectTrigger className="bg-secondary border-border"><SelectValue placeholder="Choose an advisor…" /></SelectTrigger>
                      <SelectContent>
                        {advisorOptions.map(a => <SelectItem key={a.id} value={a.id}>{a.name} — {a.role}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                    <input type="checkbox" checked={newColleague.is_former} onChange={e => setNewColleague(p => ({ ...p, is_former: e.target.checked }))} className="rounded" />
                    Former Employee
                  </label>
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" onClick={() => setShowAddColleague(false)}>Cancel</Button>
                    <Button variant="hero" onClick={createColleague}>Add Colleague</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Teams Management */}
          <div className="space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Teams ({teams.length})</h2>
            {teams.map(team => (
              <div key={team.id} className="cyberx-panel p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-accent" />
                    <h3 className="text-sm font-semibold text-foreground">{team.name}</h3>
                    {team.region && <span className="cyberx-pill text-[9px]">{team.region}</span>}
                  </div>
                  <div className="flex gap-1">
                    <Dialog open={showAssignColleague && assignTeamId === team.id} onOpenChange={v => { setShowAssignColleague(v); if (v) setAssignTeamId(team.id); }}>
                      <DialogTrigger asChild><Button variant="ghost" size="sm"><Plus className="h-3.5 w-3.5 mr-1" /> Assign</Button></DialogTrigger>
                      <DialogContent className="bg-background border-border">
                        <DialogHeader><DialogTitle className="text-foreground">Add to {team.name}</DialogTitle></DialogHeader>
                        <div className="space-y-2 pt-2 max-h-80 overflow-y-auto">
                          {colleagues.filter(c => !team.colleagues.some(tc => tc.id === c.id)).map(c => (
                            <button key={c.id} onClick={() => assignColleagueToTeam(c.id)}
                              className="w-full text-left rounded-lg border border-border/40 bg-secondary/30 p-3 hover:border-primary/40 transition-all flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-xs font-bold text-primary">{initials(c.display_name)}</div>
                              <div>
                                <p className="text-sm text-foreground">{c.display_name}</p>
                                <p className="text-[10px] text-muted-foreground">{c.job_title} • {c.department}</p>
                              </div>
                            </button>
                          ))}
                          {colleagues.filter(c => !team.colleagues.some(tc => tc.id === c.id)).length === 0 && (
                            <p className="text-sm text-muted-foreground text-center py-4">All colleagues are already assigned.</p>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => deleteTeam(team.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {team.colleagues.map(c => (
                    <div key={c.id} className="flex items-center gap-1.5 rounded-full bg-secondary/50 border border-border/40 pl-1.5 pr-1 py-0.5 text-[10px] group">
                      <div className="h-4 w-4 rounded-full bg-primary/20 flex items-center justify-center text-[7px] font-bold text-primary">{c.display_name[0]}</div>
                      <span className="text-foreground">{c.display_name}</span>
                      <span className="text-muted-foreground">({c.team_role})</span>
                      <button onClick={() => removeFromTeam(team.id, c.id)} className="opacity-0 group-hover:opacity-100 text-destructive hover:bg-destructive/10 rounded-full p-0.5 transition-all"><X className="h-3 w-3" /></button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Colleagues Management */}
          <div className="space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">All Colleagues ({colleagues.length})</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {colleagues.map(c => (
                <div key={c.id} className="cyberx-panel p-3 space-y-2 group">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className={cn("h-8 w-8 rounded-full border flex items-center justify-center text-xs font-bold", c.is_former_employee ? "bg-[hsl(267_90%_66%)]/20 border-[hsl(267_90%_66%)]/40 text-[hsl(267_90%_66%)]" : "bg-primary/20 border-primary/40 text-primary")}>{initials(c.display_name)}</div>
                      <div>
                        <p className="text-xs font-semibold text-foreground">{c.display_name}</p>
                        <p className="text-[10px] text-muted-foreground">{c.job_title}</p>
                      </div>
                    </div>
                    <button onClick={() => deleteColleague(c.id)} className="opacity-0 group-hover:opacity-100 text-destructive hover:bg-destructive/10 rounded p-1 transition-all"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {c.is_former_employee && <span className="cyberx-pill text-[9px] border-[hsl(267_90%_66%)]/40 text-[hsl(267_90%_66%)]">Former</span>}
                    {c.department && <span className="cyberx-pill text-[9px]">{c.department}</span>}
                    {c.advisor_name && <span className="text-[9px] text-primary flex items-center gap-0.5"><Bot className="h-3 w-3" />{c.advisor_name}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══ Colleague Picker ═══ */}
      {mode === "colleague" && !chatTarget && (
        <div className="space-y-4">
          <h2 className="font-display text-lg text-foreground">Choose a Colleague</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {activeColleagues.map(c => (
              <button key={c.id} onClick={() => startColleagueChat(c)} className="cyberx-panel p-4 text-left space-y-2 hover:border-primary/50 transition-all cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-xs font-bold text-primary">{initials(c.display_name)}</div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{c.display_name}</p>
                    <p className="text-[10px] text-muted-foreground">{c.job_title} • {c.department}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ═══ Former Employee Picker ═══ */}
      {mode === "former" && !chatTarget && (
        <div className="space-y-4">
          <h2 className="font-display text-lg text-foreground">Ask a Former Employee</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {formerColleagues.map(c => (
              <button key={c.id} onClick={() => startFormerChat(c)} className="cyberx-panel p-4 text-left space-y-2 border-[hsl(267_90%_66%)]/20 hover:border-[hsl(267_90%_66%)]/50 transition-all cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-[hsl(267_90%_66%)]/20 border border-[hsl(267_90%_66%)]/40 flex items-center justify-center text-xs font-bold text-[hsl(267_90%_66%)]">{initials(c.display_name)}</div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{c.display_name}</p>
                    <p className="text-[10px] text-muted-foreground">{c.job_title}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ═══ Team Picker ═══ */}
      {mode === "team" && !teamTarget && (
        <div className="space-y-4">
          <h2 className="font-display text-lg text-foreground">Ask an Entire Team</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {teams.map(t => (
              <button key={t.id} onClick={() => startTeamQuery(t)} className="cyberx-panel p-5 text-left space-y-3 hover:border-accent/50 transition-all cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-accent/20 border border-accent/40 flex items-center justify-center"><Users className="h-5 w-5 text-accent" /></div>
                  <div>
                    <h3 className="font-display text-base text-foreground">{t.name}</h3>
                    <p className="text-[10px] text-muted-foreground">{t.colleagues.length} members • {t.region}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ═══ Chat Interface (Colleague / Former / Team / Proactive) ═══ */}
      {((mode === "colleague" || mode === "former") && chatTarget) || (mode === "team" && teamTarget) || mode === "proactive" ? (
        <div className="space-y-4">
          {/* Chat Header */}
          <div className="cyberx-panel p-4">
            <div className="flex items-center gap-3">
              {mode === "proactive" ? (
                <>
                  <div className="h-10 w-10 rounded-lg bg-[hsl(38_95%_55%)]/20 border border-[hsl(38_95%_55%)]/40 flex items-center justify-center"><Sparkles className="h-5 w-5 text-[hsl(38_95%_55%)]" /></div>
                  <div><h2 className="font-display text-base text-foreground">Proactive Assistant</h2><p className="text-xs text-muted-foreground">Auto-generate briefings and reports</p></div>
                </>
              ) : mode === "team" && teamTarget ? (
                <>
                  <div className="h-10 w-10 rounded-lg bg-accent/20 border border-accent/40 flex items-center justify-center"><Users className="h-5 w-5 text-accent" /></div>
                  <div><h2 className="font-display text-base text-foreground">{teamTarget.name}</h2><p className="text-xs text-muted-foreground">{teamTarget.colleagues.filter(c => c.advisor_id).length} twins collaborating</p></div>
                </>
              ) : chatTarget ? (
                <>
                  <div className={cn("h-10 w-10 rounded-full border flex items-center justify-center text-xs font-bold", mode === "former" ? "bg-[hsl(267_90%_66%)]/20 border-[hsl(267_90%_66%)]/40 text-[hsl(267_90%_66%)]" : "bg-primary/20 border-primary/40 text-primary")}>{initials(chatTarget.display_name)}</div>
                  <div>
                    <h2 className="font-display text-base text-foreground">{chatTarget.display_name}'s Twin {chatTarget.is_former_employee && <span className="text-xs text-muted-foreground ml-1">(Former)</span>}</h2>
                    <p className="text-xs text-muted-foreground">{chatTarget.advisor_name} • {chatTarget.job_title}</p>
                  </div>
                </>
              ) : null}
            </div>
          </div>

          {/* Proactive type selector */}
          {mode === "proactive" && (
            <div className="flex gap-2 flex-wrap">
              {([
                { key: "brief" as const, label: "Daily Brief", icon: Briefcase },
                { key: "meeting" as const, label: "Meeting Prep", icon: MessageSquare },
                { key: "handoff" as const, label: "Shift Handoff", icon: Users },
              ]).map(t => (
                <button key={t.key} onClick={() => {
                  setProactiveType(t.key);
                  setQuery(t.key === "brief" ? "Generate a concise daily security briefing covering the latest threats, active incidents, and key recommendations." : t.key === "meeting" ? "Prepare meeting notes summarizing each team member's current focus, blockers, and recommendations." : "Create a shift handoff report covering open incidents, pending actions, and escalation items.");
                }} className={cn("cyberx-pill text-xs cursor-pointer transition-all flex items-center gap-1.5", proactiveType === t.key ? "border-[hsl(38_95%_55%)] text-[hsl(38_95%_55%)]" : "text-muted-foreground hover:text-foreground")}>
                  <t.icon className="h-3.5 w-3.5" /> {t.label}
                </button>
              ))}
            </div>
          )}

          {/* Messages */}
          {messages.length > 0 && (
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {messages.map((msg, i) => (
                <div key={i} className={cn("rounded-xl p-4 text-sm", msg.role === "user" ? "bg-secondary/50 border border-border/40 ml-12" : "cyberx-panel border-primary/20")}>
                  <p className="text-[10px] text-muted-foreground mb-1.5">{msg.role === "user" ? "You" : (chatTarget?.display_name || teamTarget?.name || "Assistant")}</p>
                  <div className="prose prose-invert prose-sm max-w-none text-foreground">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="flex gap-2">
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !chatLoading && sendChat()}
              placeholder={mode === "proactive" ? "Describe what you need prepared…" : `Ask ${chatTarget?.display_name || teamTarget?.name || ""}…`}
              className="flex-1 rounded-lg border border-border/80 bg-secondary/60 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary"
            />
            <Button variant="hero" onClick={sendChat} disabled={chatLoading || !query.trim()}>
              {chatLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      ) : null}
    </CyberXLayout>
  );
}
