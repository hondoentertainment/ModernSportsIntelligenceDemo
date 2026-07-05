-- 00009_profiles_role_fixes.sql — Phase 31 follow-up fixes for 00008.
--
-- The initial `profiles.role` migration had two ship-stopping bugs caught by
-- code review after merge:
--   1) The "Operators can view all profiles" SELECT policy subqueries
--      `profiles` inside its own USING clause. Postgres runs the subquery
--      under RLS as well, which self-recurses and raises
--        ERROR: infinite recursion detected in policy for relation "profiles"
--      That broke *every* SELECT on `profiles`, including AuthContext's
--      tier/role fetch, so all authenticated clients would fall back to
--      `member` / `free`.
--   2) The `profiles_prevent_self_role_change` trigger raised on *every*
--      UPDATE that changed `role`, including out-of-band SQL run by a
--      project owner in the SQL Editor. That made it impossible to
--      bootstrap the first `support`/`admin` account.
--
-- This migration replaces the policy with a SECURITY DEFINER helper that
-- reads `profiles.role` outside the caller's RLS scope, and lets the trigger
-- accept updates from the service role / postgres owner (i.e. anything
-- without an authenticated `auth.uid()`).

-- 1. Non-recursive operator check.
CREATE OR REPLACE FUNCTION public.is_operator()
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    caller_role TEXT;
BEGIN
    -- Anonymous callers are never operators.
    IF auth.uid() IS NULL THEN
        RETURN FALSE;
    END IF;
    -- SECURITY DEFINER bypasses the RLS on profiles for this internal lookup,
    -- so no self-recursion.
    SELECT role INTO caller_role
    FROM public.profiles
    WHERE id = auth.uid();
    RETURN caller_role IN ('support', 'admin');
END;
$$;

REVOKE ALL ON FUNCTION public.is_operator() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_operator() TO authenticated, anon;

DROP POLICY IF EXISTS "Operators can view all profiles" ON profiles;
CREATE POLICY "Operators can view all profiles" ON profiles
    FOR SELECT USING (public.is_operator());

-- 2. Trigger: skip the guard for out-of-band callers (service role / SQL
--    Editor / postgres). Those callers have no `auth.uid()` because they
--    are not going through PostgREST with a JWT.
CREATE OR REPLACE FUNCTION public.prevent_self_role_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    -- Out-of-band assignment by a project owner / service role has no
    -- authenticated user context. Let it through.
    IF auth.uid() IS NULL THEN
        RETURN NEW;
    END IF;
    IF NEW.role IS DISTINCT FROM OLD.role THEN
        RAISE EXCEPTION 'profiles.role can only be changed out-of-band by a project owner';
    END IF;
    RETURN NEW;
END;
$$;
