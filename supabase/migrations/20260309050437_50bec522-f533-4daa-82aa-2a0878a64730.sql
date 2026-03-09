
-- Organizational policies table
CREATE TABLE public.org_policies (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  category text NOT NULL DEFAULT 'general',
  version text NOT NULL DEFAULT '1.0',
  status text NOT NULL DEFAULT 'draft',
  file_url text,
  file_name text,
  frameworks text[] DEFAULT '{}',
  created_by uuid NOT NULL,
  approved_by uuid,
  approved_at timestamp with time zone,
  effective_date date,
  review_date date,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.org_policies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage policies"
ON public.org_policies FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can view active policies"
ON public.org_policies FOR SELECT TO authenticated
USING (status = 'active' OR created_by = auth.uid() OR has_role(auth.uid(), 'admin'));

-- Compliance assessments table
CREATE TABLE public.compliance_assessments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  policy_id uuid REFERENCES public.org_policies(id) ON DELETE CASCADE,
  framework text NOT NULL,
  control_ref text NOT NULL,
  control_name text NOT NULL,
  status text NOT NULL DEFAULT 'not_assessed',
  evidence text,
  notes text,
  assessed_by uuid NOT NULL,
  assessed_at timestamp with time zone NOT NULL DEFAULT now(),
  next_review date
);

ALTER TABLE public.compliance_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage assessments"
ON public.compliance_assessments FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view assessments"
ON public.compliance_assessments FOR SELECT TO authenticated
USING (true);

-- Policy updates / changelog
CREATE TABLE public.policy_updates (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  policy_id uuid REFERENCES public.org_policies(id) ON DELETE CASCADE NOT NULL,
  update_type text NOT NULL DEFAULT 'revision',
  title text NOT NULL,
  description text,
  previous_version text,
  new_version text,
  updated_by uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.policy_updates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage policy updates"
ON public.policy_updates FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view policy updates"
ON public.policy_updates FOR SELECT TO authenticated
USING (true);

-- Storage bucket for policy documents
INSERT INTO storage.buckets (id, name, public) VALUES ('policies', 'policies', false);

CREATE POLICY "Admins can upload policies"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'policies' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can view policies"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'policies');

CREATE POLICY "Admins can delete policy files"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'policies' AND has_role(auth.uid(), 'admin'));
