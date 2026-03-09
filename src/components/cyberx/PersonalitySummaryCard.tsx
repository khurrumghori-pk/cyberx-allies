import { useState, useEffect } from "react";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from "recharts";
import { Brain, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface MBTIData {
  type: string;
  label: string;
  dimensions: { axis: string; label: string; value: number }[];
}

interface PsychometricData {
  traits: { trait: string; label: string; score: number; description?: string }[];
}

const MOCK_MBTI: MBTIData = {
  type: "INTJ",
  label: "Strategic Architect",
  dimensions: [
    { axis: "E/I", label: "Introversion", value: 78 },
    { axis: "S/N", label: "Intuition", value: 85 },
    { axis: "T/F", label: "Thinking", value: 92 },
    { axis: "J/P", label: "Judging", value: 71 },
  ],
};

const MOCK_PSYCHOMETRIC: PsychometricData = {
  traits: [
    { trait: "openness", label: "Openness", score: 82 },
    { trait: "vigilance", label: "Vigilance", score: 91 },
    { trait: "resilience", label: "Resilience", score: 75 },
    { trait: "analytical", label: "Analytical", score: 88 },
    { trait: "conscientiousness", label: "Conscientiousness", score: 79 },
    { trait: "adaptability", label: "Adaptability", score: 70 },
    { trait: "assertiveness", label: "Assertiveness", score: 84 },
    { trait: "empathy", label: "Empathy", score: 63 },
  ],
};

export function PersonalitySummaryCard() {
  const { user } = useAuth();
  const [visible, setVisible] = useState(true);
  const [loading, setLoading] = useState(true);
  const [mbti, setMbti] = useState<MBTIData | null>(null);
  const [psychometric, setPsychometric] = useState<PsychometricData | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchLatestAdvisor = async () => {
      try {
        const { data } = await supabase
          .from("advisors")
          .select("persona_profile")
          .eq("tenant_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (data?.persona_profile) {
          const profile = data.persona_profile as any;
          if (profile.mbti) setMbti(profile.mbti);
          if (profile.psychometric) setPsychometric(profile.psychometric);
        }
      } catch {
        // No advisors yet — use mock
      } finally {
        setLoading(false);
      }
    };

    fetchLatestAdvisor();
  }, [user]);

  const displayMbti = mbti || MOCK_MBTI;
  const displayPsychometric = psychometric || MOCK_PSYCHOMETRIC;
  const isRealData = !!mbti || !!psychometric;

  const radarData = displayPsychometric.traits.map((t) => ({
    trait: t.label,
    score: t.score,
  }));

  return (
    <div className="cyberx-panel p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-primary" />
          <h3 className="font-display text-sm text-foreground">Personality Profile</h3>
          {!isRealData && !loading && (
            <span className="text-[9px] rounded-full bg-muted px-2 py-0.5 text-muted-foreground">Sample Data</span>
          )}
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
        loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 animate-in fade-in duration-300">
            {/* MBTI Card */}
            <div className="rounded-lg border border-border/50 bg-secondary/30 p-4">
              <div className="text-center mb-3">
                <span className="font-display text-2xl text-primary">{displayMbti.type}</span>
                <p className="text-[11px] text-muted-foreground mt-0.5">{displayMbti.label}</p>
              </div>
              <div className="space-y-2">
                {displayMbti.dimensions.map((d) => (
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
                <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="65%">
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
        )
      )}
    </div>
  );
}
