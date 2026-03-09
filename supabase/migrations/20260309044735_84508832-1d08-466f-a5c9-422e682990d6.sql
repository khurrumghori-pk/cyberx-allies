
-- Create colleagues table for team digital twin feature (no FK to auth.users)
CREATE TABLE public.colleagues (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  display_name text NOT NULL,
  department text,
  job_title text,
  is_former_employee boolean DEFAULT false,
  advisor_id uuid REFERENCES public.advisors(id) ON DELETE SET NULL,
  tenant_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.colleagues ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view colleagues in their tenant"
ON public.colleagues FOR SELECT TO authenticated
USING (tenant_id = auth.uid() OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage colleagues"
ON public.colleagues FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin') OR tenant_id = auth.uid())
WITH CHECK (has_role(auth.uid(), 'admin') OR tenant_id = auth.uid());

-- Add colleague_ids to teams for simpler association
CREATE TABLE public.team_colleagues (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  colleague_id uuid NOT NULL REFERENCES public.colleagues(id) ON DELETE CASCADE,
  role text DEFAULT 'member',
  UNIQUE(team_id, colleague_id)
);

ALTER TABLE public.team_colleagues ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view team colleagues"
ON public.team_colleagues FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM teams t WHERE t.id = team_colleagues.team_id 
  AND (t.created_by = auth.uid() OR has_role(auth.uid(), 'admin'))
));

CREATE POLICY "Admins can manage team colleagues"
ON public.team_colleagues FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));
