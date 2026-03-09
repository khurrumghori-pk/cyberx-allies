import { useState, useEffect } from "react";
import { CyberXLayout } from "@/components/cyberx/CyberXLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Brain, Trash2, Loader2, Bot, Calendar, Tag, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Memory {
  id: string;
  advisor_id: string;
  memory_type: string;
  content: string;
  created_at: string;
}

interface Advisor {
  id: string;
  name: string;
  role: string;
}

const TYPE_STYLES: Record<string, string> = {
  conversation_pattern: "border-primary/40 text-primary",
  fact: "border-accent/40 text-accent",
  preference: "border-[hsl(38_95%_55%)]/40 text-[hsl(38_95%_55%)]",
};

export function TwinMemoryPage() {
  const { user } = useAuth();
  const [memories, setMemories] = useState<Memory[]>([]);
  const [advisors, setAdvisors] = useState<Advisor[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!user) return;
    fetchData();
  }, [user]);

  const fetchData = async () => {
    const [advRes, memRes] = await Promise.all([
      supabase.from("advisors").select("id, name, role").or(`assigned_user_id.eq.${user!.id},tenant_id.eq.${user!.id}`),
      supabase.from("twin_memories").select("*").order("created_at", { ascending: false }),
    ]);
    setAdvisors(advRes.data || []);
    setMemories(memRes.data || []);
    setLoading(false);
  };

  const deleteMemory = async (id: string) => {
    setDeleting(id);
    const { error } = await supabase.from("twin_memories").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete memory");
    } else {
      setMemories(prev => prev.filter(m => m.id !== id));
      toast.success("Memory deleted");
    }
    setDeleting(null);
  };

  const clearAll = async () => {
    if (!confirm("Delete all learned memories? This cannot be undone.")) return;
    const ids = filteredMemories.map(m => m.id);
    if (ids.length === 0) return;
    const { error } = await supabase.from("twin_memories").delete().in("id", ids);
    if (error) {
      toast.error("Failed to clear memories");
    } else {
      setMemories(prev => prev.filter(m => !ids.includes(m.id)));
      toast.success(`Cleared ${ids.length} memories`);
    }
  };

  const getAdvisorName = (advisorId: string) => {
    const a = advisors.find(a => a.id === advisorId);
    return a ? a.name : "Unknown";
  };

  const getAdvisorRole = (advisorId: string) => {
    const a = advisors.find(a => a.id === advisorId);
    return a ? a.role : "";
  };

  const timeAgo = (ts: string) => {
    const diff = Date.now() - new Date(ts).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  const uniqueAdvisorIds = [...new Set(memories.map(m => m.advisor_id))];
  const uniqueTypes = [...new Set(memories.map(m => m.memory_type))];
  const filteredMemories = memories
    .filter(m => filter === "all" || m.advisor_id === filter)
    .filter(m => typeFilter === "all" || m.memory_type === typeFilter)
    .filter(m => !search || m.content.toLowerCase().includes(search.toLowerCase()));

  if (loading) {
    return (
      <CyberXLayout title="Twin Memory" breadcrumb={["CyberX", "Twin Memory"]}>
        <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      </CyberXLayout>
    );
  }

  return (
    <CyberXLayout title="Twin Memory" breadcrumb={["CyberX", "Twin Memory"]}>
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="cyberx-kpi space-y-1">
          <span className="text-xs text-muted-foreground">Total Memories</span>
          <p className="font-display text-2xl text-foreground">{memories.length}</p>
        </div>
        <div className="cyberx-kpi space-y-1">
          <span className="text-xs text-muted-foreground">Twins Learning</span>
          <p className="font-display text-2xl text-foreground">{uniqueAdvisorIds.length}</p>
        </div>
        <div className="cyberx-kpi space-y-1">
          <span className="text-xs text-muted-foreground">Patterns</span>
          <p className="font-display text-2xl text-foreground">{memories.filter(m => m.memory_type === "conversation_pattern").length}</p>
        </div>
        <div className="cyberx-kpi space-y-1">
          <span className="text-xs text-muted-foreground">Facts & Prefs</span>
          <p className="font-display text-2xl text-foreground">{memories.filter(m => m.memory_type !== "conversation_pattern").length}</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search memories…"
          className="w-full rounded-lg border border-border/80 bg-secondary/60 pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary"
        />
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex gap-2 flex-wrap">
          {/* Twin filter */}
          <button
            onClick={() => setFilter("all")}
            className={cn("cyberx-pill text-xs cursor-pointer transition-all", filter === "all" ? "border-primary text-primary" : "text-muted-foreground hover:text-foreground")}
          >
            All Twins
          </button>
          {uniqueAdvisorIds.map(id => (
            <button
              key={id}
              onClick={() => setFilter(id)}
              className={cn("cyberx-pill text-xs cursor-pointer transition-all flex items-center gap-1", filter === id ? "border-primary text-primary" : "text-muted-foreground hover:text-foreground")}
            >
              <Bot className="h-3 w-3" /> {getAdvisorName(id)}
            </button>
          ))}
          <span className="text-border">|</span>
          {/* Category filter */}
          <button
            onClick={() => setTypeFilter("all")}
            className={cn("cyberx-pill text-xs cursor-pointer transition-all", typeFilter === "all" ? "border-accent text-accent" : "text-muted-foreground hover:text-foreground")}
          >
            All Types
          </button>
          {uniqueTypes.map(t => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={cn("cyberx-pill text-xs cursor-pointer transition-all flex items-center gap-1", typeFilter === t ? "border-accent text-accent" : "text-muted-foreground hover:text-foreground", TYPE_STYLES[t])}
            >
              <Tag className="h-3 w-3" /> {t.replace(/_/g, " ")}
            </button>
          ))}
        </div>
        {filteredMemories.length > 0 && (
          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={clearAll}>
            <Trash2 className="h-3.5 w-3.5 mr-1" /> Clear {filter === "all" && typeFilter === "all" ? "All" : "Filtered"} ({filteredMemories.length})
          </Button>
        )}
      </div>

      {/* Memory list */}
      {filteredMemories.length === 0 ? (
        <div className="cyberx-panel p-10 text-center space-y-3">
          <Brain className="h-10 w-10 text-muted-foreground mx-auto" />
          <p className="text-sm text-muted-foreground">No memories yet. Your Digital Twin learns automatically from every conversation.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredMemories.map(m => (
            <div key={m.id} className="cyberx-panel p-4 flex items-start gap-4 group hover:border-primary/40 transition-all">
              <div className="mt-0.5 h-9 w-9 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center shrink-0">
                <Brain className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0 space-y-1.5">
                <p className="text-sm text-foreground">{m.content}</p>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className={cn("cyberx-pill text-[10px] border", TYPE_STYLES[m.memory_type] || "border-border text-muted-foreground")}>
                    <Tag className="h-2.5 w-2.5 mr-0.5 inline" />{m.memory_type.replace("_", " ")}
                  </span>
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Bot className="h-3 w-3" />{getAdvisorName(m.advisor_id)} • {getAdvisorRole(m.advisor_id)}
                  </span>
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />{timeAgo(m.created_at)}
                  </span>
                </div>
              </div>
              <button
                onClick={() => deleteMemory(m.id)}
                disabled={deleting === m.id}
                className="shrink-0 rounded-lg p-2 text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive transition-all"
              >
                {deleting === m.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              </button>
            </div>
          ))}
        </div>
      )}
    </CyberXLayout>
  );
}