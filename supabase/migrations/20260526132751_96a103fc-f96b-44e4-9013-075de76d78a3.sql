
-- Convert profiles.position from enum to text so positions are dynamic
ALTER TABLE public.profiles ALTER COLUMN position TYPE text USING position::text;

-- Positions catalog
CREATE TABLE public.positions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  label text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.positions TO authenticated;
GRANT ALL ON public.positions TO service_role;

ALTER TABLE public.positions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view positions" ON public.positions
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins manage positions insert" ON public.positions
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage positions update" ON public.positions
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage positions delete" ON public.positions
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Seed initial positions
INSERT INTO public.positions (key, label) VALUES
  ('marketolog', 'Маркетолог'),
  ('product_manager', 'Продакт-менеджер'),
  ('smm_manager', 'SMM-менеджер'),
  ('designer', 'Дизайнер')
ON CONFLICT (key) DO NOTHING;
