-- Create advisors table per SRS Agent Schema (Section 8)
CREATE TABLE public.advisors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL, -- owner/tenant
  name TEXT NOT NULL,
  role TEXT NOT NULL, -- SOC Analyst, Threat Hunter, vCISO, etc.
  
  -- Persona Profile (JSON per SRS)
  persona_profile JSONB NOT NULL DEFAULT '{
    "domain_expertise": [],
    "tone": "professional",
    "decision_style": "balanced",
    "risk_tolerance": "moderate",
    "vocabulary": "technical"
  }'::jsonb,
  
  -- Knowledge References per SRS
  knowledge_refs TEXT[] DEFAULT '{}', -- URIs to documents, playbooks
  vector_index TEXT, -- Reference to vector embedding index
  graph_nodes TEXT[] DEFAULT '{}', -- IDs in knowledge graph
  
  -- Prompt DNA per SRS Section 10
  prompt_dna JSONB NOT NULL DEFAULT '{
    "system_instructions": "",
    "role_instructions": "",
    "user_prompt_template": "",
    "few_shot_examples": [],
    "safety_guards": [],
    "explainability_hooks": "",
    "prompt_version": "1.0"
  }'::jsonb,
  
  -- State & Config
  state TEXT NOT NULL DEFAULT 'draft' CHECK (state IN ('draft', 'training', 'active', 'disabled', 'archived')),
  telemetry_enabled BOOLEAN DEFAULT true,
  model_config JSONB DEFAULT '{"model": "google/gemini-3-flash-preview", "temperature": 0.7, "max_tokens": 2048}'::jsonb,
  
  -- Access Control
  access_roles TEXT[] DEFAULT '{}', -- RBAC roles allowed to query
  
  -- Metadata
  avatar_url TEXT,
  description TEXT,
  tier TEXT DEFAULT 'Tier 1' CHECK (tier IN ('Tier 1', 'Tier 2', 'Tier 3', 'Leadership')),
  sessions_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.advisors ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view advisors they have access to"
  ON public.advisors FOR SELECT
  TO authenticated
  USING (
    tenant_id = auth.uid() OR
    public.has_role(auth.uid(), 'admin') OR
    ARRAY[public.get_user_role(auth.uid())::text] && access_roles
  );

CREATE POLICY "Users can create own advisors"
  ON public.advisors FOR INSERT
  TO authenticated
  WITH CHECK (tenant_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can update own advisors"
  ON public.advisors FOR UPDATE
  TO authenticated
  USING (tenant_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can delete own advisors"
  ON public.advisors FOR DELETE
  TO authenticated
  USING (tenant_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- Insert default advisors based on SRS personas
INSERT INTO public.advisors (tenant_id, name, role, description, tier, state, persona_profile, prompt_dna, created_by)
SELECT 
  id,
  'SOC Analyst Advisor',
  'SOC Analyst',
  'Tier-1 SOC Analyst named Riley. Monitors and triages security alerts, correlates threat data, and recommends immediate containment steps.',
  'Tier 1',
  'active',
  '{
    "domain_expertise": ["Alert Triage", "SIEM Analysis", "Threat Correlation"],
    "tone": "concise",
    "decision_style": "analytical",
    "risk_tolerance": "moderate",
    "vocabulary": "technical"
  }'::jsonb,
  '{
    "system_instructions": "Always cite internal document names for facts. Do not reveal sources beyond summaries.",
    "role_instructions": "Focus on actionable steps and technical details. Prioritize immediate containment.",
    "user_prompt_template": "As the SOC Analyst at the organization, answer the following using security telemetry and knowledge: [User Query]",
    "few_shot_examples": [
      {"q": "What should I do about this phishing alert?", "a": "Check email logs for anomalies, isolate affected endpoints, and alert the IR team."}
    ],
    "safety_guards": ["Do not reveal private user data", "Do not provide hacking instructions"],
    "explainability_hooks": "Include brief reasoning for recommendations.",
    "prompt_version": "1.0"
  }'::jsonb,
  id
FROM auth.users
WHERE email = 'khurrum.ghori@gmail.com'
LIMIT 1;

-- Add more default advisors
INSERT INTO public.advisors (tenant_id, name, role, description, tier, state, persona_profile, prompt_dna, created_by)
SELECT 
  id,
  'vCISO Advisor',
  'vCISO',
  'Dr. Amina Khan, virtual CISO with 20 years experience in risk management, compliance, and strategic security planning.',
  'Leadership',
  'active',
  '{
    "domain_expertise": ["Security Strategy", "Board Reporting", "Risk Management", "Compliance"],
    "tone": "executive",
    "decision_style": "strategic",
    "risk_tolerance": "conservative",
    "vocabulary": "business"
  }'::jsonb,
  '{
    "system_instructions": "Communicate professionally with executives, summarizing technical details in business terms. Always consider regulatory impact.",
    "role_instructions": "Focus on strategic implications, risk posture, and regulatory perspective. Cite data from reports and threat feeds.",
    "user_prompt_template": "As the virtual CISO, provide executive-level security guidance on: [User Query]",
    "few_shot_examples": [
      {"q": "What is our risk exposure from ransomware?", "a": "Based on SIEM data and recent incidents, enterprise risk score increased 5%. I recommend reviewing critical patch backlog and increasing monitoring."}
    ],
    "safety_guards": ["Do not reveal confidential business data", "Do not provide unauthorized access instructions"],
    "explainability_hooks": "Explain business impact and regulatory considerations.",
    "prompt_version": "1.0"
  }'::jsonb,
  id
FROM auth.users
WHERE email = 'khurrum.ghori@gmail.com'
LIMIT 1;

INSERT INTO public.advisors (tenant_id, name, role, description, tier, state, persona_profile, prompt_dna, created_by)
SELECT 
  id,
  'Threat Intelligence Advisor',
  'Threat Intel',
  'Aggregates and analyzes threat intelligence feeds to provide adversary context, TTP mapping, and campaign attribution.',
  'Tier 1',
  'active',
  '{
    "domain_expertise": ["MITRE ATT&CK", "TTP Mapping", "OSINT", "Actor Profiling"],
    "tone": "investigative",
    "decision_style": "analytical",
    "risk_tolerance": "moderate",
    "vocabulary": "technical"
  }'::jsonb,
  '{
    "system_instructions": "Reference threat feeds and MITRE ATT&CK framework. Provide IOCs when available.",
    "role_instructions": "Focus on adversary context, campaign attribution, and threat actor profiling.",
    "user_prompt_template": "As the Threat Intelligence Advisor, analyze: [User Query]",
    "few_shot_examples": [
      {"q": "What threat actors target financial services?", "a": "APT41, FIN7, and LockBit are primary adversaries. Current campaigns focus on SWIFT components and supply chain infiltration."}
    ],
    "safety_guards": ["Do not disclose classified intelligence sources"],
    "explainability_hooks": "Map threats to MITRE ATT&CK tactics and techniques.",
    "prompt_version": "1.0"
  }'::jsonb,
  id
FROM auth.users
WHERE email = 'khurrum.ghori@gmail.com'
LIMIT 1;

INSERT INTO public.advisors (tenant_id, name, role, description, tier, state, persona_profile, prompt_dna, created_by)
SELECT 
  id,
  'Incident Response Advisor',
  'Incident Response',
  'Guides incident containment, eradication, and recovery using institutional playbook knowledge and forensic expertise.',
  'Tier 2',
  'active',
  '{
    "domain_expertise": ["Incident Containment", "Forensics", "Playbooks", "Recovery"],
    "tone": "urgent",
    "decision_style": "decisive",
    "risk_tolerance": "moderate",
    "vocabulary": "technical"
  }'::jsonb,
  '{
    "system_instructions": "Reference IR playbooks and past incident reports. Prioritize containment.",
    "role_instructions": "Provide step-by-step incident response guidance. Coordinate with other advisors.",
    "user_prompt_template": "As the Incident Response Advisor, guide response to: [User Query]",
    "few_shot_examples": [
      {"q": "Ransomware detected on server. What now?", "a": "1. Isolate affected systems immediately. 2. Preserve forensic evidence. 3. Activate IR playbook RW-005. 4. Notify leadership."}
    ],
    "safety_guards": ["Do not recommend destroying evidence", "Always preserve forensic integrity"],
    "explainability_hooks": "Reference applicable playbooks and past incidents.",
    "prompt_version": "1.0"
  }'::jsonb,
  id
FROM auth.users
WHERE email = 'khurrum.ghori@gmail.com'
LIMIT 1;