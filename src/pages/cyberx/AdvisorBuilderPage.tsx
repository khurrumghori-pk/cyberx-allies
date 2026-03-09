import { useState } from "react";
import { CyberXLayout } from "@/components/cyberx/CyberXLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Check, ChevronRight, Shield, BookOpen, Brain, Lock, Eye, Play, Upload, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

// SRS Section 9: 6-Step Wizard
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
  const [testQuery, setTestQuery] = useState("How should we respond to a ransomware alert?");
  const [testResponse, setTestResponse] = useState("");
  
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
    setTestResponse("Analyzing query...\n");
    // Simulated response based on role
    setTimeout(() => {
      setTestResponse(`**${draft.role} Advisor Response:**\n\nBased on the ${draft.persona_profile.decision_style.toLowerCase()} approach and ${draft.persona_profile.tone.toLowerCase()} communication style:\n\n1. **Immediate Action**: Isolate affected systems via network segmentation\n2. **Investigation**: Correlate with SIEM alerts and EDR telemetry\n3. **Escalation**: Alert Incident Response team per playbook RW-005\n4. **Documentation**: Preserve forensic evidence chain\n\n*Confidence: HIGH* | *Sources: IR-Playbook-RW-005, MITRE T1486*`);
    }, 1500);
  };

  const finalizeAdvisor = async () => {
    if (!user) {
      toast.error("Please sign in to create an advisor");
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.from("advisors").insert({
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
        state: "active",
        created_by: user.id,
      });

      if (error) throw error;

      toast.success(`${draft.name} is now active!`);
      navigate("/advisors/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Failed to create advisor");
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
      {/* Step progress - SRS Section 9 */}
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

        {/* Step 2: Knowledge Upload - SRS Section 9 */}
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

        {/* Step 3: Persona & Tone Configuration - SRS Section 10 */}
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

            {/* Few-Shot Examples */}
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

        {/* Step 4: Access & Security - SRS Section 9 */}
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

        {/* Step 5: Review & Validate - SRS Section 9 */}
        {step === 5 && (
          <div className="space-y-4">
            <div>
              <h2 className="font-display text-lg">Review & Validate</h2>
              <p className="text-sm text-muted-foreground mt-1">Review settings and run a test simulation</p>
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
                  <label className="text-xs font-medium text-muted-foreground">Test Query</label>
                  <Textarea
                    value={testQuery}
                    onChange={(e) => setTestQuery(e.target.value)}
                    className="bg-secondary/60 border-border/80"
                  />
                  <Button variant="neon" size="sm" onClick={runSimulation}>Run Simulation</Button>
                </div>

                {testResponse && (
                  <div className="cyberx-panel border-accent/30 p-4 space-y-2">
                    <p className="cyberx-pill text-[10px]">Simulation Response</p>
                    <div className="text-sm text-foreground whitespace-pre-wrap">{testResponse}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 6: Finalize & Train - SRS Section 9 */}
        {step === 6 && (
          <div className="space-y-4">
            <div>
              <h2 className="font-display text-lg">Finalize & Activate</h2>
              <p className="text-sm text-muted-foreground mt-1">Your advisor is ready to be activated</p>
            </div>

            <div className="cyberx-panel border-primary/30 p-6 text-center space-y-4">
              <div className="h-16 w-16 mx-auto rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center">
                <Shield className="h-8 w-8 text-primary" />
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
              <Button variant="hero" size="lg" onClick={finalizeAdvisor} disabled={saving} className="mt-4">
                {saving ? "Activating..." : "Activate Advisor"}
              </Button>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between pt-4 border-t border-border/40">
          <Button variant="outline" onClick={() => setStep((p) => Math.max(1, p - 1))} disabled={step === 1}>
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
