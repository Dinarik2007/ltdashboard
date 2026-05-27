
DROP VIEW IF EXISTS public.public_profiles;

-- Restore broad row-level visibility (names needed across app), but restrict columns
DROP POLICY IF EXISTS "Свой профиль или admin видит" ON public.profiles;

CREATE POLICY "Авторизованные видят профили (ограниченные поля)"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

-- Column-level: revoke broad SELECT, grant only safe columns
REVOKE SELECT ON public.profiles FROM authenticated;
GRANT SELECT (id, full_name, position) ON public.profiles TO authenticated;
-- Keep update grants as before (column-level UPDATE on editable fields)
GRANT UPDATE (full_name, phone, position) ON public.profiles TO authenticated;
GRANT INSERT, DELETE ON public.profiles TO authenticated;
