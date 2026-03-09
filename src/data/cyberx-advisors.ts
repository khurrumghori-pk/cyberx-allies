export interface Advisor {
  id: string;
  name: string;
  shortName: string;
  role: string;
  tier: "Tier 1" | "Tier 2" | "Tier 3" | "Leadership";
  status: "active" | "idle" | "training";
  description: string;
  expertise: string[];
  sessions: number;
  initials: string;
  glowColor: string;
}

export const ADVISORS: Advisor[] = [
  {
    id: "soc",
    name: "SOC Analyst Advisor",
    shortName: "SOC Analyst",
    role: "Alert Triage & Investigation",
    tier: "Tier 1",
    status: "active",
    description: "Monitors and triages security alerts, correlates threat data, and recommends immediate containment steps.",
    expertise: ["Alert Triage", "Threat Correlation", "SIEM Analysis"],
    sessions: 24,
    initials: "SOC",
    glowColor: "hsl(193 100% 56%)",
  },
  {
    id: "threat",
    name: "Threat Intelligence Advisor",
    shortName: "Threat Intel",
    role: "Threat Actor Analysis",
    tier: "Tier 1",
    status: "active",
    description: "Aggregates and analyzes threat intelligence feeds to provide adversary context and campaign attribution.",
    expertise: ["MITRE ATT&CK", "TTP Mapping", "OSINT", "Actor Profiling"],
    sessions: 19,
    initials: "TIA",
    glowColor: "hsl(166 95% 45%)",
  },
  {
    id: "ir",
    name: "Incident Response Advisor",
    shortName: "IR Advisor",
    role: "Playbook Execution & Risk Advisory",
    tier: "Tier 2",
    status: "active",
    description: "Guides incident containment, eradication, and recovery using institutional playbook knowledge.",
    expertise: ["Incident Containment", "Forensics", "Playbooks", "Recovery"],
    sessions: 14,
    initials: "IRA",
    glowColor: "hsl(38 95% 55%)",
  },
  {
    id: "vciso",
    name: "vCISO Advisor",
    shortName: "vCISO",
    role: "Strategic Security Leadership",
    tier: "Leadership",
    status: "active",
    description: "Provides executive-level security guidance, board reporting, and risk posture management.",
    expertise: ["Security Strategy", "Board Reporting", "Risk Management"],
    sessions: 11,
    initials: "vCI",
    glowColor: "hsl(267 90% 66%)",
  },
  {
    id: "malware",
    name: "Malware Analyst Advisor",
    shortName: "Malware Analyst",
    role: "Malware Analysis & Reverse Engineering",
    tier: "Tier 2",
    status: "idle",
    description: "Analyzes malicious code, extracts IOCs, and maps behaviors to threat actor toolkits.",
    expertise: ["Static Analysis", "Dynamic Analysis", "IOC Extraction"],
    sessions: 8,
    initials: "MAA",
    glowColor: "hsl(0 72% 52%)",
  },
  {
    id: "hunter",
    name: "Threat Hunter Advisor",
    shortName: "Threat Hunter",
    role: "Proactive Threat Hunting",
    tier: "Tier 3",
    status: "training",
    description: "Generates proactive hunt hypotheses from behavioral baselines and adversary intelligence.",
    expertise: ["Hunt Hypotheses", "Behavioral Analytics", "KQL/SPL"],
    sessions: 7,
    initials: "THA",
    glowColor: "hsl(193 100% 56%)",
  },
];
