import { CyberXLayout } from "@/components/cyberx/CyberXLayout";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from "recharts";

const sessions = [
  { day: "Mon", sessions: 12 }, { day: "Tue", sessions: 19 }, { day: "Wed", sessions: 8 },
  { day: "Thu", sessions: 24 }, { day: "Fri", sessions: 17 }, { day: "Sat", sessions: 5 }, { day: "Sun", sessions: 9 },
];

const recTrend = [
  { week: "W1", recs: 18 }, { week: "W2", recs: 22 }, { week: "W3", recs: 31 }, { week: "W4", recs: 27 },
];

const topAdvisors = [
  { name: "SOC Analyst", sessions: 24, recs: 18, avgSatisfaction: 4.8 },
  { name: "Threat Intel", sessions: 19, recs: 14, avgSatisfaction: 4.6 },
  { name: "IR Advisor", sessions: 14, recs: 11, avgSatisfaction: 4.9 },
  { name: "vCISO", sessions: 11, recs: 9, avgSatisfaction: 4.7 },
  { name: "Malware Analyst", sessions: 8, recs: 6, avgSatisfaction: 4.5 },
];

export function AdvisorAnalyticsPage() {
  return (
    <CyberXLayout title="Advisor Analytics" breadcrumb={["CyberX", "Analytics"]}>
      <div className="grid gap-5 md:grid-cols-2">
        <div className="cyberx-panel p-5 space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">Sessions / Day</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={sessions}>
              <XAxis dataKey="day" tick={{ fill: "hsl(215 20% 74%)", fontSize: 11 }} />
              <YAxis tick={{ fill: "hsl(215 20% 74%)", fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "hsl(223 43% 10%)", border: "1px solid hsl(220 39% 24%)", borderRadius: 8 }} cursor={{ fill: "hsl(193 100% 56% / 0.08)" }} />
              <Bar dataKey="sessions" fill="hsl(193 100% 56%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="cyberx-panel p-5 space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">Recommendations / Week</h3>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={recTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 39% 24% / 0.5)" />
              <XAxis dataKey="week" tick={{ fill: "hsl(215 20% 74%)", fontSize: 11 }} />
              <YAxis tick={{ fill: "hsl(215 20% 74%)", fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "hsl(223 43% 10%)", border: "1px solid hsl(220 39% 24%)", borderRadius: 8 }} />
              <Line type="monotone" dataKey="recs" stroke="hsl(166 95% 45%)" strokeWidth={2} dot={{ fill: "hsl(166 95% 45%)" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="cyberx-panel p-5 space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Advisor Performance</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="pb-2 pr-4">Advisor</th>
              <th className="pb-2 pr-4">Sessions</th>
              <th className="pb-2 pr-4">Recommendations</th>
              <th className="pb-2">Satisfaction</th>
            </tr>
          </thead>
          <tbody>
            {topAdvisors.map((a) => (
              <tr key={a.name} className="border-b border-border/40 text-sm">
                <td className="py-2.5 pr-4 font-medium">{a.name}</td>
                <td className="py-2.5 pr-4 text-muted-foreground">{a.sessions}</td>
                <td className="py-2.5 pr-4 text-muted-foreground">{a.recs}</td>
                <td className="py-2.5 text-accent">{a.avgSatisfaction}★</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </CyberXLayout>
  );
}
