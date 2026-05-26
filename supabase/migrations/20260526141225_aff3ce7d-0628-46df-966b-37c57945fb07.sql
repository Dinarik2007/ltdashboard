CREATE TABLE public.ai_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  conversation_id uuid NOT NULL,
  role text NOT NULL CHECK (role IN ('user','assistant','system')),
  message text NOT NULL,
  mode text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_ai_conv_user_thread ON public.ai_conversations(user_id, conversation_id, created_at);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_conversations TO authenticated;
GRANT ALL ON public.ai_conversations TO service_role;

ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own ai messages select" ON public.ai_conversations
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "own ai messages insert" ON public.ai_conversations
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "own ai messages delete" ON public.ai_conversations
  FOR DELETE TO authenticated USING (user_id = auth.uid());