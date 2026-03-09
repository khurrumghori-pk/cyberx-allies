import { useState } from "react";
import { CyberXLayout } from "@/components/cyberx/CyberXLayout";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Activity, ChevronRight, ChevronLeft, CheckCircle, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

interface PsychoQuestion {
  id: number;
  trait: string;
  statement: string;
}

const PSYCHO_QUESTIONS: PsychoQuestion[] = [
  { id: 1, trait: "openness", statement: "The advisor should explore unconventional detection methods and novel threat hypotheses." },
  { id: 2, trait: "openness", statement: "The advisor should proactively research emerging attack techniques beyond known CVEs." },
  { id: 3, trait: "conscientiousness", statement: "The advisor should meticulously document every step of the investigation process." },
  { id: 4, trait: "conscientiousness", statement: "The advisor should strictly follow runbook procedures without deviation." },
  { id: 5, trait: "extraversion", statement: "The advisor should actively initiate cross-team collaboration during incidents." },
  { id: 6, trait: "extraversion", statement: "The advisor should provide frequent verbal status updates during active response." },
  { id: 7, trait: "agreeableness", statement: "The advisor should prioritize team consensus before escalating containment actions." },
  { id: 8, trait: "agreeableness", statement: "The advisor should accommodate stakeholder preferences even when they conflict with optimal security." },
  { id: 9, trait: "neuroticism", statement: "The advisor should maintain heightened alertness and assume worst-case scenarios." },
  { id: 10, trait: "neuroticism", statement: "The advisor should flag potential risks even with low-confidence indicators." },
  { id: 11, trait: "resilience", statement: "The advisor should maintain consistent performance during high-volume alert storms." },
  { id: 12, trait: "resilience", statement: "The advisor should recover quickly from false positive escalations without degraded performance." },
  { id: 13, trait: "analytical", statement: "The advisor should prefer data-driven reasoning over heuristic-based decisions." },
  { id: 14, trait: "analytical", statement: "The advisor should cross-validate findings across multiple data sources before concluding." },
  { id: 15, trait: "decisiveness", statement: "The advisor should make rapid containment decisions with incomplete information when time-critical." },
  { id: 16, trait: "decisiveness", statement: "The advisor should commit to a response strategy early rather than waiting for perfect intel." },
];

const LIKERT_LABELS = [
  { value: 1, label: "Strongly Disagree" },
  { value: 2, label: "Disagree" },
  { value: 3, label: "Neutral" },
  { value: 4, label: "Agree" },
  { value: 5, label: "Strongly Agree" },
];

const TRAIT_INFO: Record<string, { label: string; description: string; color: string }> = {
  openness: { label: "Openness", description: "Willingness to explore novel threats and unconventional methods", color: "text-primary" },
  conscientiousness: { label: "Conscientiousness", description: "Thoroughness, discipline, and adherence to procedures", color: "text-accent" },
  extraversion: { label: "Extraversion", description: "Proactive collaboration and communication style", color: "text-[hsl(38_95%_55%)]" },
  agreeableness: { label: "Agreeableness", description: "Team harmony vs. independent security judgment", color: "text-[hsl(267_90%_66%)]" },
  neuroticism: { label: "Vigilance", description: "Threat sensitivity and worst-case orientation", color: "text-destructive" },
  resilience: { label: "Resilience", description: "Performance stability under pressure and alert fatigue", color: "text-accent" },
  analytical: { label: "Analytical Rigor", description: "Data-driven reasoning and cross-validation depth", color: "text-primary" },
  decisiveness: { label: "Decisiveness", description: "Speed of action under uncertainty", color: "text-[hsl(38_95%_55%)]" },
};

export function PsychometricTestPage() {
  const navigate = useNavigate();
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);

  const progress = (Object.keys(answers).length / PSYCHO_QUESTIONS.length) * 100;
  const allAnswered = Object.keys(answers).length === PSYCHO_QUESTIONS.length;
  const q = PSYCHO_QUESTIONS[currentQ];

  const answer = (value: number) => {
    const updated = { ...answers, [currentQ]: value };
    setAnswers(updated);
    if (currentQ < PSYCHO_QUESTIONS.length - 1) {
      setTimeout(() => setCurrentQ((c) => c + 1), 300);
    }
  };

  const calculateTraitScores = () => {
    const traits: Record<string, { total: number; count: number }> = {};
    PSYCHO_QUESTIONS.forEach((q, i) => {
      if (answers[i] !== undefined) {
        if (!traits[q.trait]) traits[q.trait] = { total: 0, count: 0 };
        traits[q.trait].total += answers[i];
        traits[q.trait].count++;
      }
    });
    return Object.entries(traits).map(([trait, { total, count }]) => ({
      trait,
      score: Math.round((total / (count * 5)) * 100),
      ...TRAIT_INFO[trait],
    }));
  };

  const applyToAdvisor = () => {
    const scores = calculateTraitScores();
    const psychoData = {
      traits: scores.map((s) => ({ trait: s.trait, label: s.label, score: s.score, description: s.description })),
    };
    localStorage.setItem("cyberx_psychometric_result", JSON.stringify(psychoData));
    toast.success("Psychometric profile saved — returning to builder");
    navigate("/advisors/builder");
  };

  return (
    <CyberXLayout title="Psychometric Assessment" breadcrumb={["CyberX", "Builder", "Psychometric Test"]}>
      <Button variant="ghost" size="sm" onClick={() => navigate("/advisors/builder")} className="mb-4 gap-2">
        <ArrowLeft className="h-4 w-4" /> Back to Builder
      </Button>

      {!showResults ? (
        <div className="cyberx-panel p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg text-foreground">Psychometric Profile (Big Five+)</h2>
              <p className="text-xs text-muted-foreground mt-1">
                Rate {PSYCHO_QUESTIONS.length} statements on a 5-point scale to build the advisor's psychometric profile
              </p>
            </div>
            <span className="text-xs text-muted-foreground">{currentQ + 1}/{PSYCHO_QUESTIONS.length}</span>
          </div>

          <Progress value={progress} className="h-1.5" />

          <div className="space-y-5 pt-2">
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center shrink-0 mt-0.5">
                <Activity className="h-4 w-4 text-accent" />
              </div>
              <div>
                <span className="cyberx-pill text-[10px] mb-2">{TRAIT_INFO[q.trait]?.label}</span>
                <p className="text-sm font-medium text-foreground leading-relaxed mt-2">{q.statement}</p>
              </div>
            </div>

            <div className="flex justify-between gap-2">
              {LIKERT_LABELS.map((l) => (
                <button
                  key={l.value}
                  onClick={() => answer(l.value)}
                  className={cn(
                    "flex-1 rounded-xl border p-3 text-center transition-all hover:border-primary",
                    answers[currentQ] === l.value
                      ? "border-primary bg-primary/10"
                      : "border-border bg-secondary/50"
                  )}
                >
                  <p className={cn(
                    "font-display text-lg",
                    answers[currentQ] === l.value ? "text-primary" : "text-muted-foreground"
                  )}>
                    {l.value}
                  </p>
                  <p className="text-[9px] text-muted-foreground mt-1 hidden sm:block">{l.label}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border/40">
            <Button variant="ghost" size="sm" onClick={() => setCurrentQ((c) => Math.max(0, c - 1))} disabled={currentQ === 0}>
              <ChevronLeft className="h-4 w-4 mr-1" /> Previous
            </Button>

            <div className="flex gap-1">
              {PSYCHO_QUESTIONS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentQ(i)}
                  className={cn(
                    "h-2 w-2 rounded-full transition-all",
                    i === currentQ ? "bg-accent scale-125" : answers[i] !== undefined ? "bg-primary/60" : "bg-border"
                  )}
                />
              ))}
            </div>

            {allAnswered ? (
              <Button variant="hero" size="sm" onClick={() => setShowResults(true)}>
                View Results <CheckCircle className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button variant="ghost" size="sm" onClick={() => setCurrentQ((c) => Math.min(PSYCHO_QUESTIONS.length - 1, c + 1))} disabled={currentQ === PSYCHO_QUESTIONS.length - 1}>
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="cyberx-panel p-6 space-y-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-accent/20 border border-accent/40 mx-auto mb-3">
              <Activity className="h-7 w-7 text-accent" />
            </div>
            <h2 className="font-display text-xl text-foreground">Psychometric Profile</h2>
            <p className="text-xs text-muted-foreground mt-1">Advisor personality trait breakdown</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {calculateTraitScores().map((t) => (
              <div key={t.trait} className="rounded-xl border border-border/60 bg-secondary/30 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className={cn("text-sm font-semibold", t.color)}>{t.label}</span>
                  <span className="font-display text-lg text-foreground">{t.score}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-700"
                    style={{ width: `${t.score}%` }}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground">{t.description}</p>
              </div>
            ))}
          </div>

          <div className="flex justify-center gap-3 pt-4 border-t border-border/40">
            <Button variant="hero" onClick={applyToAdvisor}>
              Apply to Advisor <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
            <Button variant="outline" onClick={() => { setShowResults(false); setAnswers({}); setCurrentQ(0); }}>
              Retake Test
            </Button>
          </div>
        </div>
      )}
    </CyberXLayout>
  );
}
