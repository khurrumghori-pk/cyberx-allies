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
  Building2, Globe, ChevronRight
} from "lucide-react";

interface Profile {
  id: string;
  display_name: string | null;
  username: string | null;
}

interface TeamMemberWithContext {
  user_id: string;
  role: string;
  profile: Profile | null;
  advisor: { id: string; name: string; role: string; tier: string | null } | null;
}

interface Team {
  id: string;
  name: string;
  region: string | null;
  members: TeamMemberWithContext[];
}

const TWIN_CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/twin-to-twin-chat`;

export function TeamDigitalTwinPage() {
  const { user } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [chatTarget, setChatTarget] = useState<TeamMemberWithContext | null>(null);
  const [teamQueryTeam, setTeamQueryTeam] = useState<Team | null>(null);
  const [query, setQuery] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [response, setResponse] = useState("");
  const [mode, setMode] = useState<"overview" | "twin-chat" | "team-query">("overview");

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const [teamsRes, membersRes, profilesRes, advisorsRes] = await Promise.all([
        supabase.from("teams").select("*"),
        supabase.from("team_members").select("*"),
        supabase.from("profiles").select("*"),
        supabase.from("advisors").select("id, name, role, tier, assigned_user_id"),
      ]);

      const profs = profilesRes.data || [];
      const advs = advisorsRes.data || [];
      const mems = membersRes.data || [];
      const tms = teamsRes.data || [];

      const built: Team[] = tms.map((t: any) => ({
        ...t,
        members: mems
          .filter((m: any) => m.team_id === t.id)
          .map((m: any) => ({
            user_id: m.user_id,
            role: m.role,
            profile: profs.find((p) => p.id === m.user_id) || null,
            advisor: advs.find((a) => (a as any).assigned_user_id === m.user_id) || null,
          })),
      }));
      setTeams(built);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getName = (p?: Profile | null) => p?.display_name || p?.username || "Unknown";

  const sendChat = async () => {
    if (!query.trim()) return;
    setChatLoading(true);
    setResponse("");
    let accumulated = "";

    try {
      const body: any = { message: query };

      if (mode === "twin-chat" && chatTarget?.advisor) {
        body.targetAdvisorId = chatTarget.advisor.id;
        body.targetUserName = getName(chatTarget.profile);
        body.mode = "twin";
      } else if (mode === "team-query" && teamQueryTeam) {
        body.teamName = teamQueryTeam.name;
        body.teamMembers = teamQueryTeam.members
          .filter((m) => m.advisor)
          .map((m) => ({
            name: getName(m.profile),
            role: m.advisor?.role,
            advisorName: m.advisor?.name,
          }));
        body.mode = "team";
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

  const startTwinChat = (member: TeamMemberWithContext) => {
    setChatTarget(member);
    setMode("twin-chat");
    setResponse("");
    setQuery("");
  };

  const startTeamQuery = (team: Team) => {
    setTeamQueryTeam(team);
    setMode("team-query");
    setResponse("");
    setQuery("");
  };

  if (loading) {
    return (
      <CyberXLayout title="Team Digital Twin" breadcrumb={["CyberX", "Team Twin"]}>
        <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      </CyberXLayout>
    );
  }

  return (
    <CyberXLayout title="Team Digital Twin" breadcrumb={["CyberX", "Team Twin"]}>
      {mode !== "overview" && (
        <Button variant="ghost" size="sm" className="mb-4" onClick={() => setMode("overview")}>
          ← Back to Teams
        </Button>
      )}

      {mode === "overview" && (
        <div className="space-y-6">
          {/* Concept cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { title: "Ask a Colleague", desc: "Their twin preps you like your best teammate", icon: User, color: "text-primary" },
              { title: "Ask an Entire Team", desc: "One question. A whole team's answer.", icon: Users, color: "text-accent" },
              { title: "A Proactive Assistant", desc: "Gets essentials ready on time", icon: Bot, color: "text-[hsl(38_95%_55%)]" },
              { title: "Ask a Former Employee", desc: "They've moved on. Their experience hasn't.", icon: MessageSquare, color: "text-[hsl(267_90%_66%)]" },
            ].map((c) => (
              <div key={c.title} className="cyberx-panel p-4 space-y-2">
                <c.icon className={cn("h-5 w-5", c.color)} />
                <h3 className="font-display text-sm text-foreground">{c.title}</h3>
                <p className="text-[10px] text-muted-foreground">{c.desc}</p>
              </div>
            ))}
          </div>

          {/* Teams & Org Chart */}
          {teams.length === 0 ? (
            <div className="cyberx-panel p-8 text-center space-y-3">
              <Building2 className="h-8 w-8 text-muted-foreground mx-auto" />
              <p className="text-sm text-muted-foreground">No teams yet. Ask an admin to create teams and assign Digital Twins.</p>
            </div>
          ) : (
            teams.map((team) => (
              <div key={team.id} className="cyberx-panel p-5 space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-accent/20 border border-accent/40 flex items-center justify-center">
                      <Users className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-display text-base text-foreground">{team.name}</h3>
                      {team.region && (
                        <span className="flex items-center gap-1 text-[10px] text-muted-foreground"><Globe className="h-3 w-3" />{team.region}</span>
                      )}
                    </div>
                  </div>
                  <Button variant="neon" size="sm" onClick={() => startTeamQuery(team)}>
                    Ask Team <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>

                {/* Org chart style */}
                <div className="flex flex-wrap gap-3">
                  {team.members.map((m) => (
                    <button
                      key={m.user_id}
                      onClick={() => m.advisor && startTwinChat(m)}
                      disabled={!m.advisor}
                      className={cn(
                        "rounded-xl border p-4 text-center space-y-2 transition-all min-w-[120px]",
                        m.advisor
                          ? "border-primary/30 bg-primary/5 hover:border-primary hover:bg-primary/10 cursor-pointer"
                          : "border-border/40 bg-secondary/30 opacity-60 cursor-not-allowed"
                      )}
                    >
                      <div className="h-10 w-10 mx-auto rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-xs font-bold text-primary">
                        {getName(m.profile).slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-foreground">{getName(m.profile)}</p>
                        <p className={cn("text-[9px]", m.role === "lead" ? "text-accent" : "text-muted-foreground")}>{m.role}</p>
                      </div>
                      {m.advisor ? (
                        <div className="flex items-center justify-center gap-1 text-[9px] text-primary">
                          <Bot className="h-3 w-3" />
                          <span>{m.advisor.name}</span>
                        </div>
                      ) : (
                        <p className="text-[9px] text-muted-foreground">No Twin</p>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Twin-to-Twin Chat */}
      {mode === "twin-chat" && chatTarget && (
        <div className="space-y-4">
          <div className="cyberx-panel p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-sm font-bold text-primary">
                {getName(chatTarget.profile).slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h2 className="font-display text-lg text-foreground">{getName(chatTarget.profile)}'s Digital Twin</h2>
                <p className="text-xs text-muted-foreground">{chatTarget.advisor?.name} • {chatTarget.advisor?.role}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendChat()}
                placeholder={`Ask ${getName(chatTarget.profile)}'s twin…`}
                className="flex-1 rounded-lg border border-border/80 bg-secondary/60 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary"
              />
              <Button variant="hero" onClick={sendChat} disabled={chatLoading || !query.trim()}>
                {chatLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {response && (
            <div className="cyberx-panel border-primary/30 p-5 space-y-3">
              <p className="cyberx-pill border-primary/40 text-primary">{getName(chatTarget.profile)}'s Twin Response</p>
              <div className="prose prose-invert prose-sm max-w-none text-sm text-foreground">
                <ReactMarkdown>{response}</ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Team Query */}
      {mode === "team-query" && teamQueryTeam && (
        <div className="space-y-4">
          <div className="cyberx-panel p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-accent/20 border border-accent/40 flex items-center justify-center">
                <Users className="h-6 w-6 text-accent" />
              </div>
              <div>
                <h2 className="font-display text-lg text-foreground">Ask {teamQueryTeam.name}</h2>
                <p className="text-xs text-muted-foreground">
                  {teamQueryTeam.members.filter((m) => m.advisor).length} Digital Twins will collaborate on your answer
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
              {teamQueryTeam.members.filter((m) => m.advisor).map((m) => (
                <div key={m.user_id} className="flex items-center gap-1.5 rounded-full bg-secondary/50 border border-border/40 px-2.5 py-1 text-[10px]">
                  <div className="h-4 w-4 rounded-full bg-primary/20 flex items-center justify-center text-[7px] font-bold text-primary">
                    {getName(m.profile).slice(0, 1)}
                  </div>
                  <span className="text-foreground">{getName(m.profile)}</span>
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
    </CyberXLayout>
  );
}
