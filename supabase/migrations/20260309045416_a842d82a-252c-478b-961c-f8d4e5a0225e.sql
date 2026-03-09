
-- Fix infinite recursion: create security definer function to check team membership
CREATE OR REPLACE FUNCTION public.is_team_member(_user_id uuid, _team_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.team_members
    WHERE user_id = _user_id AND team_id = _team_id
  )
$$;

CREATE OR REPLACE FUNCTION public.get_user_team_ids(_user_id uuid)
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT team_id FROM public.team_members WHERE user_id = _user_id
$$;

-- Drop and recreate broken policies
DROP POLICY IF EXISTS "Users can view team members of their teams" ON public.team_members;
CREATE POLICY "Users can view team members of their teams"
ON public.team_members FOR SELECT TO authenticated
USING (
  has_role(auth.uid(), 'admin') 
  OR team_id IN (SELECT public.get_user_team_ids(auth.uid()))
);

DROP POLICY IF EXISTS "Users can view teams they belong to" ON public.teams;
CREATE POLICY "Users can view teams they belong to"
ON public.teams FOR SELECT TO authenticated
USING (
  has_role(auth.uid(), 'admin') 
  OR id IN (SELECT public.get_user_team_ids(auth.uid()))
  OR created_by = auth.uid()
);

DROP POLICY IF EXISTS "Users can view team colleagues" ON public.team_colleagues;
CREATE POLICY "Users can view team colleagues"
ON public.team_colleagues FOR SELECT TO authenticated
USING (
  has_role(auth.uid(), 'admin')
  OR team_id IN (SELECT public.get_user_team_ids(auth.uid()))
);

-- Allow admin or team creator to manage team_colleagues
DROP POLICY IF EXISTS "Admins can manage team colleagues" ON public.team_colleagues;
CREATE POLICY "Admins or creators can manage team colleagues"
ON public.team_colleagues FOR ALL TO authenticated
USING (
  has_role(auth.uid(), 'admin')
  OR EXISTS (SELECT 1 FROM teams t WHERE t.id = team_colleagues.team_id AND t.created_by = auth.uid())
)
WITH CHECK (
  has_role(auth.uid(), 'admin')
  OR EXISTS (SELECT 1 FROM teams t WHERE t.id = team_colleagues.team_id AND t.created_by = auth.uid())
);

-- Allow team creators to manage their teams
DROP POLICY IF EXISTS "Admins can manage teams" ON public.teams;
CREATE POLICY "Admins or creators can manage teams"
ON public.teams FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin') OR created_by = auth.uid())
WITH CHECK (has_role(auth.uid(), 'admin') OR created_by = auth.uid());
