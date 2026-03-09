import { useState, useRef, useEffect } from "react";
import { CyberXLayout } from "@/components/cyberx/CyberXLayout";
import { Button } from "@/components/ui/button";
import { Users, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/team-twin-chat`;

const SAMPLE_QUERIES = [
  "How is the threat landscape evolving for our banking platform?",
  "What is the current SOC readiness posture?",
  "Which threat actors are most likely to target us this quarter?",
];

async function streamTeamTwinResponse({
  userMessage,
  conversationHistory,
  onDelta,
  onDone,
  signal,
}: {
  userMessage: string;
  conversationHistory: { role: "user" | "assistant"; content: string }[];
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
    body: JSON.stringify({ messages }),
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

  // flush remainder
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
      } catch {
        /* ignore */
      }
    }
  }
  onDone();
}

export function TeamDigitalTwinPage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState("");
  const [history, setHistory] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const abortRef = useRef<AbortController | null>(null);

  const ask = async (q: string) => {
    const text = q || query;
    if (!text || loading) return;
    setQuery(text);
    setLoading(true);
    setResponse("");

    const controller = new AbortController();
    abortRef.current = controller;

    let accumulated = "";
    try {
      await streamTeamTwinResponse({
        userMessage: text,
        conversationHistory: history,
        signal: controller.signal,
        onDelta: (chunk) => {
          accumulated += chunk;
          setResponse(accumulated);
        },
        onDone: () => {
          setLoading(false);
          setHistory((prev) => [
            ...prev,
            { role: "user", content: text },
            { role: "assistant", content: accumulated },
          ]);
        },
      });
    } catch (err: unknown) {
      if ((err as Error).name !== "AbortError") {
        setResponse(`⚠ Error: ${(err as Error).message}`);
      }
      setLoading(false);
    }

    abortRef.current = null;
  };

  const handleStop = () => {
    abortRef.current?.abort();
    setLoading(false);
  };

  return (
    <CyberXLayout title="Team Digital Twin" breadcrumb={["CyberX", "Team Twin"]}>
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <div className="cyberx-panel p-5 space-y-4">
            <h2 className="font-display text-lg">Query SOC Team Brain</h2>
            <textarea
              rows={3}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask the collective intelligence of your SOC team…"
              className="w-full rounded-lg border border-border/80 bg-secondary/60 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary resize-none"
            />
            <div className="flex gap-2">
              <Button variant="hero" onClick={() => ask(query)} disabled={loading || !query}>
                {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                {loading ? "Processing…" : "Ask Team"}
              </Button>
              {loading && (
                <Button variant="outline" onClick={handleStop}>
                  Stop
                </Button>
              )}
            </div>
          </div>

          {response && (
            <div className="cyberx-panel border-accent/30 p-5 space-y-3">
              <p className="cyberx-pill border-accent/40 text-accent">Collective Response</p>
              <div className="prose prose-invert prose-sm max-w-none text-sm text-foreground">
                <ReactMarkdown>{response}</ReactMarkdown>
              </div>
            </div>
          )}
        </div>

        <aside className="space-y-4">
          <div className="cyberx-panel p-4 space-y-3">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              <Users className="h-3.5 w-3.5" /> Quick Queries
            </p>
            {SAMPLE_QUERIES.map((q) => (
              <button key={q} onClick={() => ask(q)} className="block w-full rounded-lg border border-border/60 bg-secondary/50 p-3 text-left text-xs text-muted-foreground hover:border-primary hover:text-foreground transition-all">
                {q}
              </button>
            ))}
          </div>
          <div className="cyberx-panel p-4 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Team Composition</p>
            {["SOC Analyst (×3)", "Threat Hunter (×2)", "IR Advisor", "Malware Analyst", "vCISO"].map((t) => (
              <div key={t} className="flex items-center gap-2 text-sm">
                <span className="h-2 w-2 rounded-full bg-accent" />
                <span>{t}</span>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </CyberXLayout>
  );
}
