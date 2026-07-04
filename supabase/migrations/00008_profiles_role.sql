-- 00008_profiles_role.sql — Phase 31 admin/support role for audit-trail cross-user viewer.
--
-- Adds a small trust-boundary role column to `profiles`. Every account is a
-- 'member' by default; 'support' and 'admin' unlock the cross-user audit
-- viewer (pages/AdminAuditTrail.tsx) via the admin-audit-events Edge Function.
--
-- Role assignments are intentionally OUT-OF-BAND (SQL only). No client can
-- write the column: the update policy scopes to `auth.uid() = id` for member
-- self-updates only; role transitions to support/admin must be performed by
-- a project owner in SQL Editor.

ALTER TABLE profiles
    ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'member'
    CHECK (role IN ('member', 'support', 'admin'));

CREATE INDEX IF NOT EXISTS profiles_role_idx ON profiles(role)
    WHERE role <> 'member';

-- Ensure default RLS on profiles is present; the operator read policy layers
-- on top so support/admin can read every profile (role lookup only).

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Operators can view all profiles" ON profiles;
CREATE POLICY "Operators can view all profiles" ON profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid()
              AND p.role IN ('support', 'admin')
        )
    );

-- Guard against a client mutating their own role. Update policy stays
-- self-only (unchanged) — but Postgres has no per-column policy language, so
-- we enforce it via a BEFORE UPDATE trigger.

CREATE OR REPLACE FUNCTION public.prevent_self_role_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    IF NEW.role IS DISTINCT FROM OLD.role THEN
        RAISE EXCEPTION 'profiles.role can only be changed out-of-band by a project owner';
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_prevent_self_role_change ON profiles;
CREATE TRIGGER profiles_prevent_self_role_change
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION public.prevent_self_role_change();
