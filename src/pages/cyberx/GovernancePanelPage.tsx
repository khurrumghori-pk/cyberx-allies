import { useState, useEffect, useRef } from "react";
import { CyberXLayout } from "@/components/cyberx/CyberXLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import {
  ShieldCheck, Lock, FileText, Users, AlertTriangle, Eye, Scale, Globe, Server,
  Plus, Upload, Loader2, Trash2, ChevronDown, ChevronRight, Pencil,
  CheckCircle2, XCircle, Clock, Download, History, Search, Filter,
  BookOpen, ClipboardCheck, BarChart3, RefreshCw, Shield, Brain, FileDown, Sparkles
} from "lucide-react";

/* ── Types ──────────────────────────────────── */

interface Policy {
  id: string;
  title: string;
  description: string | null;
  category: string;
  version: string;
  status: string;
  file_url: string | null;
  file_name: string | null;
  frameworks: string[];
  created_by: string;
  approved_by: string | null;
  approved_at: string | null;
  effective_date: string | null;
  review_date: string | null;
  created_at: string;
  updated_at: string;
}

interface PolicyUpdate {
  id: string;
  policy_id: string;
  update_type: string;
  title: string;
  description: string | null;
  previous_version: string | null;
  new_version: string | null;
  updated_by: string;
  created_at: string;
}

interface ComplianceAssessment {
  id: string;
  policy_id: string | null;
  framework: string;
  control_ref: string;
  control_name: string;
  status: string;
  evidence: string | null;
  notes: string | null;
  assessed_by: string;
  assessed_at: string;
  next_review: string | null;
}

/* ── Constants ──────────────────────────────── */

const POLICY_CATEGORIES = [
  "Information Security", "Acceptable Use", "Access Control", "Incident Response",
  "Data Classification", "Business Continuity", "Privacy", "Risk Management", "General"
];

const FRAMEWORKS = [
  { id: "nist_csf", name: "NIST CSF 2.0", icon: "🇺🇸" },
  { id: "iso_27001", name: "ISO 27001:2022", icon: "🌐" },
  { id: "soc2", name: "SOC 2 Type II", icon: "🔒" },
  { id: "gdpr", name: "GDPR", icon: "🇪🇺" },
  { id: "pci_dss", name: "PCI DSS 4.0", icon: "💳" },
  { id: "nca_nesa", name: "NCA/NESA (UAE)", icon: "🇦🇪" },
  { id: "hipaa", name: "HIPAA", icon: "🏥" },
  { id: "cis", name: "CIS Controls v8", icon: "🛡️" },
];

const FRAMEWORK_CONTROLS: Record<string, { ref: string; name: string }[]> = {
  nist_csf: [
    { ref: "GV.OC-01", name: "Organizational Context" }, { ref: "GV.RM-01", name: "Risk Management Strategy" },
    { ref: "GV.SC-01", name: "Supply Chain Risk" }, { ref: "ID.AM-01", name: "Asset Inventory" },
    { ref: "ID.RA-01", name: "Risk Assessment" }, { ref: "PR.AA-01", name: "Identity & Access" },
    { ref: "PR.DS-01", name: "Data Security" }, { ref: "PR.PS-01", name: "Platform Security" },
    { ref: "DE.CM-01", name: "Continuous Monitoring" }, { ref: "DE.AE-01", name: "Adverse Event Analysis" },
    { ref: "RS.MA-01", name: "Incident Management" }, { ref: "RC.RP-01", name: "Recovery Planning" },
  ],
  iso_27001: [
    { ref: "A.5.1", name: "Information Security Policies" }, { ref: "A.6.1", name: "Organization of InfoSec" },
    { ref: "A.7.1", name: "Human Resource Security" }, { ref: "A.8.1", name: "Asset Management" },
    { ref: "A.9.1", name: "Access Control Policy" }, { ref: "A.10.1", name: "Cryptographic Controls" },
    { ref: "A.12.1", name: "Operations Security" }, { ref: "A.13.1", name: "Communications Security" },
    { ref: "A.14.1", name: "System Development" }, { ref: "A.16.1", name: "Incident Management" },
    { ref: "A.17.1", name: "Business Continuity" }, { ref: "A.18.1", name: "Compliance" },
  ],
  soc2: [
    { ref: "CC1.1", name: "Control Environment" }, { ref: "CC2.1", name: "Communication & Information" },
    { ref: "CC3.1", name: "Risk Assessment" }, { ref: "CC4.1", name: "Monitoring Activities" },
    { ref: "CC5.1", name: "Control Activities" }, { ref: "CC6.1", name: "Logical & Physical Access" },
    { ref: "CC7.1", name: "System Operations" }, { ref: "CC8.1", name: "Change Management" },
    { ref: "CC9.1", name: "Risk Mitigation" }, { ref: "A1.1", name: "Availability" },
  ],
  gdpr: [
    { ref: "Art.5", name: "Data Processing Principles" }, { ref: "Art.6", name: "Lawfulness of Processing" },
    { ref: "Art.13", name: "Information to Data Subject" }, { ref: "Art.15", name: "Right of Access" },
    { ref: "Art.17", name: "Right to Erasure" }, { ref: "Art.25", name: "Data Protection by Design" },
    { ref: "Art.32", name: "Security of Processing" }, { ref: "Art.33", name: "Breach Notification" },
    { ref: "Art.35", name: "Impact Assessment" }, { ref: "Art.37", name: "Data Protection Officer" },
  ],
  pci_dss: [
    { ref: "1.1", name: "Network Security Controls" }, { ref: "2.1", name: "Secure Configuration" },
    { ref: "3.1", name: "Protect Stored Data" }, { ref: "4.1", name: "Encrypt Transmission" },
    { ref: "5.1", name: "Protect from Malware" }, { ref: "6.1", name: "Secure Development" },
    { ref: "7.1", name: "Restrict Access" }, { ref: "8.1", name: "Identify & Authenticate" },
    { ref: "9.1", name: "Physical Access" }, { ref: "10.1", name: "Log & Monitor" },
    { ref: "11.1", name: "Test Security" }, { ref: "12.1", name: "Security Policies" },
  ],
  nca_nesa: [
    { ref: "1-1", name: "Cybersecurity Governance" }, { ref: "1-2", name: "Risk Management" },
    { ref: "2-1", name: "Asset Management" }, { ref: "2-3", name: "Identity & Access" },
    { ref: "3-1", name: "Information Protection" }, { ref: "3-2", name: "Cryptography" },
    { ref: "4-1", name: "Event Management" }, { ref: "4-2", name: "Incident Management" },
    { ref: "5-1", name: "Business Continuity" }, { ref: "5-2", name: "Disaster Recovery" },
  ],
  hipaa: [
    { ref: "164.308(a)(1)", name: "Security Management" }, { ref: "164.308(a)(3)", name: "Workforce Security" },
    { ref: "164.308(a)(4)", name: "Information Access" }, { ref: "164.310(a)", name: "Facility Access" },
    { ref: "164.310(d)", name: "Device Controls" }, { ref: "164.312(a)", name: "Access Control" },
    { ref: "164.312(c)", name: "Integrity Controls" }, { ref: "164.312(e)", name: "Transmission Security" },
  ],
  cis: [
    { ref: "CIS-1", name: "Enterprise Asset Inventory" }, { ref: "CIS-2", name: "Software Asset Inventory" },
    { ref: "CIS-3", name: "Data Protection" }, { ref: "CIS-4", name: "Secure Configuration" },
    { ref: "CIS-5", name: "Account Management" }, { ref: "CIS-6", name: "Access Control" },
    { ref: "CIS-7", name: "Continuous Vulnerability Mgmt" }, { ref: "CIS-8", name: "Audit Log Management" },
    { ref: "CIS-9", name: "Email & Browser Protection" }, { ref: "CIS-10", name: "Malware Defenses" },
  ],
};

const STATUS_STYLES: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
  compliant: { bg: "bg-accent/15 border-accent/40", text: "text-accent", icon: <CheckCircle2 className="h-3 w-3" /> },
  partial: { bg: "bg-yellow-400/15 border-yellow-400/40", text: "text-yellow-400", icon: <Clock className="h-3 w-3" /> },
  non_compliant: { bg: "bg-destructive/15 border-destructive/40", text: "text-destructive", icon: <XCircle className="h-3 w-3" /> },
  not_assessed: { bg: "bg-secondary/60 border-border/40", text: "text-muted-foreground", icon: <Clock className="h-3 w-3" /> },
};

const POLICY_STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  draft: { bg: "bg-secondary/60 border-border", text: "text-muted-foreground" },
  active: { bg: "bg-accent/15 border-accent/40", text: "text-accent" },
  under_review: { bg: "bg-yellow-400/15 border-yellow-400/40", text: "text-yellow-400" },
  deprecated: { bg: "bg-destructive/15 border-destructive/40", text: "text-destructive" },
};

/* ── Static Data (preserved) ────────────────── */

const AUDIT_LOGS = [
  { id: "a1", user: "analyst@corp.com", action: "Query — IR Advisor", resource: "Incident IR-2024-019", ts: "2026-03-09 09:14", level: "info" },
  { id: "a2", user: "ciso@corp.com", action: "Viewed Advisor Analytics", resource: "Analytics Dashboard", ts: "2026-03-09 09:01", level: "info" },
  { id: "a3", user: "system", action: "Proactive Alert Triggered", resource: "CVE-2024-38063", ts: "2026-03-09 08:47", level: "warn" },
  { id: "a4", user: "admin@corp.com", action: "Advisor Builder — Activated", resource: "Threat Hunter v2", ts: "2026-03-08 17:30", level: "info" },
  { id: "a5", user: "guest@corp.com", action: "Unauthorized Route Access Blocked", resource: "/advisors/governance", ts: "2026-03-08 15:22", level: "critical" },
  { id: "a6", user: "analyst@corp.com", action: "Memory Search", resource: "Collective Cyber Memory", ts: "2026-03-08 14:11", level: "info" },
  { id: "a7", user: "system", action: "Advisor Prompt DNA Updated", resource: "SOC Analyst v1.2", ts: "2026-03-08 12:00", level: "info" },
  { id: "a8", user: "system", action: "Policy Guardrail Triggered", resource: "Data Exfiltration Attempt", ts: "2026-03-08 11:30", level: "critical" },
];

const LEVEL_STYLES: Record<string, string> = { info: "text-primary", warn: "text-yellow-400", critical: "text-destructive" };

const PERMISSIONS = [
  { role: "Admin", access: "Full access — all modules, advisor creation, governance, user management", users: 3 },
  { role: "vCISO", access: "All advisors, governance (read), analytics, builder", users: 2 },
  { role: "SOC Analyst", access: "Advisors (active), chat, memory (read), notifications", users: 8 },
  { role: "Threat Hunter", access: "Advisors, team twin, memory, marketplace", users: 4 },
  { role: "Compliance Officer", access: "Governance (read), compliance mapping, audit logs", users: 2 },
  { role: "Read Only", access: "Dashboard, notifications only", users: 6 },
];

const SECURITY_CONTROLS = [
  { control: "Zero Trust", description: "Each agent interaction authenticated and authorized. No implicit trust.", icon: Lock, status: "active" },
  { control: "RBAC & IAM", description: "Integration with enterprise identity providers; per-advisor access rights.", icon: Users, status: "active" },
  { control: "Encryption", description: "TLS for APIs; AES-256 for storage; HSM support.", icon: ShieldCheck, status: "active" },
  { control: "Audit & Logging", description: "Immutable logs of all chats, decisions, model versions.", icon: FileText, status: "active" },
  { control: "Data Provenance", description: "Sources of knowledge tagged; Advisors cite source docs.", icon: Eye, status: "active" },
  { control: "Data Residency", description: "All data within customer domain. Geo-zone isolation.", icon: Globe, status: "active" },
];

/* ── Main Component ─────────────────────────── */

type Tab = "overview" | "policies" | "compliance" | "audit";

export function GovernancePanelPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>("overview");
  const [loading, setLoading] = useState(true);

  // Data
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [updates, setUpdates] = useState<PolicyUpdate[]>([]);
  const [assessments, setAssessments] = useState<ComplianceAssessment[]>([]);

  // Dialogs
  const [showPolicyDialog, setShowPolicyDialog] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<Policy | null>(null);
  const [showAssessDialog, setShowAssessDialog] = useState(false);
  const [assessFramework, setAssessFramework] = useState("");

  // Policy form
  const [pForm, setPForm] = useState({ title: "", description: "", category: "General", version: "1.0", effective_date: "", review_date: "", frameworks: [] as string[] });
  const [policyFile, setPolicyFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Compliance filter
  const [complianceFilter, setComplianceFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Expanded policies
  const [expandedPolicy, setExpandedPolicy] = useState<string | null>(null);

  // Gap analysis
  const [showGapDialog, setShowGapDialog] = useState(false);
  const [gapFramework, setGapFramework] = useState("");
  const [gapAnalysis, setGapAnalysis] = useState("");
  const [gapLoading, setGapLoading] = useState(false);

  /* ── Fetch ──────────────────────────────── */

  const fetchData = async () => {
    setLoading(true);
    try {
      const [polRes, updRes, assRes] = await Promise.all([
        supabase.from("org_policies").select("*").order("created_at", { ascending: false }),
        supabase.from("policy_updates").select("*").order("created_at", { ascending: false }),
        supabase.from("compliance_assessments").select("*").order("assessed_at", { ascending: false }),
      ]);
      setPolicies((polRes.data as any[]) || []);
      setUpdates((updRes.data as any[]) || []);
      setAssessments((assRes.data as any[]) || []);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  /* ── Policy CRUD ────────────────────────── */

  const openNewPolicy = () => {
    setEditingPolicy(null);
    setPForm({ title: "", description: "", category: "General", version: "1.0", effective_date: "", review_date: "", frameworks: [] });
    setPolicyFile(null);
    setShowPolicyDialog(true);
  };

  const openEditPolicy = (p: Policy) => {
    setEditingPolicy(p);
    setPForm({
      title: p.title, description: p.description || "", category: p.category,
      version: p.version, effective_date: p.effective_date || "", review_date: p.review_date || "",
      frameworks: p.frameworks || [],
    });
    setPolicyFile(null);
    setShowPolicyDialog(true);
  };

  const savePolicy = async () => {
    if (!pForm.title || !user) return;
    setSaving(true);
    try {
      let file_url = editingPolicy?.file_url || null;
      let file_name = editingPolicy?.file_name || null;

      // Upload file if present
      if (policyFile) {
        const ext = policyFile.name.split(".").pop();
        const path = `${user.id}/${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage.from("policies").upload(path, policyFile);
        if (upErr) throw upErr;
        const { data: urlData } = supabase.storage.from("policies").getPublicUrl(path);
        file_url = urlData.publicUrl;
        file_name = policyFile.name;
      }

      const record: any = {
        title: pForm.title,
        description: pForm.description || null,
        category: pForm.category,
        version: pForm.version,
        frameworks: pForm.frameworks,
        file_url, file_name,
        effective_date: pForm.effective_date || null,
        review_date: pForm.review_date || null,
      };

      if (editingPolicy) {
        record.updated_at = new Date().toISOString();
        const { error } = await supabase.from("org_policies").update(record).eq("id", editingPolicy.id);
        if (error) throw error;

        // Log update
        await supabase.from("policy_updates").insert({
          policy_id: editingPolicy.id,
          update_type: "revision",
          title: `Updated to v${pForm.version}`,
          description: `Policy "${pForm.title}" updated`,
          previous_version: editingPolicy.version,
          new_version: pForm.version,
          updated_by: user.id,
        } as any);

        toast.success("Policy updated");
      } else {
        record.created_by = user.id;
        record.status = "draft";
        const { error } = await supabase.from("org_policies").insert(record as any);
        if (error) throw error;
        toast.success("Policy created");
      }

      setShowPolicyDialog(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const updatePolicyStatus = async (policyId: string, newStatus: string) => {
    if (!user) return;
    try {
      const updates: any = { status: newStatus, updated_at: new Date().toISOString() };
      if (newStatus === "active") {
        updates.approved_by = user.id;
        updates.approved_at = new Date().toISOString();
      }
      const { error } = await supabase.from("org_policies").update(updates).eq("id", policyId);
      if (error) throw error;

      const pol = policies.find(p => p.id === policyId);
      await supabase.from("policy_updates").insert({
        policy_id: policyId,
        update_type: "status_change",
        title: `Status changed to ${newStatus}`,
        description: `Policy "${pol?.title}" status changed to ${newStatus}`,
        updated_by: user.id,
      } as any);

      toast.success(`Policy ${newStatus}`);
      fetchData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const deletePolicy = async (id: string) => {
    try {
      const { error } = await supabase.from("org_policies").delete().eq("id", id);
      if (error) throw error;
      toast.success("Policy deleted");
      fetchData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  /* ── Compliance Assessment ──────────────── */

  const runAssessment = async (framework: string) => {
    if (!user) return;
    setSaving(true);
    try {
      const controls = FRAMEWORK_CONTROLS[framework] || [];
      const existing = assessments.filter(a => a.framework === framework);

      // Only create assessments for controls that don't exist yet
      const newControls = controls.filter(c => !existing.some(e => e.control_ref === c.ref));

      if (newControls.length > 0) {
        const records = newControls.map(c => ({
          framework,
          control_ref: c.ref,
          control_name: c.name,
          status: "not_assessed",
          assessed_by: user.id,
        }));
        const { error } = await supabase.from("compliance_assessments").insert(records as any);
        if (error) throw error;
      }

      toast.success(`${framework} assessment initialized with ${controls.length} controls`);
      setShowAssessDialog(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const updateAssessmentStatus = async (id: string, newStatus: string, evidence?: string) => {
    if (!user) return;
    try {
      const { error } = await supabase.from("compliance_assessments").update({
        status: newStatus,
        evidence: evidence || null,
        assessed_by: user.id,
        assessed_at: new Date().toISOString(),
      } as any).eq("id", id);
      if (error) throw error;
      toast.success("Assessment updated");
      fetchData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  /* ── AI Gap Analysis ───────────────────── */

  const runGapAnalysis = async (framework: string) => {
    const fwName = FRAMEWORKS.find(f => f.id === framework)?.name || framework;
    setGapFramework(fwName);
    setGapAnalysis("");
    setGapLoading(true);
    setShowGapDialog(true);

    try {
      const fwControls = assessments.filter(a => a.framework === framework);
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/compliance-gap-analysis`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          controls: fwControls,
          framework: fwName,
          policies: policies.map(p => ({ title: p.title, category: p.category, status: p.status })),
        }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: "AI analysis failed" }));
        toast.error(err.error || "AI analysis failed");
        setGapLoading(false);
        return;
      }

      const reader = resp.body?.getReader();
      if (!reader) { setGapLoading(false); return; }
      const decoder = new TextDecoder();
      let buf = "";
      let result = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        let nl: number;
        while ((nl = buf.indexOf("\n")) !== -1) {
          let line = buf.slice(0, nl);
          buf = buf.slice(nl + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") break;
          try {
            const parsed = JSON.parse(json);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) { result += content; setGapAnalysis(result); }
          } catch { buf = line + "\n" + buf; break; }
        }
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setGapLoading(false);
    }
  };

  /* ── PDF Export ─────────────────────────── */

  const exportCompliancePDF = () => {
    const assessed = frameworkStats.filter(f => f.assessed);
    const totalC = assessments.length;
    const compliantC = assessments.filter(a => a.status === "compliant").length;
    const partialC = assessments.filter(a => a.status === "partial").length;
    const nonC = assessments.filter(a => a.status === "non_compliant").length;
    const overallCoverage = totalC > 0 ? Math.round(((compliantC + partialC * 0.5) / totalC) * 100) : 0;

    const fwRows = assessed.map(f => `
      <tr>
        <td style="padding:8px;border-bottom:1px solid #333">${f.icon} ${f.name}</td>
        <td style="padding:8px;border-bottom:1px solid #333;text-align:center">${f.total}</td>
        <td style="padding:8px;border-bottom:1px solid #333;text-align:center;color:#22c55e">${f.compliant}</td>
        <td style="padding:8px;border-bottom:1px solid #333;text-align:center;color:#eab308">${f.partial}</td>
        <td style="padding:8px;border-bottom:1px solid #333;text-align:center;color:#ef4444">${f.nonCompliant}</td>
        <td style="padding:8px;border-bottom:1px solid #333;text-align:center;font-weight:bold">${f.coverage}%</td>
      </tr>`).join("");

    const controlRows = assessments.map(a => {
      const fw = FRAMEWORKS.find(f => f.id === a.framework);
      const color = a.status === "compliant" ? "#22c55e" : a.status === "partial" ? "#eab308" : a.status === "non_compliant" ? "#ef4444" : "#888";
      return `<tr>
        <td style="padding:6px;border-bottom:1px solid #222;font-size:11px">${fw?.name || a.framework}</td>
        <td style="padding:6px;border-bottom:1px solid #222;font-size:11px;font-family:monospace">${a.control_ref}</td>
        <td style="padding:6px;border-bottom:1px solid #222;font-size:11px">${a.control_name}</td>
        <td style="padding:6px;border-bottom:1px solid #222;font-size:11px;color:${color};font-weight:600">${a.status.replace("_", " ")}</td>
        <td style="padding:6px;border-bottom:1px solid #222;font-size:10px">${a.evidence || "—"}</td>
      </tr>`;
    }).join("");

    const policyRows = policies.map(p => `
      <tr>
        <td style="padding:6px;border-bottom:1px solid #222;font-size:11px">${p.title}</td>
        <td style="padding:6px;border-bottom:1px solid #222;font-size:11px">${p.category}</td>
        <td style="padding:6px;border-bottom:1px solid #222;font-size:11px">${p.status}</td>
        <td style="padding:6px;border-bottom:1px solid #222;font-size:11px">v${p.version}</td>
      </tr>`).join("");

    const html = `<!DOCTYPE html><html><head><title>Compliance Report - ${new Date().toLocaleDateString()}</title>
    <style>
      body{font-family:system-ui,sans-serif;background:#0a0e1a;color:#e2e8f0;margin:0;padding:40px}
      h1{color:#38bdf8;margin-bottom:4px} h2{color:#38bdf8;margin-top:32px;border-bottom:1px solid #1e293b;padding-bottom:8px}
      table{width:100%;border-collapse:collapse;margin-top:12px}
      th{text-align:left;padding:8px;border-bottom:2px solid #334155;color:#94a3b8;font-size:11px;text-transform:uppercase}
      .kpi{display:inline-block;background:#1e293b;border-radius:8px;padding:16px 24px;margin:8px;text-align:center}
      .kpi .val{font-size:28px;font-weight:700;color:#38bdf8} .kpi .lbl{font-size:11px;color:#94a3b8;margin-top:4px}
      .bar{height:8px;border-radius:4px;background:#1e293b;margin-top:4px;overflow:hidden}
      .bar-fill{height:100%;border-radius:4px}
      @media print{body{background:#fff;color:#1e293b} th{color:#64748b;border-color:#e2e8f0} .kpi{background:#f1f5f9} .kpi .val{color:#0284c7} h1,h2{color:#0284c7}}
    </style></head><body>
    <h1>🛡️ Compliance & Governance Report</h1>
    <p style="color:#94a3b8;margin-bottom:24px">Generated: ${new Date().toLocaleString()} | Organization Compliance Assessment</p>

    <h2>Executive Summary</h2>
    <div style="margin:16px 0">
      <div class="kpi"><div class="val">${overallCoverage}%</div><div class="lbl">Overall Coverage</div></div>
      <div class="kpi"><div class="val">${totalC}</div><div class="lbl">Controls Assessed</div></div>
      <div class="kpi"><div class="val">${compliantC}</div><div class="lbl">Compliant</div></div>
      <div class="kpi"><div class="val" style="color:#ef4444">${nonC}</div><div class="lbl">Non-Compliant</div></div>
      <div class="kpi"><div class="val">${policies.length}</div><div class="lbl">Policies</div></div>
    </div>

    <h2>Framework Coverage</h2>
    <table><thead><tr><th>Framework</th><th style="text-align:center">Controls</th><th style="text-align:center">Compliant</th><th style="text-align:center">Partial</th><th style="text-align:center">Non-Compliant</th><th style="text-align:center">Coverage</th></tr></thead><tbody>${fwRows}</tbody></table>

    <h2>Organizational Policies</h2>
    <table><thead><tr><th>Title</th><th>Category</th><th>Status</th><th>Version</th></tr></thead><tbody>${policyRows || '<tr><td colspan="4" style="padding:12px;color:#64748b">No policies uploaded</td></tr>'}</tbody></table>

    <h2>Detailed Control Status</h2>
    <table><thead><tr><th>Framework</th><th>Control</th><th>Name</th><th>Status</th><th>Evidence</th></tr></thead><tbody>${controlRows || '<tr><td colspan="5" style="padding:12px;color:#64748b">No assessments</td></tr>'}</tbody></table>

    <div style="margin-top:40px;padding-top:16px;border-top:1px solid #334155;color:#64748b;font-size:10px">
      CyberX Governance Platform — Confidential — ${new Date().toLocaleDateString()}
    </div>
    </body></html>`;

    const w = window.open("", "_blank");
    if (w) { w.document.write(html); w.document.close(); w.print(); }
  };

  /* ── Computed ───────────────────────────── */

  const frameworkStats = FRAMEWORKS.map(fw => {
    const fwAssessments = assessments.filter(a => a.framework === fw.id);
    const total = fwAssessments.length;
    const compliant = fwAssessments.filter(a => a.status === "compliant").length;
    const partial = fwAssessments.filter(a => a.status === "partial").length;
    const nonCompliant = fwAssessments.filter(a => a.status === "non_compliant").length;
    const coverage = total > 0 ? Math.round(((compliant + partial * 0.5) / total) * 100) : 0;
    return { ...fw, total, compliant, partial, nonCompliant, coverage, assessed: total > 0 };
  });

  const activePolicies = policies.filter(p => p.status === "active").length;
  const draftPolicies = policies.filter(p => p.status === "draft").length;
  const totalControls = assessments.length;
  const compliantControls = assessments.filter(a => a.status === "compliant").length;

  const filteredAssessments = assessments.filter(a => {
    if (complianceFilter !== "all" && a.framework !== complianceFilter) return false;
    if (searchTerm && !a.control_name.toLowerCase().includes(searchTerm.toLowerCase()) && !a.control_ref.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  /* ── Tab buttons ────────────────────────── */

  const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "overview", label: "Overview", icon: <BarChart3 className="h-4 w-4" /> },
    { key: "policies", label: "Policies", icon: <BookOpen className="h-4 w-4" /> },
    { key: "compliance", label: "Compliance", icon: <ClipboardCheck className="h-4 w-4" /> },
    { key: "audit", label: "Audit & RBAC", icon: <Shield className="h-4 w-4" /> },
  ];

  if (loading) {
    return (
      <CyberXLayout title="Governance, Compliance & Audit" breadcrumb={["CyberX", "Governance"]}>
        <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      </CyberXLayout>
    );
  }

  return (
    <CyberXLayout title="Governance, Compliance & Audit" breadcrumb={["CyberX", "Governance"]}>
      {/* Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {TABS.map(t => (
          <Button key={t.key} variant={tab === t.key ? "hero" : "outline"} size="sm" onClick={() => setTab(t.key)}>
            {t.icon}<span className="ml-1">{t.label}</span>
          </Button>
        ))}
      </div>

      {/* ────── OVERVIEW TAB ────── */}
      {tab === "overview" && (
        <div className="space-y-5">
          {/* KPIs */}
          <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
            {[
              { icon: BookOpen, label: "Total Policies", value: policies.length, sub: `${activePolicies} active, ${draftPolicies} draft` },
              { icon: Scale, label: "Frameworks", value: frameworkStats.filter(f => f.assessed).length, sub: `of ${FRAMEWORKS.length} available` },
              { icon: ClipboardCheck, label: "Controls Assessed", value: totalControls, sub: `${compliantControls} compliant` },
              { icon: AlertTriangle, label: "Non-Compliant", value: assessments.filter(a => a.status === "non_compliant").length, sub: "Require attention", highlight: true },
            ].map(k => (
              <div key={k.label} className="cyberx-kpi space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{k.label}</span>
                  <k.icon className={cn("h-4 w-4", k.highlight ? "text-destructive" : "text-primary")} />
                </div>
                <p className={cn("font-display text-2xl", k.highlight ? "text-destructive" : "text-foreground")}>{k.value}</p>
                <p className="text-xs text-muted-foreground">{k.sub}</p>
              </div>
            ))}
          </div>

          {/* Security Controls */}
          <div className="cyberx-panel p-5 space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Security & Sovereignty Controls</h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {SECURITY_CONTROLS.map(c => (
                <div key={c.control} className="flex items-start gap-3 rounded-lg bg-secondary/30 border border-border/40 p-3">
                  <c.icon className="h-5 w-5 shrink-0 text-accent mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{c.control}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{c.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Framework Coverage Overview */}
          <div className="cyberx-panel p-5 space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Compliance Framework Coverage</h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {frameworkStats.map(f => (
                <div key={f.id} className="rounded-lg bg-secondary/30 border border-border/40 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">{f.icon} {f.name}</span>
                  </div>
                  {f.assessed ? (
                    <>
                      <div className="w-full h-2 rounded-full bg-secondary overflow-hidden">
                        <div className={cn("h-full rounded-full", f.coverage >= 80 ? "bg-accent" : f.coverage >= 50 ? "bg-yellow-400" : "bg-destructive")} style={{ width: `${f.coverage}%` }} />
                      </div>
                      <div className="flex justify-between text-[10px] text-muted-foreground">
                        <span>{f.coverage}% coverage</span>
                        <span>{f.compliant}/{f.total} controls</span>
                      </div>
                    </>
                  ) : (
                    <p className="text-xs text-muted-foreground">Not assessed yet</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ────── POLICIES TAB ────── */}
      {tab === "policies" && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg text-foreground">Organizational Policies</h2>
            <Button variant="hero" size="sm" onClick={openNewPolicy}>
              <Plus className="h-4 w-4 mr-1" />New Policy
            </Button>
          </div>

          {policies.length === 0 ? (
            <div className="cyberx-panel p-12 text-center">
              <BookOpen className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No policies yet. Upload your first organizational policy.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {policies.map(p => {
                const pStatus = POLICY_STATUS_STYLES[p.status] || POLICY_STATUS_STYLES.draft;
                const pUpdates = updates.filter(u => u.policy_id === p.id);
                const isExpanded = expandedPolicy === p.id;

                return (
                  <div key={p.id} className="cyberx-panel overflow-hidden">
                    {/* Policy header */}
                    <button onClick={() => setExpandedPolicy(isExpanded ? null : p.id)} className="w-full flex items-center gap-3 p-4 hover:bg-secondary/20 transition-colors text-left">
                      <FileText className="h-5 w-5 text-primary shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold text-foreground">{p.title}</span>
                          <span className={cn("text-[10px] px-2 py-0.5 rounded-full border font-semibold", pStatus.bg, pStatus.text)}>{p.status}</span>
                          <span className="text-[10px] text-muted-foreground">v{p.version}</span>
                        </div>
                        <div className="flex items-center gap-3 text-[10px] text-muted-foreground mt-1">
                          <span>{p.category}</span>
                          {p.effective_date && <span>Effective: {p.effective_date}</span>}
                          {p.frameworks?.length > 0 && <span>{p.frameworks.length} frameworks linked</span>}
                        </div>
                      </div>
                      {p.file_name && <Download className="h-4 w-4 text-muted-foreground" />}
                      {isExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                    </button>

                    {/* Expanded details */}
                    {isExpanded && (
                      <div className="px-4 pb-4 space-y-4 border-t border-border/30">
                        {p.description && <p className="text-xs text-muted-foreground pt-3">{p.description}</p>}

                        {/* Linked frameworks */}
                        {p.frameworks?.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {p.frameworks.map(fw => {
                              const fwInfo = FRAMEWORKS.find(f => f.id === fw);
                              return <Badge key={fw} variant="outline" className="text-[10px]">{fwInfo?.icon} {fwInfo?.name || fw}</Badge>;
                            })}
                          </div>
                        )}

                        {/* File download */}
                        {p.file_url && (
                          <a href={p.file_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline">
                            <Download className="h-3 w-3" />{p.file_name || "Download document"}
                          </a>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2 flex-wrap">
                          {p.status === "draft" && (
                            <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => updatePolicyStatus(p.id, "active")}>
                              <CheckCircle2 className="h-3 w-3 mr-1" />Approve & Activate
                            </Button>
                          )}
                          {p.status === "active" && (
                            <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => updatePolicyStatus(p.id, "under_review")}>
                              <RefreshCw className="h-3 w-3 mr-1" />Send for Review
                            </Button>
                          )}
                          {p.status === "under_review" && (
                            <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => updatePolicyStatus(p.id, "active")}>
                              <CheckCircle2 className="h-3 w-3 mr-1" />Re-approve
                            </Button>
                          )}
                          <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => openEditPolicy(p)}>
                            <Pencil className="h-3 w-3 mr-1" />Edit
                          </Button>
                          <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => updatePolicyStatus(p.id, "deprecated")}>
                            Deprecate
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive" onClick={() => deletePolicy(p.id)}>
                            <Trash2 className="h-3 w-3 mr-1" />Delete
                          </Button>
                        </div>

                        {/* Update history */}
                        {pUpdates.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-1"><History className="h-3 w-3" />Change History</p>
                            <div className="space-y-1.5 max-h-40 overflow-y-auto">
                              {pUpdates.map(u => (
                                <div key={u.id} className="flex items-center gap-2 text-[10px] text-muted-foreground">
                                  <span className="text-muted-foreground/60">{new Date(u.created_at).toLocaleDateString()}</span>
                                  <span className={cn("px-1.5 py-0.5 rounded border text-[9px] font-medium",
                                    u.update_type === "revision" ? "border-primary/30 text-primary" : "border-accent/30 text-accent"
                                  )}>{u.update_type}</span>
                                  <span className="text-foreground">{u.title}</span>
                                  {u.previous_version && u.new_version && <span>v{u.previous_version} → v{u.new_version}</span>}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ────── COMPLIANCE TAB ────── */}
      {tab === "compliance" && (
        <div className="space-y-5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="font-display text-lg text-foreground">Compliance Assessments</h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={exportCompliancePDF} disabled={assessments.length === 0}>
                <FileDown className="h-4 w-4 mr-1" />Export PDF
              </Button>
              <Button variant="neon" size="sm" onClick={() => setShowAssessDialog(true)}>
                <Plus className="h-4 w-4 mr-1" />New Assessment
              </Button>
            </div>
          </div>

          {/* Framework summary cards */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {frameworkStats.filter(f => f.assessed).map(f => (
              <button key={f.id} onClick={() => setComplianceFilter(complianceFilter === f.id ? "all" : f.id)}
                className={cn("rounded-lg border p-4 space-y-2 text-left transition-all",
                  complianceFilter === f.id ? "border-primary/60 bg-primary/10" : "border-border/40 bg-secondary/30 hover:border-border/60"
                )}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">{f.icon} {f.name}</span>
                  <span className={cn("text-[10px] px-2 py-0.5 rounded-full border font-semibold",
                    f.coverage >= 80 ? "bg-accent/15 text-accent border-accent/40" : f.coverage >= 50 ? "bg-yellow-400/15 text-yellow-400 border-yellow-400/40" : "bg-destructive/15 text-destructive border-destructive/40"
                  )}>{f.coverage}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-secondary overflow-hidden">
                  <div className={cn("h-full rounded-full", f.coverage >= 80 ? "bg-accent" : f.coverage >= 50 ? "bg-yellow-400" : "bg-destructive")} style={{ width: `${f.coverage}%` }} />
                </div>
                <div className="flex justify-between items-center text-[9px]">
                  <div className="flex gap-2">
                    <span className="text-accent">{f.compliant} ✓</span>
                    <span className="text-yellow-400">{f.partial} ◐</span>
                    <span className="text-destructive">{f.nonCompliant} ✗</span>
                    <span className="text-muted-foreground">{f.total - f.compliant - f.partial - f.nonCompliant} ?</span>
                  </div>
                </div>
                {(f.nonCompliant > 0 || f.partial > 0 || f.total - f.compliant - f.partial - f.nonCompliant > 0) && (
                  <Button variant="ghost" size="sm" className="h-6 text-[10px] w-full mt-1 text-primary" onClick={(e) => { e.stopPropagation(); runGapAnalysis(f.id); }}>
                    <Sparkles className="h-3 w-3 mr-1" />AI Gap Analysis
                  </Button>
                )}
              </button>
            ))}
          </div>

          {/* Search/filter bar */}
          <div className="flex gap-2 items-center">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search controls..." className="pl-9 bg-secondary/60" />
            </div>
            {complianceFilter !== "all" && (
              <Button variant="outline" size="sm" onClick={() => setComplianceFilter("all")}>
                <XCircle className="h-3 w-3 mr-1" />Clear filter
              </Button>
            )}
          </div>

          {/* Controls table */}
          {filteredAssessments.length === 0 ? (
            <div className="cyberx-panel p-8 text-center">
              <ClipboardCheck className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                {assessments.length === 0 ? "No assessments yet. Start by creating a new assessment." : "No controls match your filter."}
              </p>
            </div>
          ) : (
            <div className="cyberx-panel overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-[10px] text-muted-foreground uppercase tracking-wider">
                      <th className="p-3">Framework</th>
                      <th className="p-3">Control</th>
                      <th className="p-3">Name</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAssessments.map(a => {
                      const ss = STATUS_STYLES[a.status] || STATUS_STYLES.not_assessed;
                      const fw = FRAMEWORKS.find(f => f.id === a.framework);
                      return (
                        <tr key={a.id} className="border-b border-border/30 hover:bg-secondary/20">
                          <td className="p-3 text-xs">{fw?.icon} {fw?.name || a.framework}</td>
                          <td className="p-3 text-xs font-mono text-primary">{a.control_ref}</td>
                          <td className="p-3 text-xs text-foreground">{a.control_name}</td>
                          <td className="p-3">
                            <span className={cn("inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border font-semibold", ss.bg, ss.text)}>
                              {ss.icon}{a.status.replace("_", " ")}
                            </span>
                          </td>
                          <td className="p-3">
                            <div className="flex gap-1">
                              {["compliant", "partial", "non_compliant"].map(s => (
                                <button key={s} onClick={() => updateAssessmentStatus(a.id, s)}
                                  className={cn("h-6 w-6 rounded flex items-center justify-center border text-[10px] transition-all",
                                    a.status === s ? "opacity-100" : "opacity-40 hover:opacity-80",
                                    STATUS_STYLES[s]?.bg, STATUS_STYLES[s]?.text
                                  )} title={s.replace("_", " ")}>
                                  {STATUS_STYLES[s]?.icon}
                                </button>
                              ))}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ────── AUDIT TAB ────── */}
      {tab === "audit" && (
        <div className="space-y-5">
          <div className="grid gap-5 lg:grid-cols-2">
            {/* Audit Log */}
            <div className="cyberx-panel p-5 space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Audit Log</h3>
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {AUDIT_LOGS.map(l => (
                  <div key={l.id} className="flex flex-wrap items-start gap-2 border-b border-border/40 py-2.5 text-xs">
                    <span className={cn("font-semibold uppercase", LEVEL_STYLES[l.level])}>{l.level}</span>
                    <span className="text-muted-foreground">{l.ts}</span>
                    <span className="font-medium">{l.action}</span>
                    <span className="ml-auto text-muted-foreground">{l.user}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* RBAC */}
            <div className="cyberx-panel p-5 space-y-3">
              <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                <Users className="h-4 w-4" />Role-Based Access Control
              </h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs text-muted-foreground">
                    <th className="pb-2 pr-4">Role</th>
                    <th className="pb-2 pr-4">Access</th>
                    <th className="pb-2">Users</th>
                  </tr>
                </thead>
                <tbody>
                  {PERMISSIONS.map(p => (
                    <tr key={p.role} className="border-b border-border/40">
                      <td className="py-2.5 pr-4 font-semibold whitespace-nowrap">{p.role}</td>
                      <td className="py-2.5 pr-4 text-xs text-muted-foreground">{p.access}</td>
                      <td className="py-2.5 text-muted-foreground">{p.users}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Policy update log */}
          {updates.length > 0 && (
            <div className="cyberx-panel p-5 space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <History className="h-4 w-4" />Policy Change Log
              </h3>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {updates.slice(0, 20).map(u => {
                  const pol = policies.find(p => p.id === u.policy_id);
                  return (
                    <div key={u.id} className="flex items-center gap-3 text-xs border-b border-border/30 py-2">
                      <span className="text-muted-foreground/60 whitespace-nowrap">{new Date(u.created_at).toLocaleString()}</span>
                      <span className={cn("px-1.5 py-0.5 rounded border text-[9px] font-medium shrink-0",
                        u.update_type === "revision" ? "border-primary/30 text-primary" : "border-accent/30 text-accent"
                      )}>{u.update_type}</span>
                      <span className="text-foreground font-medium">{pol?.title || "Unknown policy"}</span>
                      <span className="text-muted-foreground">{u.title}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ────── POLICY DIALOG ────── */}
      <Dialog open={showPolicyDialog} onOpenChange={setShowPolicyDialog}>
        <DialogContent className="max-w-lg bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-display">{editingPolicy ? "Edit Policy" : "New Policy"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Title *</label>
              <Input value={pForm.title} onChange={e => setPForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Information Security Policy" className="bg-secondary/60" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Description</label>
              <Textarea value={pForm.description} onChange={e => setPForm(f => ({ ...f, description: e.target.value }))} placeholder="Policy scope and purpose..." className="bg-secondary/60" rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Category</label>
                <Select value={pForm.category} onValueChange={v => setPForm(f => ({ ...f, category: v }))}>
                  <SelectTrigger className="bg-secondary/60"><SelectValue /></SelectTrigger>
                  <SelectContent>{POLICY_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Version</label>
                <Input value={pForm.version} onChange={e => setPForm(f => ({ ...f, version: e.target.value }))} className="bg-secondary/60" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Effective Date</label>
                <Input type="date" value={pForm.effective_date} onChange={e => setPForm(f => ({ ...f, effective_date: e.target.value }))} className="bg-secondary/60" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Review Date</label>
                <Input type="date" value={pForm.review_date} onChange={e => setPForm(f => ({ ...f, review_date: e.target.value }))} className="bg-secondary/60" />
              </div>
            </div>

            {/* Linked frameworks */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Linked Frameworks</label>
              <div className="flex flex-wrap gap-2">
                {FRAMEWORKS.map(fw => (
                  <button key={fw.id} onClick={() => setPForm(f => ({
                    ...f, frameworks: f.frameworks.includes(fw.id) ? f.frameworks.filter(x => x !== fw.id) : [...f.frameworks, fw.id]
                  }))} className={cn("text-[10px] px-2 py-1 rounded-full border transition-all",
                    pForm.frameworks.includes(fw.id) ? "border-primary/60 bg-primary/15 text-primary" : "border-border/40 text-muted-foreground hover:border-border"
                  )}>
                    {fw.icon} {fw.name}
                  </button>
                ))}
              </div>
            </div>

            {/* File upload */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Policy Document</label>
              <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,.txt,.md" className="hidden" onChange={e => setPolicyFile(e.target.files?.[0] || null)} />
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="h-3 w-3 mr-1" />{policyFile ? policyFile.name : editingPolicy?.file_name || "Choose file"}
                </Button>
                {(policyFile || editingPolicy?.file_name) && <span className="text-[10px] text-muted-foreground">PDF, DOC, TXT</span>}
              </div>
            </div>

            <Button variant="hero" className="w-full" onClick={savePolicy} disabled={!pForm.title || saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <CheckCircle2 className="h-4 w-4 mr-1" />}
              {editingPolicy ? "Update Policy" : "Create Policy"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ────── ASSESSMENT DIALOG ────── */}
      <Dialog open={showAssessDialog} onOpenChange={setShowAssessDialog}>
        <DialogContent className="max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-display">New Compliance Assessment</DialogTitle>
          </DialogHeader>
          <p className="text-xs text-muted-foreground">Select a framework to initialize control assessments. Existing controls won't be duplicated.</p>
          <div className="grid gap-2">
            {FRAMEWORKS.map(fw => {
              const existing = assessments.filter(a => a.framework === fw.id).length;
              const total = FRAMEWORK_CONTROLS[fw.id]?.length || 0;
              return (
                <button key={fw.id} onClick={() => runAssessment(fw.id)}
                  disabled={saving}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border/40 bg-secondary/20 hover:bg-secondary/40 transition-all text-left">
                  <span className="text-lg">{fw.icon}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{fw.name}</p>
                    <p className="text-[10px] text-muted-foreground">{total} controls {existing > 0 ? `(${existing} already assessed)` : ""}</p>
                  </div>
                  <Plus className="h-4 w-4 text-primary" />
                </button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      {/* ────── GAP ANALYSIS DIALOG ────── */}
      <Dialog open={showGapDialog} onOpenChange={setShowGapDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] bg-card border-border overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />AI Gap Analysis — {gapFramework}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto pr-2">
            {gapLoading && !gapAnalysis && (
              <div className="flex items-center gap-2 py-8 justify-center text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="text-sm">Analyzing compliance gaps...</span>
              </div>
            )}
            {gapAnalysis && (
              <div className="prose prose-sm prose-invert max-w-none text-sm">
                <ReactMarkdown>{gapAnalysis}</ReactMarkdown>
              </div>
            )}
            {gapLoading && gapAnalysis && (
              <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" />Analyzing...
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </CyberXLayout>
  );
}
