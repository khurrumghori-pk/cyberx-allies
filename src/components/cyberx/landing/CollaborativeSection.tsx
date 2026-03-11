import { Search, CheckCheck, PieChart, History, MessageCircle } from "lucide-react";
import ScrollFadeIn from "@/components/cyberx/ScrollFadeIn";

const CAPABILITIES = [
  { icon: Search, label: "Triage & Respond" },
  { icon: CheckCheck, label: "Compliance Check" },
  { icon: PieChart, label: "Risk Insights" },
  { icon: History, label: "Incident Forensics" },
];

const CollaborativeSection = () => (
  <section className="py-20">
    <div className="mx-auto max-w-7xl px-6">
      <ScrollFadeIn>
        <div className="cyberx-panel p-8 md:p-12 space-y-8 bg-gradient-to-br from-secondary/80 to-card/90 border-primary/20">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">Conversational AI</p>
            <h2 className="font-display text-2xl md:text-3xl text-foreground">
              Collaborative & Context-Aware Experience
            </h2>
            <p className="text-muted-foreground max-w-2xl">
              A transparent interface that partners with you — explaining decisions, suggesting next steps, and taking action in your workflow.
            </p>
          </div>

          <div className="flex flex-wrap gap-4">
            {CAPABILITIES.map((c) => (
              <div key={c.label} className="flex items-center gap-2 text-sm text-muted-foreground">
                <c.icon className="h-4 w-4 text-primary" />
                {c.label}
              </div>
            ))}
          </div>

          <div className="rounded-full bg-secondary/80 border border-border/60 px-6 py-4 flex items-start gap-3">
            <MessageCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground italic">
              "SOC lead asks, 'Walk me through yesterday's malware alert.' Your advisor builds a timeline, highlights root cause, and recommends containment playbooks."
            </p>
          </div>
        </div>
      </ScrollFadeIn>
    </div>
  </section>
);

export default CollaborativeSection;
