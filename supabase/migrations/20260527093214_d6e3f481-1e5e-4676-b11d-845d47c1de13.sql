
-- 1. Tighten profiles SELECT policy
DROP POLICY IF EXISTS "Авторизованные видят профили" ON public.profiles;

CREATE POLICY "Свой профиль или admin видит"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id OR public.has_role(auth.uid(), 'admin'::app_role));

-- 2. Public-safe view for cross-user display (names, positions only)
CREATE OR REPLACE VIEW public.public_profiles
WITH (security_invoker = true) AS
SELECT id, full_name, position
FROM public.profiles;

GRANT SELECT ON public.public_profiles TO authenticated;

-- Allow authenticated users to read non-sensitive columns of all profiles via the view
CREATE POLICY "Авторизованные видят имена через view"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

-- Wait — that would re-open access. Drop and use a different approach:
DROP POLICY "Авторизованные видят имена через view" ON public.profiles;

-- Instead expose names via a SECURITY DEFINER function-backed view
CREATE OR REPLACE VIEW public.public_profiles
WITH (security_invoker = false) AS
SELECT id, full_name, position
FROM public.profiles;

GRANT SELECT ON public.public_profiles TO authenticated;

-- 3. Realtime: restrict channel subscriptions to authenticated users
ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated can use realtime" ON realtime.messages;
CREATE POLICY "Authenticated can use realtime"
ON realtime.messages
FOR SELECT
TO authenticated
USING (true);

-- 4. Revoke direct execute on trigger-only function
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
