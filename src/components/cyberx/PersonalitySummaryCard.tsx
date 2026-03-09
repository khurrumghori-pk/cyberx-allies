import { useState } from "react";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from "recharts";
import { Brain, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";

const MOCK_MBTI = {
  type: "INTJ",
  label: "Strategic Architect",
  dimensions: [
    { axis: "E/I", label: "Introversion", value: 78 },
    { axis: "S/N", label: "Intuition", value: 85 },
    { axis: "T/F", label: "Thinking", value: 92 },
    { axis: "J/P", label: "Judging", value: 71 },
  ],
};

const MOCK_PSYCHOMETRIC = [
  { trait: "Openness", score: 82 },
  { trait: "Vigilance", score: 91 },
  { trait: "Resilience", score: 75 },
  { trait: "Analytical", score: 88 },
  { trait: "Conscientiousness", score: 79 },
  { trait: "Adaptability", score: 70 },
  { trait: "Assertiveness", score: 84 },
  { trait: "Empathy", score: 63 },
];

export function PersonalitySummaryCard() {
  const [visible, setVisible] = useState(true);

  return (
    <div className="cyberx-panel p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-primary" />
          <h3 className="font-display text-sm text-foreground">Personality Profile</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
          onClick={() => setVisible((v) => !v)}
        >
          {visible ? <EyeOff className="h-3.5 w-3.5 mr-1" /> : <Eye className="h-3.5 w-3.5 mr-1" />}
          {visible ? "Hide" : "Show"}
        </Button>
      </div>

      {visible && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 animate-in fade-in duration-300">
          {/* MBTI Card */}
          <div className="rounded-lg border border-border/50 bg-secondary/30 p-4">
            <div className="text-center mb-3">
              <span className="font-display text-2xl text-primary">{MOCK_MBTI.type}</span>
              <p className="text-[11px] text-muted-foreground mt-0.5">{MOCK_MBTI.label}</p>
            </div>
            <div className="space-y-2">
              {MOCK_MBTI.dimensions.map((d) => (
                <div key={d.axis} className="space-y-1">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-muted-foreground">{d.label}</span>
                    <span className="text-foreground font-medium">{d.value}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-500"
                      style={{ width: `${d.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Psychometric Radar */}
          <div className="rounded-lg border border-border/50 bg-secondary/30 p-4 h-[220px]">
            <p className="text-[11px] text-muted-foreground mb-1 text-center">Psychometric Traits</p>
            <ResponsiveContainer width="100%" height="90%">
              <RadarChart data={MOCK_PSYCHOMETRIC} cx="50%" cy="50%" outerRadius="65%">
                <PolarGrid stroke="hsl(var(--border))" strokeOpacity={0.5} />
                <PolarAngleAxis
                  dataKey="trait"
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 8 }}
                  tickLine={false}
                />
                <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                <Radar
                  dataKey="score"
                  stroke="hsl(var(--accent))"
                  fill="hsl(var(--accent))"
                  fillOpacity={0.25}
                  strokeWidth={1.5}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
