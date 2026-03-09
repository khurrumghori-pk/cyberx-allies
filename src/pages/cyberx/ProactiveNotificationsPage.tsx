import { useState, useEffect } from "react";
import { CyberXLayout } from "@/components/cyberx/CyberXLayout";
import { Button } from "@/components/ui/button";
import { Bell, BellOff, ShieldAlert, TrendingUp, Bug, Eye, Loader2, Zap, Wifi, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const SEV_STYLES: Record<string, string> = {
  CRITICAL: "border-destructive/50 bg-destructive/8 text-destructive",
  HIGH: "border-yellow-400/50 bg-yellow-400/8 text-yellow-400",
  MEDIUM: "border-primary/50 bg-primary/8 text-primary",
  LOW: "border-accent/50 bg-accent/8 text-accent",
};

const SEV_ICONS: Record<string, typeof ShieldAlert> = {
  CRITICAL: ShieldAlert,
  HIGH: Eye,
  MEDIUM: TrendingUp,
  LOW: Bell,
};

interface Notification {
  id: string;
  advisor: string;
  severity: string;
  title: string;
  body: string;
  icon_type: string;
  read: boolean;
  created_at: string;
}

export function ProactiveNotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [realtimeConnected, setRealtimeConnected] = useState(false);

  // Fetch existing notifications
  useEffect(() => {
    if (!user) return;
    
    const fetchNotifications = async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      
      if (error) {
        console.error("Failed to fetch notifications:", error);
      } else {
        setNotifications(data || []);
      }
      setLoading(false);
    };
    
    fetchNotifications();
  }, [user]);

  // Real-time subscription via websocket
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("notifications-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          setNotifications((prev) => [newNotification, ...prev]);
          
          // Show toast for new real-time notifications
          toast.warning(`${newNotification.severity}: ${newNotification.title}`, {
            description: `From ${newNotification.advisor} Advisor`,
            duration: 8000,
          });
        }
      )
      .subscribe((status) => {
        setRealtimeConnected(status === "SUBSCRIBED");
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const markAllRead = async () => {
    const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
    if (unreadIds.length === 0) return;

    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .in("id", unreadIds);

    if (!error) {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    }
  };

  const markRead = async (id: string) => {
    await supabase.from("notifications").update({ read: true }).eq("id", id);
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  };

  const generateAlert = async (type?: string) => {
    if (!user) return;
    setGenerating(true);

    try {
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-notification`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ type: type || "threat" }),
        }
      );

      if (resp.status === 429) {
        toast.error("Rate limit exceeded. Please try again later.");
        return;
      }
      if (resp.status === 402) {
        toast.error("AI credits exhausted. Please add funds.");
        return;
      }

      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error);
      
      toast.success("Threat alert generated via AI advisor");
    } catch (err: any) {
      toast.error(err.message || "Failed to generate alert");
    } finally {
      setGenerating(false);
    }
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

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <CyberXLayout title="Proactive Notifications" breadcrumb={["CyberX", "Notifications"]}>
      {/* Status bar */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">{unreadCount} unread alerts</span>
          <div className="flex items-center gap-1.5">
            {realtimeConnected ? (
              <>
                <Wifi className="h-3.5 w-3.5 text-accent" />
                <span className="text-[10px] text-accent">Live</span>
              </>
            ) : (
              <>
                <WifiOff className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground">Connecting…</span>
              </>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="hero" size="sm" onClick={() => generateAlert()} disabled={generating}>
            {generating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Zap className="h-3.5 w-3.5" />}
            {generating ? "Generating…" : "Simulate Threat Alert"}
          </Button>
          <Button variant="neon" size="sm" onClick={markAllRead}>
            <BellOff className="h-3.5 w-3.5" /> Mark all read
          </Button>
        </div>
      </div>

      {/* Severity summary */}
      <div className="grid grid-cols-4 gap-3">
        {["CRITICAL", "HIGH", "MEDIUM", "LOW"].map(sev => {
          const count = notifications.filter(n => n.severity === sev).length;
          return (
            <div key={sev} className="cyberx-kpi flex items-center gap-2">
              <span className={cn("cyberx-pill text-[10px] border", SEV_STYLES[sev])}>{sev}</span>
              <span className="font-display text-lg text-foreground">{count}</span>
            </div>
          );
        })}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="cyberx-panel p-8 text-center space-y-3">
          <Bell className="h-10 w-10 mx-auto text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No notifications yet. Click "Simulate Threat Alert" to generate AI-powered security alerts in real-time.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => {
            const Icon = SEV_ICONS[n.severity] || Bell;
            return (
              <div
                key={n.id}
                onClick={() => markRead(n.id)}
                className={cn(
                  "cyberx-panel cursor-pointer p-5 transition-all hover:border-primary/40",
                  !n.read && "border-l-4 border-l-primary"
                )}
              >
                <div className="flex items-start gap-4">
                  <div className="mt-0.5 rounded-lg border border-border/60 bg-secondary/60 p-2">
                    <Icon className={cn("h-5 w-5", 
                      n.severity === "CRITICAL" ? "text-destructive" :
                      n.severity === "HIGH" ? "text-yellow-400" :
                      n.severity === "MEDIUM" ? "text-primary" : "text-accent"
                    )} />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={cn("cyberx-pill text-[10px] border", SEV_STYLES[n.severity])}>{n.severity}</span>
                      <span className="text-xs text-muted-foreground">{n.advisor} Advisor</span>
                      <span className="ml-auto text-xs text-muted-foreground">{timeAgo(n.created_at)}</span>
                      {!n.read && <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />}
                    </div>
                    <p className="font-semibold">{n.title}</p>
                    <p className="text-sm text-muted-foreground">{n.body}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </CyberXLayout>
  );
}
