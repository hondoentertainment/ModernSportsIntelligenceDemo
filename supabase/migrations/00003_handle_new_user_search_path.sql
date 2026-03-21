-- Harden SECURITY DEFINER trigger function (search_path injection).
-- No-op if handle_new_user does not exist yet (run supabase-schema.sql first).

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
      AND p.proname = 'handle_new_user'
  ) THEN
    EXECUTE 'ALTER FUNCTION public.handle_new_user() SET search_path = public, pg_temp';
  END IF;
END $$;
