-- Create a table for twin memories/learning
CREATE TABLE public.twin_memories (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    advisor_id UUID NOT NULL REFERENCES public.advisors(id) ON DELETE CASCADE,
    memory_type TEXT NOT NULL, -- e.g., 'conversation_pattern', 'fact', 'preference'
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.twin_memories ENABLE ROW LEVEL SECURITY;

-- Policies for twin memories
CREATE POLICY "Users can view memories of their twins" 
ON public.twin_memories 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.advisors a 
    WHERE a.id = twin_memories.advisor_id 
    AND (a.assigned_user_id = auth.uid() OR a.tenant_id = auth.uid() OR has_role(auth.uid(), 'admin'))
  )
);

CREATE POLICY "Users can insert memories to their twins" 
ON public.twin_memories 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.advisors a 
    WHERE a.id = twin_memories.advisor_id 
    AND (a.assigned_user_id = auth.uid() OR a.tenant_id = auth.uid() OR has_role(auth.uid(), 'admin'))
  )
);

CREATE POLICY "Users can delete memories of their twins" 
ON public.twin_memories 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.advisors a 
    WHERE a.id = twin_memories.advisor_id 
    AND (a.assigned_user_id = auth.uid() OR a.tenant_id = auth.uid() OR has_role(auth.uid(), 'admin'))
  )
);
