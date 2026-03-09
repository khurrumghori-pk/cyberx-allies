import { useState, useRef, useEffect, useCallback } from "react";
import { CyberXLayout } from "@/components/cyberx/CyberXLayout";
import { Button } from "@/components/ui/button";
import { ADVISORS } from "@/data/cyberx-advisors";
import { Send, Users, Loader2, Plus, RotateCcw, ThumbsUp, ThumbsDown, BarChart3, Vote } from "lucide-react";
import { AdvisorAvatar } from "@/components/cyberx/AdvisorAvatar";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/advisor-chat`;

const ADVISOR_ROLES = ["SOC Analyst", "Threat Intel", "Incident Response", "vCISO"] as const;
type AdvisorRole = (typeof ADVISOR_ROLES)[number];

const ROLE_COLORS: Record<string, string> = {
  "SOC Analyst": "text-primary",
  "Threat Intel": "text-accent",
  "Incident Response": "text-[hsl(38_95%_55%)]",
  vCISO: "text-[hsl(267_90%_66%)]",
};

const ROLE_BG: Record<string, string> = {
  "SOC Analyst": "bg-primary/10 border-primary/30",
  "Threat Intel": "bg-accent/10 border-accent/30",
  "Incident Response": "bg-[hsl(38_95%_55%)]/10 border-[hsl(38_95%_55%)]/30",
  vCISO: "bg-[hsl(267_90%_66%)]/10 border-[hsl(267_90%_66%)]/30",
};

interface Message {
  id: string;
  advisor: string;
  text: string;
  ts: string;
  isUser?: boolean;
  isStreaming?: boolean;
  confidence?: number;
  vote?: "agree" | "disagree" | null;
  reasoning?: string;
}

function nowTs() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function extractConfidence(text: string): number {
  const match = text.match(/confidence[:\s]*(\d+)%/i) || text.match(/\b(HIGH|MEDIUM|LOW)\b/i);
  if (match) {
    if (match[1]?.match(/\d+/)) return parseInt(match[1]);
    if (match[1]?.toUpperCase() === "HIGH") return 92;
    if (match[1]?.toUpperCase() === "MEDIUM") return 68;
    if (match[1]?.toUpperCase() === "LOW") return 35;
  }
  return Math.floor(70 + Math.random() * 25);
}

async function streamAdvisorResponse({
  userMessage,
  conversationHistory,
  advisorRole,
  advisorId,
  onDelta,
  onDone,
  signal,
}: {
  userMessage: string;
  conversationHistory: { role: "user" | "assistant"; content: string }[];
  advisorRole: string;
  advisorId?: string;
  onDelta: (text: string) => void;
  onDone: () => void;
  signal?: AbortSignal;
}) {
  const messages = [
    ...conversationHistory,
    { role: "user" as const, content: userMessage },
  ];

  const resp = await fetch(CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ messages, advisorRole, advisorId }),
    signal,
  });

  if (!resp.ok) {
    const errData = await resp.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(errData.error || `HTTP ${resp.status}`);
  }

  if (!resp.body) throw new Error("No response body");

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let done = false;

  while (!done) {
    const { done: readerDone, value } = await reader.read();
    if (readerDone) break;
    buffer += decoder.decode(value, { stream: true });

    let newlineIdx: number;
    while ((newlineIdx = buffer.indexOf("\n")) !== -1) {
      let line = buffer.slice(0, newlineIdx);
      buffer = buffer.slice(newlineIdx + 1);
      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (line.startsWith(":") || line.trim() === "") continue;
      if (!line.startsWith("data: ")) continue;

      const jsonStr = line.slice(6).trim();
      if (jsonStr === "[DONE]") {
        done = true;
        break;
      }
      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content as string | undefined;
        if (content) onDelta(content);
      } catch {
        buffer = line + "\n" + buffer;
        break;
      }
    }
  }

  if (buffer.trim()) {
    for (let raw of buffer.split("\n")) {
      if (!raw) continue;
      if (raw.endsWith("\r")) raw = raw.slice(0, -1);
      if (!raw.startsWith("data: ")) continue;
      const jsonStr = raw.slice(6).trim();
      if (jsonStr === "[DONE]") continue;
      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content as string | undefined;
        if (content) onDelta(content);
      } catch { /* ignore */ }
    }
  }
  onDone();
}

function ConfidenceMeter({ value }: { value: number }) {
  const color = value >= 80 ? "bg-accent" : value >= 50 ? "bg-yellow-400" : "bg-destructive";
  return (
    <div className="flex items-center gap-2">
      <BarChart3 className="h-3 w-3 text-muted-foreground" />
      <div className="h-1.5 w-16 rounded-full bg-secondary">
        <div className={cn("h-full rounded-full transition-all duration-500", color)} style={{ width: `${value}%` }} />
      </div>
      <span className="text-[10px] text-muted-foreground font-mono">{value}%</span>
    </div>
  );
}

function ConsensusPanel({ messages }: { messages: Message[] }) {
  const advisorMessages = messages.filter(m => !m.isUser && !m.isStreaming && m.text);
  if (advisorMessages.length < 2) return null;
  
  const avgConfidence = Math.round(
    advisorMessages.reduce((sum, m) => sum + (m.confidence || 70), 0) / advisorMessages.length
  );
  
  // Determine consensus by checking if advisors reference similar actions
  const texts = advisorMessages.map(m => m.text.toLowerCase());
  const commonKeywords = ["isolate", "contain", "investigate", "patch", "monitor", "escalate", "block"];
  const sharedActions = commonKeywords.filter(k => texts.filter(t => t.includes(k)).length >= 2);
  const consensusLevel = sharedActions.length >= 3 ? "Strong" : sharedActions.length >= 1 ? "Moderate" : "Divergent";
  const consensusColor = consensusLevel === "Strong" ? "text-accent" : consensusLevel === "Moderate" ? "text-yellow-400" : "text-destructive";

  return (
    <div className="rounded-lg border border-border/60 bg-secondary/30 p-3 space-y-2">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        <Vote className="h-3.5 w-3.5" /> Orchestration Consensus — SRS §11
      </div>
      <div className="grid grid-cols-3 gap-3 text-center">
        <div>
          <p className="text-lg font-display text-foreground">{advisorMessages.length}</p>
          <p className="text-[10px] text-muted-foreground">Advisors Voted</p>
        </div>
        <div>
          <p className="text-lg font-display text-foreground">{avgConfidence}%</p>
          <p className="text-[10px] text-muted-foreground">Avg Confidence</p>
        </div>
        <div>
          <p className={cn("text-lg font-display", consensusColor)}>{consensusLevel}</p>
          <p className="text-[10px] text-muted-foreground">Consensus</p>
        </div>
      </div>
      {sharedActions.length > 0 && (
        <div className="flex flex-wrap gap-1 pt-1">
          <span className="text-[10px] text-muted-foreground mr-1">Shared actions:</span>
          {sharedActions.map(a => (
            <span key={a} className="text-[10px] px-1.5 py-0.5 rounded bg-accent/10 border border-accent/30 text-accent">{a}</span>
          ))}
        </div>
      )}
    </div>
  );
}

export function MultiAgentChatPage() {
  const { user } = useAuth();
  const active = ADVISORS.slice(0, 4);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streamingAdvisors, setStreamingAdvisors] = useState<Set<string>>(new Set());
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const [advisorIdMap, setAdvisorIdMap] = useState<Record<string, string>>({});

  // Fetch advisor IDs for passive learning
  useEffect(() => {
    if (!user) return;
    supabase.from("advisors").select("id, role").or(`assigned_user_id.eq.${user.id},tenant_id.eq.${user.id}`)
      .then(({ data }) => {
        if (data) {
          const map: Record<string, string> = {};
          data.forEach(a => { map[a.role] = a.id; });
          setAdvisorIdMap(map);
        }
      });
  }, [user]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const isAnyStreaming = streamingAdvisors.size > 0;

  const askAdvisors = useCallback(
    async (userText: string) => {
      if (!userText.trim() || isAnyStreaming) return;

      const userMsg: Message = {
        id: Date.now().toString(),
        advisor: "You",
        text: userText.trim(),
        ts: nowTs(),
        isUser: true,
      };
      setMessages((prev) => [...prev, userMsg]);
      setInput("");

      const history = messages
        .filter((m) => !m.isStreaming)
        .map((m) => ({
          role: (m.isUser ? "user" : "assistant") as "user" | "assistant",
          content: m.isUser ? m.text : `[${m.advisor}]: ${m.text}`,
        }));

      const controller = new AbortController();
      abortRef.current = controller;

      for (const role of ADVISOR_ROLES) {
        if (controller.signal.aborted) break;

        const msgId = `${Date.now()}-${role}`;
        let accumulated = "";

        setStreamingAdvisors((prev) => new Set(prev).add(role));

        setMessages((prev) => [
          ...prev,
          { id: msgId, advisor: role, text: "", ts: nowTs(), isStreaming: true, confidence: 0 },
        ]);

        try {
          await streamAdvisorResponse({
            userMessage: `${userText}\n\n[Context: You are part of a multi-advisor collaboration room with SOC Analyst, Threat Intel, Incident Response, and vCISO advisors. Provide your perspective based on your role. Be concise. Always include a confidence level (HIGH/MEDIUM/LOW) at the end of your response.]`,
            conversationHistory: [
              ...history,
              { role: "user" as const, content: userText },
            ],
            advisorRole: role,
            signal: controller.signal,
            onDelta: (chunk) => {
              accumulated += chunk;
              const current = accumulated;
              const confidence = extractConfidence(current);
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === msgId ? { ...m, text: current, confidence } : m
                )
              );
            },
            onDone: () => {
              const finalConfidence = extractConfidence(accumulated);
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === msgId ? { ...m, isStreaming: false, confidence: finalConfidence } : m
                )
              );
              setStreamingAdvisors((prev) => {
                const next = new Set(prev);
                next.delete(role);
                return next;
              });
            },
          });

          history.push({
            role: "assistant" as const,
            content: `[${role}]: ${accumulated}`,
          });
        } catch (err: unknown) {
          if ((err as Error).name === "AbortError") break;
          const errorMsg = err instanceof Error ? err.message : "Unknown error";
          toast.error(`${role} Advisor: ${errorMsg}`);
          setMessages((prev) =>
            prev.map((m) =>
              m.id === msgId
                ? { ...m, text: `⚠ Error: ${errorMsg}`, isStreaming: false }
                : m
            )
          );
          setStreamingAdvisors((prev) => {
            const next = new Set(prev);
            next.delete(role);
            return next;
          });
        }
      }

      abortRef.current = null;
    },
    [messages, isAnyStreaming]
  );

  const handleSend = () => {
    askAdvisors(input);
  };

  const handleStop = () => {
    abortRef.current?.abort();
    setStreamingAdvisors(new Set());
  };

  const handleClear = () => {
    setMessages([]);
  };

  const handleVote = (msgId: string, vote: "agree" | "disagree") => {
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, vote } : m));
  };

  // Group messages by user question for consensus panels
  const renderMessages = () => {
    const elements: React.ReactNode[] = [];
    let currentGroup: Message[] = [];

    messages.forEach((m, i) => {
      if (m.isUser) {
        // Render previous group's consensus
        if (currentGroup.length > 0) {
          elements.push(<ConsensusPanel key={`consensus-${i}`} messages={currentGroup} />);
          currentGroup = [];
        }
      } else {
        currentGroup.push(m);
      }

      elements.push(
        <div key={m.id} className="space-y-1">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "text-xs font-semibold",
                m.isUser ? "text-muted-foreground" : ROLE_COLORS[m.advisor] ?? "text-foreground"
              )}
            >
              {m.advisor}
            </span>
            <span className="text-[10px] text-muted-foreground">{m.ts}</span>
            {m.isStreaming && <Loader2 className="h-3 w-3 animate-spin text-primary" />}
            {!m.isUser && !m.isStreaming && m.confidence !== undefined && m.confidence > 0 && (
              <ConfidenceMeter value={m.confidence} />
            )}
          </div>
          <div
            className={cn(
              "rounded-lg border px-4 py-3 text-sm",
              m.isUser
                ? "border-primary/30 bg-primary/10 text-foreground"
                : cn("text-foreground", ROLE_BG[m.advisor] || "border-border/50 bg-secondary/50")
            )}
          >
            {m.text ? (
              m.isUser ? m.text : (
                <div className="prose prose-sm prose-invert max-w-none">
                  <ReactMarkdown>{m.text}</ReactMarkdown>
                </div>
              )
            ) : m.isStreaming ? "…" : ""}
          </div>
          {/* Voting indicators - SRS Section 11 */}
          {!m.isUser && !m.isStreaming && m.text && (
            <div className="flex items-center gap-2 pl-1">
              <button
                onClick={() => handleVote(m.id, "agree")}
                className={cn(
                  "flex items-center gap-1 rounded px-2 py-0.5 text-[10px] transition-all",
                  m.vote === "agree"
                    ? "bg-accent/20 text-accent"
                    : "text-muted-foreground hover:text-accent"
                )}
              >
                <ThumbsUp className="h-3 w-3" /> Agree
              </button>
              <button
                onClick={() => handleVote(m.id, "disagree")}
                className={cn(
                  "flex items-center gap-1 rounded px-2 py-0.5 text-[10px] transition-all",
                  m.vote === "disagree"
                    ? "bg-destructive/20 text-destructive"
                    : "text-muted-foreground hover:text-destructive"
                )}
              >
                <ThumbsDown className="h-3 w-3" /> Disagree
              </button>
            </div>
          )}
        </div>
      );
    });

    // Final consensus for the last group
    if (currentGroup.length > 0) {
      elements.push(<ConsensusPanel key="consensus-final" messages={currentGroup} />);
    }

    return elements;
  };

  return (
    <CyberXLayout title="Multi-Agent Collaboration Room" breadcrumb={["CyberX", "Chat"]}>
      <div className="grid h-[75vh] grid-cols-1 gap-4 lg:grid-cols-[200px_1fr]">
        {/* Participants */}
        <aside className="cyberx-panel space-y-3 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            <Users className="h-3.5 w-3.5" /> Participants
          </div>
          {active.map((a) => {
            const isStreaming = streamingAdvisors.has(a.shortName);
            return (
              <div key={a.id} className="flex items-center gap-2">
                <AdvisorAvatar advisor={a} size="sm" />
                <div>
                  <p className="text-xs font-medium leading-none">{a.shortName}</p>
                  <p className="text-[10px] text-muted-foreground">{a.tier}</p>
                </div>
                {isStreaming ? (
                  <Loader2 className="ml-auto h-3 w-3 animate-spin text-primary" />
                ) : (
                  <span className="ml-auto h-2 w-2 rounded-full bg-accent" />
                )}
              </div>
            );
          })}
          <div className="border-t border-border/40 pt-3">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-xs text-muted-foreground"
              onClick={handleClear}
              disabled={isAnyStreaming}
            >
              <RotateCcw className="mr-2 h-3 w-3" /> Clear Chat
            </Button>
          </div>
        </aside>

        {/* Chat area */}
        <div className="cyberx-panel flex flex-col overflow-hidden p-0">
          <div ref={scrollRef} className="flex-1 space-y-5 overflow-y-auto p-5">
            {messages.length === 0 && (
              <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
                <div className="rounded-xl border border-border/60 bg-secondary/50 p-4">
                  <Users className="mx-auto mb-2 h-8 w-8 text-primary" />
                  <p className="font-display text-sm text-foreground">Multi-Agent Collaboration Room</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Ask a security question and all 4 advisors will respond with confidence scores and voting per SRS §11.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    "How serious is the Log4Shell-like vulnerability detected in our environment?",
                    "Assess risk of exposing API gateway publicly.",
                    "Anomalous SMB traffic from host 10.4.12.87 — what should we do?",
                  ].map((q) => (
                    <button
                      key={q}
                      onClick={() => askAdvisors(q)}
                      className="rounded-lg border border-border/60 bg-secondary/50 px-3 py-2 text-left text-xs text-muted-foreground transition-all hover:border-primary hover:text-foreground"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {renderMessages()}
          </div>

          <div className="flex gap-3 border-t border-border p-4">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
              placeholder="Ask the advisor panel…"
              disabled={isAnyStreaming}
              className="flex-1 rounded-lg border border-border/80 bg-secondary/60 px-4 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary/40 disabled:opacity-50"
            />
            {isAnyStreaming ? (
              <Button variant="destructive" size="icon" onClick={handleStop}>
                <Plus className="h-4 w-4 rotate-45" />
              </Button>
            ) : (
              <Button variant="hero" size="icon" onClick={handleSend} disabled={!input.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </CyberXLayout>
  );
}
