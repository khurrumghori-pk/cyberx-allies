import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Bot, MessageSquare, Loader2, FileText, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export function MyDigitalTwinCard() {
  const { user } = useAuth();
  const [twin, setTwin] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      supabase.from("advisors").select("*").eq("assigned_user_id", user.id).single()
        .then(({ data, error }) => {
          if (!error && data) setTwin(data);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [user]);

  const generateBrief = async () => {
    if (!twin) return;
    const tId = toast.loading("Generating daily brief...");
    try {
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-proactive-brief`, {
        method: "POST",
        headers: { 
            "Content-Type": "application/json", 
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` 
        },
        body: JSON.stringify({ advisorId: twin.id })
      });
      if (!resp.ok) throw new Error("Failed");
      toast.success("Brief generated and sent as notification", { id: tId });
      navigate("/advisors/notifications");
    } catch (e) {
      toast.error("Failed to generate brief", { id: tId });
    }
  };

  const processLearning = async () => {
    if (!twin) return;
    const tId = toast.loading("Analyzing recent chat history...");
    try {
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/process-twin-learning`, {
        method: "POST",
        headers: { 
            "Content-Type": "application/json", 
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` 
        },
        body: JSON.stringify({ 
            advisorId: twin.id, 
            messages: [{ role: "user", content: "Review my recent activities and learn from them." }] 
        })
      });
      if (!resp.ok) throw new Error("Failed");
      const { facts } = await resp.json();
      toast.success(`Twin learned ${facts?.length || 0} new patterns`, { id: tId });
    } catch (e) {
      toast.error("Failed to process learning", { id: tId });
    }
  };

  if (loading) return <div className="cyberx-panel p-6 mb-6 flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  
  if (!twin) return null;

  return (
    <div className="cyberx-panel p-6 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-primary/40 bg-primary/5">
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center">
          <Bot className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h2 className="font-display text-xl text-foreground">My Digital Twin</h2>
          <p className="text-sm text-muted-foreground">{twin.name} • {twin.role}</p>
          <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
            <Brain className="h-3 w-3" /> Continuously learning from your interactions
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        <Button variant="hero" onClick={() => navigate("/advisors/team-twin")}>
          <MessageSquare className="h-4 w-4" /> Twin Chat
        </Button>
        <Button variant="neon" onClick={generateBrief}>
          <FileText className="h-4 w-4" /> Prep Daily Brief
        </Button>
        <Button variant="outline" className="border-primary/50 text-primary hover:bg-primary/20" onClick={processLearning}>
          <Brain className="h-4 w-4" /> Learn Now
        </Button>
      </div>
    </div>
  );
}