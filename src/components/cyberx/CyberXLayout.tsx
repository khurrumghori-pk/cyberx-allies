import { Link, useLocation } from "react-router-dom";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, MessageSquare, Bot, Users, Brain,
  ShoppingBag, BarChart2, PlugZap, Shield, Bell,
  ChevronRight, Menu, X, ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface NavItem {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
}

const NAV: NavItem[] = [
  { label: "Dashboard", href: "/advisors/dashboard", icon: LayoutDashboard },
  { label: "Multi-Agent Chat", href: "/advisors/chat", icon: MessageSquare },
  { label: "Advisor Builder", href: "/advisors/builder", icon: Bot },
  { label: "Team Digital Twin", href: "/advisors/team-twin", icon: Users },
  { label: "Cyber Memory", href: "/advisors/memory", icon: Brain },
  { label: "Marketplace", href: "/advisors/marketplace", icon: ShoppingBag },
  { label: "Analytics", href: "/advisors/analytics", icon: BarChart2 },
  { label: "Integrations", href: "/advisors/integrations", icon: PlugZap },
  { label: "Governance", href: "/advisors/governance", icon: Shield },
  { label: "Notifications", href: "/advisors/notifications", icon: Bell },
];

interface CyberXLayoutProps {
  children: ReactNode;
  title: string;
  breadcrumb?: string[];
}

export function CyberXLayout({ children, title, breadcrumb }: CyberXLayoutProps) {
  const { pathname } = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex min-h-screen w-full">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 flex flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300",
          sidebarOpen ? "w-60" : "w-14"
        )}
      >
        {/* Brand */}
        <div className="flex h-14 shrink-0 items-center gap-3 border-b border-sidebar-border px-4">
          <div className="h-8 w-8 shrink-0 rounded-lg bg-primary/20 flex items-center justify-center">
            <Shield className="h-4 w-4 text-primary" />
          </div>
          {sidebarOpen && (
            <div className="overflow-hidden">
              <p className="truncate font-display text-sm font-semibold text-foreground">CyberX</p>
              <p className="truncate text-[10px] text-muted-foreground">Advisors</p>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            className="ml-auto shrink-0 rounded p-1 text-muted-foreground hover:text-foreground"
          >
            {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 space-y-0.5 px-2">
          {NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex h-9 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-all",
                  active
                    ? "bg-sidebar-accent text-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-foreground"
                )}
                style={active ? { boxShadow: "inset 3px 0 0 hsl(var(--primary))" } : {}}
              >
                <item.icon className={cn("h-4 w-4 shrink-0", active ? "text-primary" : "")} />
                {sidebarOpen && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        {sidebarOpen && (
          <div className="border-t border-sidebar-border px-4 py-3">
            <Link to="/" className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground">
              <ExternalLink className="h-3 w-3" /> CyberX Home
            </Link>
          </div>
        )}
      </aside>

      {/* Main */}
      <div className={cn("flex flex-1 flex-col transition-all duration-300", sidebarOpen ? "ml-60" : "ml-14")}>
        {/* Topbar */}
        <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-3 border-b border-border/80 bg-background/80 px-6 backdrop-blur-md">
          {breadcrumb && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              {breadcrumb.map((b, i) => (
                <span key={b} className="flex items-center gap-1.5">
                  {i > 0 && <ChevronRight className="h-3 w-3" />}
                  <span className={i === breadcrumb.length - 1 ? "text-foreground" : ""}>{b}</span>
                </span>
              ))}
            </div>
          )}
          <div className="ml-auto flex items-center gap-3">
            <span className="cyberx-pill">ConversX Engine</span>
            <div className="h-8 w-8 rounded-full border border-border bg-secondary/80 flex items-center justify-center text-xs font-semibold">
              JD
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 space-y-6 p-6">
          <h1 className="cyberx-title">{title}</h1>
          {children}
        </main>
      </div>
    </div>
  );
}
