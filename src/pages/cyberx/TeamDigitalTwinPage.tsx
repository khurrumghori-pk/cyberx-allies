import { useState, useEffect } from "react";
import { CyberXLayout } from "@/components/cyberx/CyberXLayout";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import {
  Users, Bot, MessageSquare, Loader2, Send, User,
  Building2, Globe, ChevronRight, Clock, UserX, Briefcase,
  ArrowLeft, Sparkles
} from "lucide-react";

/* ── Types ─────────────────────────────────────────────── */

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

const TWIN_CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/twin-to-twin-chat`;

/* ── Feature Cards ─────────────────────────────────────── */

const FEATURES = [
  {
    key: "colleague",
    title: "Ask a Colleague",
    desc: "Their twin preps you like your best teammate",
    icon: User,
    color: "text-primary",
    borderColor: "border-primary/30 hover:border-primary/60",
  },
  {
    key: "team",
    title: "Ask an Entire Team",
    desc: "One question. A whole team's answer.",
    icon: Users,
    color: "text-accent",
    borderColor: "border-accent/30 hover:border-accent/60",
  },
  {
    key: "proactive",
    title: "A Proactive Assistant",
    desc: "Gets essentials ready on time",
    icon: Sparkles,
    color: "text-[hsl(38_95%_55%)]",
    borderColor: "border-[hsl(38_95%_55%)]/30 hover:border-[hsl(38_95%_55%)]/60",
  },
  {
    key: "former",
    title: "Ask a Former Employee",
    desc: "They've moved on. Their experience hasn't.",
    icon: MessageSquare,
    color: "text-[hsl(267_90%_66%)]",
    borderColor: "border-[hsl(267_90%_66%)]/30 hover:border-[hsl(267_90%_66%)]/60",
  },
] as const;

type FeatureKey = typeof FEATURES[number]["key"];

/* ── Component ─────────────────────────────────────────── */

export function TeamDigitalTwinPage() {
  const { user } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [colleagues, setColleagues] = useState<Colleague[]>([]);
  const [loading, setLoading] = useState(true);

  // Chat state
  const [mode, setMode] = useState<"overview" | FeatureKey>("overview");
  const [chatTarget, setChatTarget] = useState<Colleague | null>(null);
  const [teamTarget, setTeamTarget] = useState<Team | null>(null);
  const [query, setQuery] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [response, setResponse] = useState("");
  const [proactiveType, setProactiveType] = useState<"brief" | "meeting" | "handoff">("brief");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [teamsRes, colleaguesRes, teamColRes, advisorsRes] = await Promise.all([
        supabase.from("teams").select("*"),
        supabase.from("colleagues").select("*"),
        supabase.from("team_colleagues").select("*"),
        supabase.from("advisors").select("id, name, role"),
      ]);

      const advs = advisorsRes.data || [];
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
  };

  const initials = (name: string) => name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  const sendChat = async () => {
    if (!query.trim()) return;
    setChatLoading(true);
    setResponse("");
    let accumulated = "";

    try {
      const body: any = { message: query };

      if (mode === "colleague" && chatTarget?.advisor_id) {
        body.targetAdvisorId = chatTarget.advisor_id;
        body.targetUserName = chatTarget.display_name;
        body.mode = "twin";
      } else if (mode === "team" && teamTarget) {
        body.teamName = teamTarget.name;
        body.teamMembers = teamTarget.colleagues
          .filter((c) => c.advisor_id)
          .map((c) => ({
            name: c.display_name,
            role: c.advisor_role,
            advisorName: c.advisor_name,
          }));
        body.mode = "team";
      } else if (mode === "former" && chatTarget?.advisor_id) {
        body.targetAdvisorId = chatTarget.advisor_id;
        body.targetUserName = chatTarget.display_name;
        body.mode = "twin";
        body.context = `This is the Digital Twin of ${chatTarget.display_name}, a former ${chatTarget.job_title}. They previously worked in the ${chatTarget.department} department. Their institutional knowledge has been preserved in this Digital Twin.`;
      } else if (mode === "proactive") {
        body.mode = "team";
        const allColleagues = colleagues.filter((c) => c.advisor_id && !c.is_former_employee);
        body.teamName = "All Active Colleagues";
        body.teamMembers = allColleagues.map((c) => ({
          name: c.display_name,
          role: c.advisor_role,
          advisorName: c.advisor_name,
        }));
      }

      const resp = await fetch(TWIN_CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
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
            if (content) { accumulated += content; setResponse(accumulated); }
          } catch { buffer = line + "\n" + buffer; break; }
        }
      }
    } catch (err: any) {
      setResponse(`⚠ Error: ${err.message}`);
    } finally {
      setChatLoading(false);
    }
  };

  const goBack = () => {
    setMode("overview");
    setChatTarget(null);
    setTeamTarget(null);
    setResponse("");
    setQuery("");
  };

  const startColleagueChat = (c: Colleague) => {
    setChatTarget(c);
    setMode("colleague");
    setResponse("");
    setQuery("");
  };

  const startFormerChat = (c: Colleague) => {
    setChatTarget(c);
    setMode("former");
    setResponse("");
    setQuery("");
  };

  const startTeamQuery = (t: Team) => {
    setTeamTarget(t);
    setMode("team");
    setResponse("");
    setQuery("");
  };

  const startProactive = () => {
    setMode("proactive");
    setResponse("");
    setQuery("");
  };

  const activeColleagues = colleagues.filter((c) => !c.is_former_employee && c.advisor_id);
  const formerColleagues = colleagues.filter((c) => c.is_former_employee && c.advisor_id);

  if (loading) {
    return (
      <CyberXLayout title="Team Digital Twin" breadcrumb={["CyberX", "Team Twin"]}>
        <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      </CyberXLayout>
    );
  }

  return (
    <CyberXLayout title="Team Digital Twin" breadcrumb={["CyberX", "Team Twin"]}>
      {mode !== "overview" && (
        <Button variant="ghost" size="sm" className="mb-2" onClick={goBack}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Overview
        </Button>
      )}

      {/* ─── Overview ─── */}
      {mode === "overview" && (
        <div className="space-y-6">
          {/* Feature Cards */}
          <div className="grid gap-4 sm:grid-cols-2">
            {FEATURES.map((f) => (
              <button
                key={f.key}
                onClick={() => {
                  if (f.key === "proactive") startProactive();
                  else setMode(f.key);
                }}
                className={cn(
                  "cyberx-panel p-5 text-left space-y-2 transition-all cursor-pointer",
                  f.borderColor
                )}
              >
                <f.icon className={cn("h-6 w-6", f.color)} />
                <h3 className="font-display text-base text-foreground">{f.title}</h3>
                <p className="text-xs text-muted-foreground">{f.desc}</p>
              </button>
            ))}
          </div>

          {/* Teams Section */}
          {teams.length === 0 ? (
            <div className="cyberx-panel p-10 text-center space-y-3">
              <Building2 className="h-10 w-10 text-muted-foreground mx-auto" />
              <p className="text-sm text-muted-foreground">No teams yet. Ask an admin to create teams and assign Digital Twins.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Your Teams</h2>
              {teams.map((team) => (
                <div key={team.id} className="cyberx-panel p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-accent/20 border border-accent/40 flex items-center justify-center">
                        <Users className="h-5 w-5 text-accent" />
                      </div>
                      <div>
                        <h3 className="font-display text-base text-foreground">{team.name}</h3>
                        <div className="flex items-center gap-2">
                          {team.region && (
                            <span className="flex items-center gap-1 text-[10px] text-muted-foreground"><Globe className="h-3 w-3" />{team.region}</span>
                          )}
                          <span className="text-[10px] text-muted-foreground">{team.colleagues.length} members</span>
                        </div>
                      </div>
                    </div>
                    <Button variant="neon" size="sm" onClick={() => startTeamQuery(team)}>
                      Ask Team <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>

                  {/* Org chart members */}
                  <div className="flex flex-wrap gap-3">
                    {team.colleagues.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => startColleagueChat(c)}
                        className="rounded-xl border border-primary/20 bg-primary/5 hover:border-primary hover:bg-primary/10 p-3 text-center space-y-1.5 transition-all cursor-pointer min-w-[110px]"
                      >
                        <div className="h-9 w-9 mx-auto rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-xs font-bold text-primary">
                          {initials(c.display_name)}
                        </div>
                        <p className="text-xs font-semibold text-foreground">{c.display_name}</p>
                        <p className={cn("text-[9px]", c.team_role === "lead" ? "text-accent" : "text-muted-foreground")}>{c.team_role}</p>
                        {c.advisor_name && (
                          <div className="flex items-center justify-center gap-1 text-[9px] text-primary">
                            <Bot className="h-3 w-3" /><span className="truncate">{c.advisor_name}</span>
                          </div>
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
              <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <UserX className="h-4 w-4" /> Former Employees
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {formerColleagues.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => startFormerChat(c)}
                    className="cyberx-panel p-4 text-left space-y-2 border-[hsl(267_90%_66%)]/20 hover:border-[hsl(267_90%_66%)]/50 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-[hsl(267_90%_66%)]/20 border border-[hsl(267_90%_66%)]/40 flex items-center justify-center text-xs font-bold text-[hsl(267_90%_66%)]">
                        {initials(c.display_name)}
                      </div>
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

      {/* ─── Colleague Picker (when mode=colleague but no target) ─── */}
      {mode === "colleague" && !chatTarget && (
        <div className="space-y-4">
          <h2 className="font-display text-lg text-foreground">Choose a Colleague</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {activeColleagues.map((c) => (
              <button
                key={c.id}
                onClick={() => startColleagueChat(c)}
                className="cyberx-panel p-4 text-left space-y-2 hover:border-primary/50 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-xs font-bold text-primary">
                    {initials(c.display_name)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{c.display_name}</p>
                    <p className="text-[10px] text-muted-foreground">{c.job_title} • {c.department}</p>
                  </div>
                </div>
                <p className="text-[10px] text-primary flex items-center gap-1"><Bot className="h-3 w-3" />{c.advisor_name}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ─── Former Employee Picker ─── */}
      {mode === "former" && !chatTarget && (
        <div className="space-y-4">
          <h2 className="font-display text-lg text-foreground">Ask a Former Employee</h2>
          <p className="text-sm text-muted-foreground">Their institutional knowledge lives on through their Digital Twin.</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {formerColleagues.map((c) => (
              <button
                key={c.id}
                onClick={() => startFormerChat(c)}
                className="cyberx-panel p-4 text-left space-y-2 border-[hsl(267_90%_66%)]/20 hover:border-[hsl(267_90%_66%)]/50 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-[hsl(267_90%_66%)]/20 border border-[hsl(267_90%_66%)]/40 flex items-center justify-center text-xs font-bold text-[hsl(267_90%_66%)]">
                    {initials(c.display_name)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{c.display_name}</p>
                    <p className="text-[10px] text-muted-foreground">{c.job_title}</p>
                  </div>
                </div>
                <p className="text-[10px] text-[hsl(267_90%_66%)] flex items-center gap-1"><Bot className="h-3 w-3" />{c.advisor_name}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ─── Team Picker (when mode=team but no target) ─── */}
      {mode === "team" && !teamTarget && (
        <div className="space-y-4">
          <h2 className="font-display text-lg text-foreground">Ask an Entire Team</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {teams.map((t) => (
              <button
                key={t.id}
                onClick={() => startTeamQuery(t)}
                className="cyberx-panel p-5 text-left space-y-3 hover:border-accent/50 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-accent/20 border border-accent/40 flex items-center justify-center">
                    <Users className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-display text-base text-foreground">{t.name}</h3>
                    <p className="text-[10px] text-muted-foreground">{t.colleagues.length} members • {t.region}</p>
                  </div>
                </div>
                <div className="flex gap-1 flex-wrap">
                  {t.colleagues.slice(0, 4).map((c) => (
                    <span key={c.id} className="cyberx-pill text-[9px]">{c.display_name}</span>
                  ))}
                  {t.colleagues.length > 4 && <span className="cyberx-pill text-[9px]">+{t.colleagues.length - 4}</span>}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ─── Colleague / Former Employee Chat ─── */}
      {(mode === "colleague" || mode === "former") && chatTarget && (
        <div className="space-y-4">
          <div className="cyberx-panel p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className={cn(
                "h-12 w-12 rounded-full border flex items-center justify-center text-sm font-bold",
                mode === "former"
                  ? "bg-[hsl(267_90%_66%)]/20 border-[hsl(267_90%_66%)]/40 text-[hsl(267_90%_66%)]"
                  : "bg-primary/20 border-primary/40 text-primary"
              )}>
                {initials(chatTarget.display_name)}
              </div>
              <div>
                <h2 className="font-display text-lg text-foreground">
                  {chatTarget.display_name}'s Digital Twin
                  {chatTarget.is_former_employee && <span className="ml-2 text-xs text-muted-foreground">(Former Employee)</span>}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {chatTarget.advisor_name} • {chatTarget.job_title}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendChat()}
                placeholder={`Ask ${chatTarget.display_name}'s twin…`}
                className="flex-1 rounded-lg border border-border/80 bg-secondary/60 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary"
              />
              <Button variant="hero" onClick={sendChat} disabled={chatLoading || !query.trim()}>
                {chatLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>

            {/* Suggested prompts */}
            <div className="flex gap-2 flex-wrap">
              {(mode === "former" ? [
                "What were the main challenges you faced?",
                "How did you handle incident escalation?",
                "What processes did you create?",
              ] : [
                "What are you working on this week?",
                "Brief me before our meeting",
                "What's the status of the latest incident?",
              ]).map((p) => (
                <button
                  key={p}
                  onClick={() => { setQuery(p); }}
                  className="cyberx-pill text-[10px] cursor-pointer hover:border-primary/60 hover:text-primary transition-all"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {response && (
            <div className={cn(
              "cyberx-panel p-5 space-y-3",
              mode === "former" ? "border-[hsl(267_90%_66%)]/30" : "border-primary/30"
            )}>
              <p className={cn(
                "cyberx-pill",
                mode === "former" ? "border-[hsl(267_90%_66%)]/40 text-[hsl(267_90%_66%)]" : "border-primary/40 text-primary"
              )}>
                {chatTarget.display_name}'s Twin Response
              </p>
              <div className="prose prose-invert prose-sm max-w-none text-sm text-foreground">
                <ReactMarkdown>{response}</ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── Team Query Chat ─── */}
      {mode === "team" && teamTarget && (
        <div className="space-y-4">
          <div className="cyberx-panel p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-accent/20 border border-accent/40 flex items-center justify-center">
                <Users className="h-6 w-6 text-accent" />
              </div>
              <div>
                <h2 className="font-display text-lg text-foreground">Ask {teamTarget.name}</h2>
                <p className="text-xs text-muted-foreground">
                  {teamTarget.colleagues.filter((c) => c.advisor_id).length} Digital Twins will collaborate
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendChat()}
                placeholder="Ask the entire team…"
                className="flex-1 rounded-lg border border-border/80 bg-secondary/60 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary"
              />
              <Button variant="hero" onClick={sendChat} disabled={chatLoading || !query.trim()}>
                {chatLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>

            {/* Team members preview */}
            <div className="flex gap-2 flex-wrap">
              {teamTarget.colleagues.filter((c) => c.advisor_id).map((c) => (
                <div key={c.id} className="flex items-center gap-1.5 rounded-full bg-secondary/50 border border-border/40 px-2.5 py-1 text-[10px]">
                  <div className="h-4 w-4 rounded-full bg-primary/20 flex items-center justify-center text-[7px] font-bold text-primary">
                    {c.display_name[0]}
                  </div>
                  <span className="text-foreground">{c.display_name}</span>
                  <Bot className="h-3 w-3 text-primary" />
                </div>
              ))}
            </div>
          </div>

          {response && (
            <div className="cyberx-panel border-accent/30 p-5 space-y-3">
              <p className="cyberx-pill border-accent/40 text-accent">Collective Team Response</p>
              <div className="prose prose-invert prose-sm max-w-none text-sm text-foreground">
                <ReactMarkdown>{response}</ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── Proactive Assistant ─── */}
      {mode === "proactive" && (
        <div className="space-y-4">
          <div className="cyberx-panel p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-[hsl(38_95%_55%)]/20 border border-[hsl(38_95%_55%)]/40 flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-[hsl(38_95%_55%)]" />
              </div>
              <div>
                <h2 className="font-display text-lg text-foreground">Proactive Assistant</h2>
                <p className="text-xs text-muted-foreground">Auto-generate briefings, meeting prep, and handoff notes</p>
              </div>
            </div>

            {/* Proactive type selector */}
            <div className="flex gap-2">
              {([
                { key: "brief", label: "Daily Security Brief", icon: Briefcase },
                { key: "meeting", label: "Meeting Prep Notes", icon: MessageSquare },
                { key: "handoff", label: "Shift Handoff Report", icon: Users },
              ] as const).map((t) => (
                <button
                  key={t.key}
                  onClick={() => {
                    setProactiveType(t.key);
                    setQuery(
                      t.key === "brief" ? "Generate a concise daily security briefing covering the latest threats, active incidents, and key recommendations from all team advisors."
                      : t.key === "meeting" ? "Prepare meeting notes summarizing each team member's current focus, blockers, and recommendations for our security standup."
                      : "Create a shift handoff report covering open incidents, pending actions, and escalation items that the next shift needs to know about."
                    );
                  }}
                  className={cn(
                    "cyberx-pill text-xs cursor-pointer transition-all flex items-center gap-1.5",
                    proactiveType === t.key
                      ? "border-[hsl(38_95%_55%)] text-[hsl(38_95%_55%)]"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <t.icon className="h-3.5 w-3.5" /> {t.label}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendChat()}
                placeholder="Describe what you need prepared…"
                className="flex-1 rounded-lg border border-border/80 bg-secondary/60 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary"
              />
              <Button variant="hero" onClick={sendChat} disabled={chatLoading || !query.trim()}>
                {chatLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {response && (
            <div className="cyberx-panel border-[hsl(38_95%_55%)]/30 p-5 space-y-3">
              <p className="cyberx-pill border-[hsl(38_95%_55%)]/40 text-[hsl(38_95%_55%)]">
                {proactiveType === "brief" ? "Daily Security Brief" : proactiveType === "meeting" ? "Meeting Prep Notes" : "Shift Handoff Report"}
              </p>
              <div className="prose prose-invert prose-sm max-w-none text-sm text-foreground">
                <ReactMarkdown>{response}</ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      )}
    </CyberXLayout>
  );
}
