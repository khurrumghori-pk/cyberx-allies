import { useState } from "react";
import { CyberXLayout } from "@/components/cyberx/CyberXLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Check, ChevronRight, Shield, BookOpen, Brain, Lock, Eye, Play, Upload, Plus, X, Loader2, Sparkles, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const STEPS = [
  { id: 1, label: "Role & Template", icon: Shield },
  { id: 2, label: "Knowledge Upload", icon: BookOpen },
  { id: 3, label: "Persona & Tone", icon: Brain },
  { id: 4, label: "Access & Security", icon: Lock },
  { id: 5, label: "Review & Validate", icon: Eye },
  { id: 6, label: "Finalize & Train", icon: Play },
];

const ROLE_TEMPLATES = [
  { role: "SOC Analyst", tier: "Tier 1", description: "Alert triage, SIEM monitoring, initial investigation" },
  { role: "Threat Intel", tier: "Tier 1", description: "Threat actor analysis, TTP mapping, OSINT" },
  { role: "Incident Response", tier: "Tier 2", description: "Containment, eradication, recovery, forensics" },
  { role: "Malware Analyst", tier: "Tier 2", description: "Static/dynamic analysis, IOC extraction" },
  { role: "Threat Hunter", tier: "Tier 3", description: "Proactive hunting, behavioral analytics" },
  { role: "vCISO", tier: "Leadership", description: "Strategic security leadership, risk management" },
  { role: "Security Architect", tier: "Tier 2", description: "Design guidance, zero trust architecture" },
  { role: "Vulnerability Manager", tier: "Tier 2", description: "CVE prioritization, patch management" },
  { role: "Compliance Officer", tier: "Leadership", description: "Regulatory readiness, policy reviews" },
  { role: "Detection Engineer", tier: "Tier 2", description: "SIEM rules, detection logic, alert tuning" },
];

const KNOWLEDGE_SOURCES = [
  { id: "playbooks", label: "SOC Playbooks", type: "internal" },
  { id: "threatintel", label: "Threat Intel Feeds", type: "external" },
  { id: "mitre", label: "MITRE ATT&CK Framework", type: "external" },
  { id: "cve", label: "CVE Databases", type: "external" },
  { id: "incidents", label: "Incident Reports", type: "internal" },
  { id: "policies", label: "Security Policies", type: "internal" },
  { id: "siem", label: "SIEM Logs & Alerts", type: "integration" },
  { id: "edr", label: "EDR Telemetry", type: "integration" },
];

const TONE_OPTIONS = ["Professional", "Concise", "Conversational", "Technical", "Executive"];
const DECISION_STYLES = ["Conservative", "Balanced", "Aggressive"];
const RISK_TOLERANCES = ["Risk-Averse", "Moderate", "Risk-Taking"];

interface AdvisorDraft {
  name: string;
  role: string;
  tier: string;
  description: string;
  knowledge_refs: string[];
  persona_profile: {
    domain_expertise: string[];
    tone: string;
    decision_style: string;
    risk_tolerance: string;
    vocabulary: string;
  };
  prompt_dna: {
    system_instructions: string;
    role_instructions: string;
    few_shot_examples: { q: string; a: string }[];
    safety_guards: string[];
  };
  access_roles: string[];
  telemetry_enabled: boolean;
}

export function AdvisorBuilderPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [training, setTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [trainingSummary, setTrainingSummary] = useState("");
  const [testQuery, setTestQuery] = useState("How should we respond to a ransomware alert?");
  const [testResponse, setTestResponse] = useState("");
  const [testLoading, setTestLoading] = useState(false);
  
  const [draft, setDraft] = useState<AdvisorDraft>({
    name: "",
    role: "",
    tier: "Tier 1",
    description: "",
    knowledge_refs: ["playbooks", "threatintel", "mitre"],
    persona_profile: {
      domain_expertise: [],
      tone: "Professional",
      decision_style: "Balanced",
      risk_tolerance: "Moderate",
      vocabulary: "Technical",
    },
    prompt_dna: {
      system_instructions: "Always cite internal document names for facts. Provide actionable recommendations.",
      role_instructions: "",
      few_shot_examples: [],
      safety_guards: ["Do not reveal private user data", "Do not provide hacking instructions"],
    },
    access_roles: ["soc_analyst", "vciso", "admin"],
    telemetry_enabled: true,
  });

  const updateDraft = <K extends keyof AdvisorDraft>(key: K, value: AdvisorDraft[K]) => {
    setDraft((d) => ({ ...d, [key]: value }));
  };

  const selectRole = (template: typeof ROLE_TEMPLATES[0]) => {
    setDraft((d) => ({
      ...d,
      role: template.role,
      tier: template.tier,
      description: template.description,
      name: `${template.role} Advisor`,
      prompt_dna: {
        ...d.prompt_dna,
        role_instructions: `As a ${template.role}, focus on ${template.description.toLowerCase()}.`,
      },
    }));
  };

  const toggleKnowledge = (id: string) => {
    setDraft((d) => ({
      ...d,
      knowledge_refs: d.knowledge_refs.includes(id)
        ? d.knowledge_refs.filter((k) => k !== id)
        : [...d.knowledge_refs, id],
    }));
  };

  const addFewShotExample = () => {
    setDraft((d) => ({
      ...d,
      prompt_dna: {
        ...d.prompt_dna,
        few_shot_examples: [...d.prompt_dna.few_shot_examples, { q: "", a: "" }],
      },
    }));
  };

  const updateFewShotExample = (index: number, field: "q" | "a", value: string) => {
    setDraft((d) => ({
      ...d,
      prompt_dna: {
        ...d.prompt_dna,
        few_shot_examples: d.prompt_dna.few_shot_examples.map((ex, i) =>
          i === index ? { ...ex, [field]: value } : ex
        ),
      },
    }));
  };

  const removeFewShotExample = (index: number) => {
    setDraft((d) => ({
      ...d,
      prompt_dna: {
        ...d.prompt_dna,
        few_shot_examples: d.prompt_dna.few_shot_examples.filter((_, i) => i !== index),
      },
    }));
  };

  const runSimulation = async () => {
    setTestLoading(true);
    setTestResponse("");

    try {
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/advisor-chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            messages: [{ role: "user", content: testQuery }],
            advisorRole: draft.role,
          }),
        }
      );

      if (!resp.ok || !resp.body) {
        throw new Error("Simulation failed");
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let idx: number;
        while ((idx = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              accumulated += content;
              setTestResponse(accumulated);
            }
          } catch { /* partial */ }
        }
      }
    } catch (err: any) {
      setTestResponse(`⚠ Error: ${err.message}`);
    } finally {
      setTestLoading(false);
    }
  };

  const finalizeAndTrain = async () => {
    if (!user) {
      toast.error("Please sign in to create an advisor");
      return;
    }

    setSaving(true);
    setTrainingProgress(0);
    setTrainingSummary("");

    try {
      // Step 1: Create the advisor
      const { data: advisor, error } = await supabase.from("advisors").insert({
        tenant_id: user.id,
        name: draft.name,
        role: draft.role,
        description: draft.description,
        tier: draft.tier,
        knowledge_refs: draft.knowledge_refs,
        persona_profile: draft.persona_profile,
        prompt_dna: draft.prompt_dna,
        access_roles: draft.access_roles,
        telemetry_enabled: draft.telemetry_enabled,
        state: "training",
        created_by: user.id,
      }).select().single();

      if (error) throw error;

      toast.success(`${draft.name} created! Starting training…`);
      setTraining(true);
      setSaving(false);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setTrainingProgress(prev => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 15;
        });
      }, 500);

      // Step 2: Train with knowledge sources
      const trainResp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/advisor-train`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            advisorId: advisor.id,
            knowledgeSources: draft.knowledge_refs,
          }),
        }
      );

      clearInterval(progressInterval);

      if (!trainResp.ok) {
        const errData = await trainResp.json().catch(() => ({}));
        throw new Error(errData.error || "Training failed");
      }

      const trainData = await trainResp.json();
      setTrainingProgress(100);
      setTrainingSummary(trainData.knowledgeSummary || "Knowledge indexed successfully.");

      toast.success(`${draft.name} training complete!`);

      // Redirect after short delay
      setTimeout(() => navigate("/advisors/dashboard"), 2500);
    } catch (err: any) {
      toast.error(err.message || "Failed to create advisor");
      setTraining(false);
    } finally {
      setSaving(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1: return !!draft.role;
      case 2: return draft.knowledge_refs.length > 0;
      case 3: return true;
      case 4: return true;
      case 5: return !!draft.name;
      default: return true;
    }
  };

  return (
    <CyberXLayout title="Advisor Creation Wizard" breadcrumb={["CyberX", "Builder"]}>
      {/* Step progress */}
      <div className="cyberx-panel p-4 overflow-x-auto">
        <div className="flex items-center gap-0 min-w-max">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center flex-1 last:flex-none">
              <button
                onClick={() => s.id <= step && setStep(s.id)}
                disabled={s.id > step}
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-sm font-semibold transition-all",
                  step > s.id
                    ? "border-accent bg-accent/20 text-accent cursor-pointer"
                    : step === s.id
                    ? "border-primary bg-primary/20 text-primary"
                    : "border-border bg-secondary text-muted-foreground cursor-not-allowed"
                )}
              >
                {step > s.id ? <Check className="h-4 w-4" /> : <s.icon className="h-4 w-4" />}
              </button>
              <span className={cn("ml-2 hidden text-xs font-medium lg:block whitespace-nowrap", step === s.id ? "text-foreground" : "text-muted-foreground")}>{s.label}</span>
              {i < STEPS.length - 1 && <div className={cn("mx-3 h-px flex-1 min-w-8", step > s.id ? "bg-accent/60" : "bg-border/60")} />}
            </div>
          ))}
        </div>
      </div>

      <div className="cyberx-panel p-6 space-y-6">
        {/* Step 1: Role & Template Selection */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <h2 className="font-display text-lg">Select Advisor Role & Template</h2>
              <p className="text-sm text-muted-foreground mt-1">Choose a pre-defined role template or start from blank</p>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {ROLE_TEMPLATES.map((t) => (
                <button
                  key={t.role}
                  onClick={() => selectRole(t)}
                  className={cn(
                    "rounded-xl border p-4 text-left transition-all hover:border-primary",
                    draft.role === t.role
                      ? "border-primary bg-primary/10"
                      : "border-border bg-secondary/50"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-foreground">{t.role}</span>
                    <span className="cyberx-pill text-[10px]">{t.tier}</span>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">{t.description}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Knowledge Upload */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h2 className="font-display text-lg">Upload / Select Knowledge Sources</h2>
              <p className="text-sm text-muted-foreground mt-1">Select data sources to train this advisor. Documents, playbooks, and integrations.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {KNOWLEDGE_SOURCES.map((k) => (
                <label
                  key={k.id}
                  className={cn(
                    "flex items-center gap-3 rounded-lg border p-4 cursor-pointer transition-all",
                    draft.knowledge_refs.includes(k.id)
                      ? "border-primary bg-primary/10"
                      : "border-border bg-secondary/50 hover:border-primary/50"
                  )}
                >
                  <input
                    type="checkbox"
                    checked={draft.knowledge_refs.includes(k.id)}
                    onChange={() => toggleKnowledge(k.id)}
                    className="accent-primary h-4 w-4"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-medium">{k.label}</span>
                    <span className={cn(
                      "ml-2 text-[10px] px-1.5 py-0.5 rounded",
                      k.type === "internal" ? "bg-accent/20 text-accent" :
                      k.type === "external" ? "bg-primary/20 text-primary" :
                      "bg-secondary text-muted-foreground"
                    )}>{k.type}</span>
                  </div>
                </label>
              ))}
            </div>
            <div className="pt-4 border-t border-border/40">
              <Button variant="outline" className="gap-2">
                <Upload className="h-4 w-4" /> Upload Custom Documents
              </Button>
              <p className="text-[10px] text-muted-foreground mt-2">Supports PDF, DOCX, TXT. Max 20MB per file.</p>
            </div>
          </div>
        )}

        {/* Step 3: Persona & Tone Configuration */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="font-display text-lg">Configure Persona & Tone</h2>
              <p className="text-sm text-muted-foreground mt-1">Define the advisor's communication style and decision-making approach</p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Communication Tone</label>
                  <div className="flex flex-wrap gap-2">
                    {TONE_OPTIONS.map((t) => (
                      <button
                        key={t}
                        onClick={() => setDraft((d) => ({ ...d, persona_profile: { ...d.persona_profile, tone: t } }))}
                        className={cn(
                          "rounded-lg border px-3 py-2 text-xs transition-all",
                          draft.persona_profile.tone === t
                            ? "border-primary bg-primary/10 text-foreground"
                            : "border-border bg-secondary/50 text-muted-foreground hover:border-primary/50"
                        )}
                      >{t}</button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Decision Style</label>
                  <div className="flex gap-2">
                    {DECISION_STYLES.map((s) => (
                      <button
                        key={s}
                        onClick={() => setDraft((d) => ({ ...d, persona_profile: { ...d.persona_profile, decision_style: s } }))}
                        className={cn(
                          "flex-1 rounded-lg border py-2 text-xs transition-all",
                          draft.persona_profile.decision_style === s
                            ? "border-accent bg-accent/10 text-foreground"
                            : "border-border bg-secondary/50 text-muted-foreground"
                        )}
                      >{s}</button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Risk Tolerance</label>
                  <div className="flex gap-2">
                    {RISK_TOLERANCES.map((r) => (
                      <button
                        key={r}
                        onClick={() => setDraft((d) => ({ ...d, persona_profile: { ...d.persona_profile, risk_tolerance: r } }))}
                        className={cn(
                          "flex-1 rounded-lg border py-2 text-xs transition-all",
                          draft.persona_profile.risk_tolerance === r
                            ? "border-primary bg-primary/10 text-foreground"
                            : "border-border bg-secondary/50 text-muted-foreground"
                        )}
                      >{r}</button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">System Instructions (Prompt DNA)</label>
                  <Textarea
                    value={draft.prompt_dna.system_instructions}
                    onChange={(e) => setDraft((d) => ({ ...d, prompt_dna: { ...d.prompt_dna, system_instructions: e.target.value } }))}
                    placeholder="Top-level instructions that apply to all chats..."
                    className="bg-secondary/60 border-border/80 min-h-[80px]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Role-Specific Instructions</label>
                  <Textarea
                    value={draft.prompt_dna.role_instructions}
                    onChange={(e) => setDraft((d) => ({ ...d, prompt_dna: { ...d.prompt_dna, role_instructions: e.target.value } }))}
                    placeholder="Specific directives for this advisor's function..."
                    className="bg-secondary/60 border-border/80 min-h-[80px]"
                  />
                </div>
              </div>
            </div>

            {/* MBTI & Psychometric Testing */}
            <div className="space-y-3 pt-4 border-t border-border/40">
              <label className="text-xs font-medium text-muted-foreground">Personality & Psychometric Profiling</label>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center">
                      <Brain className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">MBTI Assessment</p>
                      <p className="text-[10px] text-muted-foreground">Cognitive personality type (e.g. INTJ, ENTP)</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">8 cybersecurity-contextualized questions to determine how the advisor processes information and makes decisions.</p>
                  <Button variant="neon" size="sm" className="w-full" onClick={() => navigate("/advisors/builder/mbti")}>
                    Start MBTI Test <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>

                <div className="rounded-xl border border-accent/30 bg-accent/5 p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center">
                      <Activity className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">Psychometric Profile</p>
                      <p className="text-[10px] text-muted-foreground">Big Five+ trait analysis (8 dimensions)</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">16 Likert-scale statements measuring openness, conscientiousness, resilience, analytical rigor, and more.</p>
                  <Button variant="neon" size="sm" className="w-full" onClick={() => navigate("/advisors/builder/psychometric")}>
                    Start Psychometric Test <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
            <div className="space-y-3 pt-4 border-t border-border/40">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-muted-foreground">Few-Shot Examples (Optional)</label>
                <Button variant="ghost" size="sm" onClick={addFewShotExample} className="h-7 text-xs">
                  <Plus className="h-3 w-3 mr-1" /> Add Example
                </Button>
              </div>
              {draft.prompt_dna.few_shot_examples.map((ex, i) => (
                <div key={i} className="grid gap-2 sm:grid-cols-2 p-3 rounded-lg bg-secondary/30 border border-border/40">
                  <Input
                    value={ex.q}
                    onChange={(e) => updateFewShotExample(i, "q", e.target.value)}
                    placeholder="Example question..."
                    className="bg-secondary/60 text-xs"
                  />
                  <div className="flex gap-2">
                    <Input
                      value={ex.a}
                      onChange={(e) => updateFewShotExample(i, "a", e.target.value)}
                      placeholder="Expected answer..."
                      className="bg-secondary/60 text-xs flex-1"
                    />
                    <Button variant="ghost" size="icon" onClick={() => removeFewShotExample(i)} className="h-9 w-9 shrink-0">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Access & Security */}
        {step === 4 && (
          <div className="space-y-4">
            <div>
              <h2 className="font-display text-lg">Access Control & Security</h2>
              <p className="text-sm text-muted-foreground mt-1">Define which user roles can invoke this advisor</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { id: "soc_analyst", label: "SOC Analysts", description: "Tier 1-3 analysts" },
                { id: "vciso", label: "vCISO / Leadership", description: "Executive security roles" },
                { id: "admin", label: "Administrators", description: "Full system access" },
              ].map((role) => (
                <label
                  key={role.id}
                  className={cn(
                    "flex items-start gap-3 rounded-lg border p-4 cursor-pointer transition-all",
                    draft.access_roles.includes(role.id)
                      ? "border-primary bg-primary/10"
                      : "border-border bg-secondary/50 hover:border-primary/50"
                  )}
                >
                  <input
                    type="checkbox"
                    checked={draft.access_roles.includes(role.id)}
                    onChange={() => setDraft((d) => ({
                      ...d,
                      access_roles: d.access_roles.includes(role.id)
                        ? d.access_roles.filter((r) => r !== role.id)
                        : [...d.access_roles, role.id]
                    }))}
                    className="accent-primary h-4 w-4 mt-0.5"
                  />
                  <div>
                    <span className="text-sm font-medium">{role.label}</span>
                    <p className="text-xs text-muted-foreground">{role.description}</p>
                  </div>
                </label>
              ))}
            </div>
            <div className="pt-4 border-t border-border/40">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={draft.telemetry_enabled}
                  onChange={(e) => updateDraft("telemetry_enabled", e.target.checked)}
                  className="accent-primary h-4 w-4"
                />
                <div>
                  <span className="text-sm font-medium">Enable Telemetry & Analytics</span>
                  <p className="text-xs text-muted-foreground">Collect usage metrics for performance monitoring</p>
                </div>
              </label>
            </div>
          </div>
        )}

        {/* Step 5: Review & Validate with Live AI Simulation */}
        {step === 5 && (
          <div className="space-y-4">
            <div>
              <h2 className="font-display text-lg">Review & Validate</h2>
              <p className="text-sm text-muted-foreground mt-1">Review settings and run a live AI test simulation</p>
            </div>
            
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Advisor Name</label>
                  <Input
                    value={draft.name}
                    onChange={(e) => updateDraft("name", e.target.value)}
                    placeholder="e.g., SOC Analyst Advisor - ACME Corp"
                    className="bg-secondary/60 border-border/80"
                  />
                </div>

                <div className="cyberx-panel p-4 space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">Configuration Summary</p>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-muted-foreground">Role:</span> {draft.role}</p>
                    <p><span className="text-muted-foreground">Tier:</span> {draft.tier}</p>
                    <p><span className="text-muted-foreground">Tone:</span> {draft.persona_profile.tone}</p>
                    <p><span className="text-muted-foreground">Decision Style:</span> {draft.persona_profile.decision_style}</p>
                    <p><span className="text-muted-foreground">Knowledge Sources:</span> {draft.knowledge_refs.length}</p>
                    <p><span className="text-muted-foreground">Access Roles:</span> {draft.access_roles.join(", ")}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Test Query (Live AI Simulation)</label>
                  <Textarea
                    value={testQuery}
                    onChange={(e) => setTestQuery(e.target.value)}
                    className="bg-secondary/60 border-border/80"
                  />
                  <Button variant="neon" size="sm" onClick={runSimulation} disabled={testLoading}>
                    {testLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Sparkles className="h-3.5 w-3.5 mr-1" />}
                    {testLoading ? "Running…" : "Run Live Simulation"}
                  </Button>
                </div>

                {testResponse && (
                  <div className="cyberx-panel border-accent/30 p-4 space-y-2 max-h-64 overflow-y-auto">
                    <p className="cyberx-pill text-[10px]">Live AI Response</p>
                    <div className="text-sm text-foreground whitespace-pre-wrap">{testResponse}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 6: Finalize & Train with Knowledge Sources */}
        {step === 6 && (
          <div className="space-y-4">
            <div>
              <h2 className="font-display text-lg">Finalize & Train</h2>
              <p className="text-sm text-muted-foreground mt-1">Your advisor will be created and trained with selected knowledge sources</p>
            </div>

            <div className="cyberx-panel border-primary/30 p-6 text-center space-y-4">
              <div className="h-16 w-16 mx-auto rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center">
                {training ? (
                  <Loader2 className="h-8 w-8 text-primary animate-spin" />
                ) : (
                  <Shield className="h-8 w-8 text-primary" />
                )}
              </div>
              <div>
                <h3 className="font-display text-xl text-foreground">{draft.name || `${draft.role} Advisor`}</h3>
                <p className="text-sm text-muted-foreground mt-1">{draft.description}</p>
              </div>
              <div className="flex justify-center gap-2">
                <span className="cyberx-pill">{draft.tier}</span>
                <span className="cyberx-pill border-accent/40 text-accent">{draft.persona_profile.tone}</span>
                <span className="cyberx-pill border-primary/40 text-primary">{draft.persona_profile.decision_style}</span>
              </div>

              {/* Training progress */}
              {training && (
                <div className="space-y-3 pt-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Training knowledge sources…</span>
                    <span className="font-mono text-primary">{Math.round(trainingProgress)}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-secondary overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-300"
                      style={{ width: `${trainingProgress}%` }}
                    />
                  </div>
                  <div className="flex flex-wrap gap-1 justify-center">
                    {draft.knowledge_refs.map(k => {
                      const src = KNOWLEDGE_SOURCES.find(s => s.id === k);
                      return (
                        <span key={k} className="text-[10px] px-2 py-0.5 rounded bg-secondary border border-border text-muted-foreground">
                          {src?.label || k}
                        </span>
                      );
                    })}
                  </div>
                  {trainingSummary && (
                    <div className="mt-3 p-3 rounded-lg bg-accent/10 border border-accent/30 text-left">
                      <p className="text-[10px] font-semibold text-accent mb-1">Knowledge Index Summary</p>
                      <p className="text-xs text-muted-foreground">{trainingSummary}</p>
                    </div>
                  )}
                </div>
              )}

              {!training && (
                <Button variant="hero" size="lg" onClick={finalizeAndTrain} disabled={saving} className="mt-4">
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" /> Creating…
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" /> Activate & Train Advisor
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between pt-4 border-t border-border/40">
          <Button variant="outline" onClick={() => setStep((p) => Math.max(1, p - 1))} disabled={step === 1 || training}>
            Back
          </Button>
          {step < 6 && (
            <Button variant="hero" onClick={() => setStep((p) => Math.min(6, p + 1))} disabled={!canProceed()}>
              {step === 5 ? "Proceed to Finalize" : "Continue"} <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </CyberXLayout>
  );
}
