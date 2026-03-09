import { Link } from "react-router-dom";
import { type Advisor } from "@/data/cyberx-advisors";
import { AdvisorAvatar } from "./AdvisorAvatar";
import { Button } from "@/components/ui/button";
import { MessageSquare, Cpu } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<Advisor["status"], string> = {
  active: "bg-accent",
  idle: "bg-yellow-400",
  training: "bg-primary",
};

const STATUS_LABEL: Record<Advisor["status"], string> = {
  active: "Active",
  idle: "Idle",
  training: "Training",
};

const TIER_COLORS: Record<Advisor["tier"], string> = {
  "Tier 1": "text-primary",
  "Tier 2": "text-yellow-400",
  "Tier 3": "text-accent",
  Leadership: "text-purple-400",
};

interface AdvisorCardProps {
  advisor: Advisor;
}

export function AdvisorCard({ advisor }: AdvisorCardProps) {
  return (
    <div
      className="cyberx-panel group relative overflow-hidden p-5 space-y-4 hover:border-primary/40 transition-all duration-200 cursor-pointer"
      style={{ "--glow": advisor.glowColor } as React.CSSProperties}
    >
      {/* Glow sweep on hover */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl"
        style={{ background: `radial-gradient(circle at 50% 0%, ${advisor.glowColor}22, transparent 60%)` }}
      />

      <div className="flex items-start gap-3">
        <AdvisorAvatar advisor={advisor} size="lg" />
        <div className="flex-1">
          <p className={cn("text-xs font-medium", TIER_COLORS[advisor.tier])}>{advisor.tier}</p>
          <h3 className="font-semibold leading-tight">{advisor.name}</h3>
          <p className="text-xs text-muted-foreground">{advisor.role}</p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={cn("h-2 w-2 rounded-full", STATUS_STYLES[advisor.status])} />
          <span className="text-xs text-muted-foreground">{STATUS_LABEL[advisor.status]}</span>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">{advisor.description}</p>

      <div className="flex flex-wrap gap-1.5">
        {advisor.expertise.map((e) => (
          <span key={e} className="cyberx-pill">{e}</span>
        ))}
      </div>

      <div className="flex items-center justify-between border-t border-border/40 pt-3">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Cpu className="h-3.5 w-3.5" /> {advisor.sessions} sessions
        </div>
        <Button asChild size="sm" variant="hero">
          <Link to="/advisors/chat">
            <MessageSquare className="h-3.5 w-3.5" /> Chat
          </Link>
        </Button>
      </div>
    </div>
  );
}
