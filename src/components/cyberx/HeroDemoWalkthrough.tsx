import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Brain, MessageSquare, AlertTriangle, CheckCircle, Bot, Activity } from "lucide-react";

const DEMO_STEPS = [
  {
    id: "threat",
    icon: AlertTriangle,
    label: "Threat Detected",
    subtitle: "CVE-2026-3847 · Critical RCE",
    color: "text-destructive",
    bg: "bg-destructive/20 border-destructive/40",
    detail: "Severity: Critical · CVSS 9.8",
  },
  {
    id: "agents",
    icon: Bot,
    label: "Advisors Activated",
    subtitle: "3 agents collaborating in real-time",
    color: "text-primary",
    bg: "bg-primary/20 border-primary/40",
    agents: ["SOC Analyst", "Threat Intel", "IR Advisor"],
  },
  {
    id: "analysis",
    icon: Brain,
    label: "Collective Analysis",
    subtitle: "Cross-referencing institutional memory",
    color: "text-accent",
    bg: "bg-accent/20 border-accent/40",
    detail: "Matched 4 similar incidents from knowledge graph",
  },
  {
    id: "response",
    icon: CheckCircle,
    label: "Response Executed",
    subtitle: "Containment + remediation in 2.4s",
    color: "text-accent",
    bg: "bg-accent/20 border-accent/40",
    detail: "Confidence: 97.3% · Consensus: Unanimous",
  },
];

const HeroDemoWalkthrough = () => {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % DEMO_STEPS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const step = DEMO_STEPS[activeStep];

  return (
    <div className="relative rounded-2xl border border-border/60 bg-card/90 backdrop-blur-sm overflow-hidden shadow-2xl shadow-primary/10">
      {/* Terminal header */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border/60 bg-secondary/50">
        <div className="flex gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-destructive/70" />
          <div className="h-2.5 w-2.5 rounded-full bg-[hsl(38_95%_55%)]/70" />
          <div className="h-2.5 w-2.5 rounded-full bg-accent/70" />
        </div>
        <span className="text-[10px] font-mono text-muted-foreground ml-2">
          cyberx://multi-agent-orchestration
        </span>
        <Activity className="h-3 w-3 text-accent ml-auto animate-pulse" />
      </div>

      {/* Content area */}
      <div className="p-6 md:p-8 min-h-[280px] md:min-h-[320px] flex flex-col">
        {/* Progress dots */}
        <div className="flex gap-2 mb-6">
          {DEMO_STEPS.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setActiveStep(i)}
              className="flex items-center gap-1.5 group"
            >
              <div
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  i === activeStep
                    ? "w-8 bg-primary"
                    : i < activeStep
                    ? "w-4 bg-primary/40"
                    : "w-4 bg-border"
                }`}
              />
              <span
                className={`text-[10px] hidden md:inline transition-colors ${
                  i === activeStep ? "text-foreground" : "text-muted-foreground/50"
                }`}
              >
                {s.label}
              </span>
            </button>
          ))}
        </div>

        {/* Animated step */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="flex-1 flex flex-col gap-4"
          >
            {/* Main card */}
            <div className={`rounded-xl border p-5 ${step.bg}`}>
              <div className="flex items-start gap-4">
                <div className={`p-2.5 rounded-lg bg-background/40 ${step.color}`}>
                  <step.icon className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className={`font-display text-lg ${step.color}`}>{step.label}</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">{step.subtitle}</p>
                </div>
              </div>
            </div>

            {/* Detail row */}
            {"detail" in step && step.detail && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="flex items-center gap-2 text-xs text-muted-foreground font-mono pl-1"
              >
                <Shield className="h-3 w-3 text-primary" />
                {step.detail}
              </motion.div>
            )}

            {/* Agent pills */}
            {"agents" in step && step.agents && (
              <div className="flex flex-wrap gap-2">
                {step.agents.map((agent, i) => (
                  <motion.div
                    key={agent}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 + i * 0.15 }}
                    className="cyberx-pill"
                  >
                    <MessageSquare className="h-3 w-3 text-primary" />
                    {agent}
                  </motion.div>
                ))}
              </div>
            )}

            {/* Fake log lines */}
            <div className="mt-auto space-y-1.5 pt-4 border-t border-border/30">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.5 + i * 0.15 }}
                  transition={{ delay: 0.5 + i * 0.2 }}
                  className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground/60"
                >
                  <span className="text-primary/40">▸</span>
                  <span className="bg-muted/30 rounded h-2.5 flex-1 max-w-[60%]" />
                  <span className="bg-muted/20 rounded h-2.5 w-12" />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default HeroDemoWalkthrough;
