CREATE POLICY "Users can update memories of their twins"
ON public.twin_memories
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM advisors a
    WHERE a.id = twin_memories.advisor_id
      AND (a.assigned_user_id = auth.uid() OR a.tenant_id = auth.uid() OR has_role(auth.uid(), 'admin'))
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM advisors a
    WHERE a.id = twin_memories.advisor_id
      AND (a.assigned_user_id = auth.uid() OR a.tenant_id = auth.uid() OR has_role(auth.uid(), 'admin'))
  )
);