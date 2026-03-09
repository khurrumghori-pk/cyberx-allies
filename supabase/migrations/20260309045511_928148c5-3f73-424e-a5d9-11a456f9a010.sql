
-- Create twin_conversations for multi-turn team twin chats
CREATE TABLE public.twin_conversations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  target_type text NOT NULL, -- 'colleague', 'team', 'former', 'proactive'
  target_id text NOT NULL, -- colleague_id or team_id
  target_name text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.twin_conversation_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id uuid NOT NULL REFERENCES public.twin_conversations(id) ON DELETE CASCADE,
  role text NOT NULL, -- 'user' or 'assistant'
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.twin_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.twin_conversation_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own twin conversations"
ON public.twin_conversations FOR ALL TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can manage messages of own conversations"
ON public.twin_conversation_messages FOR ALL TO authenticated
USING (EXISTS (
  SELECT 1 FROM twin_conversations tc WHERE tc.id = twin_conversation_messages.conversation_id AND tc.user_id = auth.uid()
))
WITH CHECK (EXISTS (
  SELECT 1 FROM twin_conversations tc WHERE tc.id = twin_conversation_messages.conversation_id AND tc.user_id = auth.uid()
));
