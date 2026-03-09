import { useState } from "react";
import { CyberXLayout } from "@/components/cyberx/CyberXLayout";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Brain, ChevronRight, ChevronLeft, CheckCircle, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

const MBTI_QUESTIONS = [
  {
    id: 1,
    dimension: "E/I",
    question: "When analyzing a security incident, the advisor should:",
    optionA: "Immediately collaborate with the team and discuss findings openly",
    optionB: "Quietly analyze logs and data independently before sharing conclusions",
    labelA: "E",
    labelB: "I",
  },
  {
    id: 2,
    dimension: "E/I",
    question: "In a SOC environment, the advisor communicates best by:",
    optionA: "Leading group threat briefings and real-time war rooms",
    optionB: "Writing detailed reports and async updates",
    labelA: "E",
    labelB: "I",
  },
  {
    id: 3,
    dimension: "S/N",
    question: "When triaging alerts, the advisor focuses on:",
    optionA: "Concrete IOCs, specific log entries, and known signatures",
    optionB: "Patterns, anomalies, and potential attack chains not yet documented",
    labelA: "S",
    labelB: "N",
  },
  {
    id: 4,
    dimension: "S/N",
    question: "For threat intelligence, the advisor prefers:",
    optionA: "Verified, structured data feeds with high-confidence indicators",
    optionB: "Emerging threat narratives and hypothetical attack scenarios",
    labelA: "S",
    labelB: "N",
  },
  {
    id: 5,
    dimension: "T/F",
    question: "When recommending containment actions, the advisor prioritizes:",
    optionA: "Logical impact analysis — cost, blast radius, SLA implications",
    optionB: "Team morale, stakeholder communication, and human impact",
    labelA: "T",
    labelB: "F",
  },
  {
    id: 6,
    dimension: "T/F",
    question: "During post-incident review, the advisor emphasizes:",
    optionA: "Root cause analysis, metrics, and process gaps",
    optionB: "Team dynamics, stress factors, and communication breakdowns",
    labelA: "T",
    labelB: "F",
  },
  {
    id: 7,
    dimension: "J/P",
    question: "The advisor's approach to playbook execution is:",
    optionA: "Follow established procedures step-by-step for consistency",
    optionB: "Adapt dynamically based on real-time context and gut instinct",
    labelA: "J",
    labelB: "P",
  },
  {
    id: 8,
    dimension: "J/P",
    question: "When handling multiple concurrent incidents, the advisor:",
    optionA: "Prioritizes strictly by severity matrix and handles sequentially",
    optionB: "Flexibly juggles based on evolving context and opportunity",
    labelA: "J",
    labelB: "P",
  },
];

const MBTI_DESCRIPTIONS: Record<string, string> = {
  INTJ: "Strategic Architect — Methodical, independent, long-range threat planning. Excels at building security frameworks.",
  INTP: "Analytical Investigator — Deep technical analysis, pattern recognition. Ideal for malware reverse engineering.",
  ENTJ: "Command Leader — Decisive, authoritative incident commander. Natural vCISO personality.",
  ENTP: "Innovative Hunter — Creative, adaptable threat hunter. Excels at finding novel attack vectors.",
  ISTJ: "Compliance Guardian — Detail-oriented, process-driven. Perfect for audit and compliance roles.",
  ISFJ: "Protective Defender — Reliable, thorough, team-focused SOC analyst personality.",
  ESTJ: "Operations Director — Organized, efficient SOC management and escalation handling.",
  ESFJ: "Team Coordinator — Strong communicator, stakeholder management, security awareness training.",
  ISTP: "Technical Specialist — Hands-on, tool-focused. Excellent for detection engineering.",
  ISFP: "Adaptive Responder — Flexible, observant incident responder with strong situational awareness.",
  ESTP: "Rapid Responder — Action-oriented, quick decision-making under pressure.",
  ESFP: "Engagement Specialist — Energetic, great at security training and phishing simulations.",
  INFJ: "Threat Empath — Understands attacker motivation, excellent at threat modeling and profiling.",
  INFP: "Ethical Advisor — Values-driven, strong at privacy and ethical security governance.",
  ENFJ: "Security Mentor — Inspires teams, builds security culture, cross-functional leadership.",
  ENFP: "Innovation Catalyst — Imaginative, explores emerging threats, thinks outside the box.",
};

export function MBTITestPage() {
  const navigate = useNavigate();
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, "A" | "B">>({});
  const [result, setResult] = useState<string | null>(null);

  const progress = ((Object.keys(answers).length) / MBTI_QUESTIONS.length) * 100;

  const answer = (choice: "A" | "B") => {
    const updated = { ...answers, [currentQ]: choice };
    setAnswers(updated);

    if (currentQ < MBTI_QUESTIONS.length - 1) {
      setTimeout(() => setCurrentQ((c) => c + 1), 300);
    }
  };

  const calculateScores = () => {
    const scores: Record<string, number> = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
    MBTI_QUESTIONS.forEach((q, i) => {
      const a = answers[i];
      if (a === "A") scores[q.labelA]++;
      else if (a === "B") scores[q.labelB]++;
    });
    return scores;
  };

  const calculateResult = () => {
    const scores = calculateScores();
    const type =
      (scores.E >= scores.I ? "E" : "I") +
      (scores.S >= scores.N ? "S" : "N") +
      (scores.T >= scores.F ? "T" : "F") +
      (scores.J >= scores.P ? "J" : "P");
    setResult(type);
  };

  const applyToAdvisor = () => {
    if (!result) return;
    const scores = calculateScores();
    const dimensions = [
      { axis: "E/I", label: result[0] === "E" ? "Extraversion" : "Introversion", value: Math.round((Math.max(scores.E, scores.I) / 2) * 100) },
      { axis: "S/N", label: result[1] === "S" ? "Sensing" : "Intuition", value: Math.round((Math.max(scores.S, scores.N) / 2) * 100) },
      { axis: "T/F", label: result[2] === "T" ? "Thinking" : "Feeling", value: Math.round((Math.max(scores.T, scores.F) / 2) * 100) },
      { axis: "J/P", label: result[3] === "J" ? "Judging" : "Perceiving", value: Math.round((Math.max(scores.J, scores.P) / 2) * 100) },
    ];
    const mbtiData = {
      type: result,
      label: MBTI_DESCRIPTIONS[result]?.split("—")[0]?.trim() || result,
      description: MBTI_DESCRIPTIONS[result] || "",
      dimensions,
    };
    localStorage.setItem("cyberx_mbti_result", JSON.stringify(mbtiData));
    toast.success("MBTI result saved — returning to builder");
    navigate("/advisors/builder");
  };

  const allAnswered = Object.keys(answers).length === MBTI_QUESTIONS.length;
  const q = MBTI_QUESTIONS[currentQ];

  return (
    <CyberXLayout title="MBTI Personality Assessment" breadcrumb={["CyberX", "Builder", "MBTI Test"]}>
      <Button variant="ghost" size="sm" onClick={() => navigate("/advisors/builder")} className="mb-4 gap-2">
        <ArrowLeft className="h-4 w-4" /> Back to Builder
      </Button>

      {!result ? (
        <div className="cyberx-panel p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg text-foreground">MBTI for AI Advisors</h2>
              <p className="text-xs text-muted-foreground mt-1">
                Answer {MBTI_QUESTIONS.length} questions to determine your advisor's cognitive personality type
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-muted-foreground">Question {currentQ + 1}/{MBTI_QUESTIONS.length}</span>
            </div>
          </div>

          <Progress value={progress} className="h-1.5" />

          <div className="space-y-4 pt-2">
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center shrink-0 mt-0.5">
                <Brain className="h-4 w-4 text-primary" />
              </div>
              <p className="text-sm font-medium text-foreground leading-relaxed">{q.question}</p>
            </div>

            <div className="grid gap-3">
              <button
                onClick={() => answer("A")}
                className={cn(
                  "rounded-xl border p-4 text-left text-sm transition-all hover:border-primary",
                  answers[currentQ] === "A"
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border bg-secondary/50 text-muted-foreground"
                )}
              >
                <span className="font-mono text-xs text-primary mr-2">A.</span>
                {q.optionA}
              </button>
              <button
                onClick={() => answer("B")}
                className={cn(
                  "rounded-xl border p-4 text-left text-sm transition-all hover:border-primary",
                  answers[currentQ] === "B"
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border bg-secondary/50 text-muted-foreground"
                )}
              >
                <span className="font-mono text-xs text-primary mr-2">B.</span>
                {q.optionB}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border/40">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentQ((c) => Math.max(0, c - 1))}
              disabled={currentQ === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Previous
            </Button>

            <div className="flex gap-1">
              {MBTI_QUESTIONS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentQ(i)}
                  className={cn(
                    "h-2 w-2 rounded-full transition-all",
                    i === currentQ ? "bg-primary scale-125" : answers[i] ? "bg-accent/60" : "bg-border"
                  )}
                />
              ))}
            </div>

            {allAnswered ? (
              <Button variant="hero" size="sm" onClick={calculateResult}>
                Get Result <CheckCircle className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentQ((c) => Math.min(MBTI_QUESTIONS.length - 1, c + 1))}
                disabled={currentQ === MBTI_QUESTIONS.length - 1}
              >
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="cyberx-panel cyberx-signature-glow p-8 text-center space-y-6">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary/20 border border-primary/40 mx-auto">
            <Brain className="h-8 w-8 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">Advisor MBTI Type</p>
            <h2 className="font-display text-4xl text-primary">{result}</h2>
          </div>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed">
            {MBTI_DESCRIPTIONS[result] || "A unique personality blend for cybersecurity operations."}
          </p>

          <div className="grid grid-cols-4 gap-3 max-w-sm mx-auto pt-4">
            {result.split("").map((letter, i) => (
              <div key={i} className="rounded-lg border border-primary/30 bg-primary/10 p-3 text-center">
                <p className="font-display text-lg text-primary">{letter}</p>
                <p className="text-[10px] text-muted-foreground">
                  {["Energy", "Information", "Decisions", "Structure"][i]}
                </p>
              </div>
            ))}
          </div>

          <div className="flex justify-center gap-3 pt-4">
            <Button variant="hero" onClick={applyToAdvisor}>
              Apply to Advisor <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
            <Button variant="outline" onClick={() => { setResult(null); setAnswers({}); setCurrentQ(0); }}>
              Retake Test
            </Button>
          </div>
        </div>
      )}
    </CyberXLayout>
  );
}
