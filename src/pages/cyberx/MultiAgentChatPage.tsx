import { useState } from "react";
import { CyberXLayout } from "@/components/cyberx/CyberXLayout";
import { Button } from "@/components/ui/button";
import { ADVISORS } from "@/data/cyberx-advisors";
import { Send, Users } from "lucide-react";
import { AdvisorAvatar } from "@/components/cyberx/AdvisorAvatar";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  advisor: string;
  color: string;
  text: string;
  ts: string;
}

const DEMO: Message[] = [
  { id: "1", advisor: "SOC Analyst", color: "text-primary", text: "Anomalous SMB traffic spike detected from host 10.4.12.87 — likely lateral movement. I've correlated with 3 prior alerts in the past 6 hours.", ts: "09:01" },
  { id: "2", advisor: "Threat Intel", color: "text-accent", text: "Threat actor group APT41 was observed using identical SMB pivot patterns in campaigns targeting FSI sector last week. Confidence: HIGH.", ts: "09:02" },
  { id: "3", advisor: "Incident Response", color: "text-yellow-400", text: "Recommending immediate isolation of host 10.4.12.87. Initiating IR playbook IR-LM-003. Should I draft the executive brief?", ts: "09:03" },
  { id: "4", advisor: "vCISO", color: "text-purple-400", text: "Risk posture impact: HIGH. Board reporting threshold breached. Preparing a 3-slide stakeholder brief and scheduling a status call at 11:00.", ts: "09:04" },
];

export function MultiAgentChatPage() {
  const active = ADVISORS.slice(0, 4);
  const [messages, setMessages] = useState<Message[]>(DEMO);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    const newMsg: Message = {
      id: Date.now().toString(),
      advisor: "You",
      color: "text-muted-foreground",
      text: input.trim(),
      ts: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((p) => [...p, newMsg]);
    setInput("");
  };

  return (
    <CyberXLayout title="Multi-Agent Collaboration Room" breadcrumb={["CyberX", "Chat"]}>
      <div className="grid h-[70vh] grid-cols-1 gap-4 lg:grid-cols-[200px_1fr]">
        {/* Participants */}
        <aside className="cyberx-panel p-4 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            <Users className="h-3.5 w-3.5" /> Participants
          </div>
          {active.map((a) => (
            <div key={a.id} className="flex items-center gap-2">
              <AdvisorAvatar advisor={a} size="sm" />
              <div>
                <p className="text-xs font-medium leading-none">{a.shortName}</p>
                <p className="text-[10px] text-muted-foreground">{a.tier}</p>
              </div>
              <span className="ml-auto h-2 w-2 rounded-full bg-accent" />
            </div>
          ))}
        </aside>

        {/* Chat area */}
        <div className="cyberx-panel flex flex-col p-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto space-y-5 p-5">
            {messages.map((m) => (
              <div key={m.id} className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={cn("text-xs font-semibold", m.color)}>{m.advisor}</span>
                  <span className="text-[10px] text-muted-foreground">{m.ts}</span>
                </div>
                <p className="rounded-lg border border-border/50 bg-secondary/50 px-4 py-3 text-sm text-foreground">{m.text}</p>
              </div>
            ))}
          </div>
          <div className="border-t border-border p-4 flex gap-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask the advisor panel…"
              className="flex-1 rounded-lg border border-border/80 bg-secondary/60 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary/40"
            />
            <Button variant="hero" size="icon" onClick={handleSend}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </CyberXLayout>
  );
}
