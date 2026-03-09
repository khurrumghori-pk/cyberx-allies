import { useState, useEffect } from "react";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend } from "recharts";

const MITRE_TACTICS = [
  { tactic: "Recon", fullName: "Reconnaissance" },
  { tactic: "Resource Dev", fullName: "Resource Development" },
  { tactic: "Init Access", fullName: "Initial Access" },
  { tactic: "Execution", fullName: "Execution" },
  { tactic: "Persistence", fullName: "Persistence" },
  { tactic: "Priv Esc", fullName: "Privilege Escalation" },
  { tactic: "Defense Evasion", fullName: "Defense Evasion" },
  { tactic: "Cred Access", fullName: "Credential Access" },
  { tactic: "Discovery", fullName: "Discovery" },
  { tactic: "Lateral Move", fullName: "Lateral Movement" },
  { tactic: "Collection", fullName: "Collection" },
  { tactic: "C2", fullName: "Command & Control" },
  { tactic: "Exfiltration", fullName: "Exfiltration" },
  { tactic: "Impact", fullName: "Impact" },
];

function generateThreatData() {
  return MITRE_TACTICS.map((t) => ({
    ...t,
    current: Math.floor(Math.random() * 60) + 10,
    baseline: Math.floor(Math.random() * 30) + 20,
  }));
}

export function ThreatRadarChart() {
  const [data, setData] = useState(generateThreatData);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setData((prev) =>
        prev.map((d) => ({
          ...d,
          current: Math.max(0, Math.min(100, d.current + (Math.random() - 0.5) * 15)),
        }))
      );
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="cyberx-panel p-4 h-[400px]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display text-sm text-foreground">MITRE ATT&CK Threat Map</h3>
          <p className="text-[10px] text-muted-foreground">Real-time tactic activity vs baseline</p>
        </div>
        <div className="flex gap-3 text-[10px]">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-primary" />
            <span className="text-muted-foreground">Current</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-accent" />
            <span className="text-muted-foreground">Baseline</span>
          </div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height="90%">
        <RadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
          <PolarGrid stroke="hsl(var(--border))" strokeOpacity={0.5} />
          <PolarAngleAxis
            dataKey="tactic"
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 9 }}
            tickLine={false}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 100]}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 8 }}
            tickCount={4}
          />
          <Radar
            name="Baseline"
            dataKey="baseline"
            stroke="hsl(var(--accent))"
            fill="hsl(var(--accent))"
            fillOpacity={0.2}
            strokeWidth={1}
          />
          <Radar
            name="Current"
            dataKey="current"
            stroke="hsl(var(--primary))"
            fill="hsl(var(--primary))"
            fillOpacity={0.3}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
