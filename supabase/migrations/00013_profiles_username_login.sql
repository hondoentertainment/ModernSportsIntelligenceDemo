-- 00013_profiles_username_login.sql
-- Username sign-in for profiles.
--
-- OWNER STEP. Do not apply this from an app request or an engineering agent.
-- Run it in the Supabase SQL editor on project vhbsokjqchaafluimgjh after the
-- preflight below returns no rows.
--
-- Preflight (duplicates block the unique index):
--   SELECT lower(username) AS handle, count(*)
--   FROM public.profiles
--   WHERE username IS NOT NULL AND btrim(username) <> ''
--   GROUP BY 1
--   HAVING count(*) > 1;
--
-- Adds:
--   * profiles.username (if the bootstrap schema has not already)
--   * a case-insensitive unique index on lower(username)
--   * a format trigger (3-20 letters, numbers, underscore) that fires only
--     when username itself is written, so legacy rows and Stripe updates of
--     other columns are left alone
--   * username_available(text) — boolean only, granted to anon
--   * resolve_username_email(text) — email only, granted to service_role
-- Anon is not given a policy that reads every profiles row.

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username TEXT;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- No blanket anon read. Self-access stays; the existing public-profile policy
-- (is_public = true) is left in place for the leaderboard.
DROP POLICY IF EXISTS "Anyone can read profiles" ON public.profiles;
DROP POLICY IF EXISTS "Anon can read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;

DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

COMMENT ON COLUMN public.profiles.username IS
  'Login handle. Case-insensitive unique via profiles_username_lower_idx. Email stays in auth.users.';

CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_lower_idx
  ON public.profiles (lower(username))
  WHERE username IS NOT NULL AND btrim(username) <> '';

CREATE OR REPLACE FUNCTION public.enforce_username_format()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NEW.username IS NOT NULL AND btrim(NEW.username) = '' THEN
    NEW.username := NULL;
  ELSIF NEW.username IS NOT NULL AND NEW.username !~ '^[A-Za-z0-9_]{3,20}$' THEN
    RAISE EXCEPTION 'username must be 3-20 letters, numbers, or underscores'
      USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_enforce_username_format ON public.profiles;
CREATE TRIGGER profiles_enforce_username_format
  BEFORE INSERT OR UPDATE OF username ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.enforce_username_format();

REVOKE ALL ON FUNCTION public.enforce_username_format() FROM PUBLIC, anon, authenticated;

-- Signup writes the handle from auth metadata when it matches the format.
-- Invalid metadata stores NULL instead of an email local-part.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  raw_username text;
  clean_username text;
BEGIN
  raw_username := NULLIF(btrim(NEW.raw_user_meta_data->>'username'), '');
  IF raw_username ~ '^[A-Za-z0-9_]{3,20}$' THEN
    clean_username := raw_username;
  ELSE
    clean_username := NULL;
  END IF;

  INSERT INTO public.profiles (id, username, display_name)
  VALUES (
    NEW.id,
    clean_username,
    COALESCE(raw_username, split_part(COALESCE(NEW.email, ''), '@', 1))
  )
  ON CONFLICT (id) DO UPDATE
    SET username = COALESCE(public.profiles.username, EXCLUDED.username),
        display_name = COALESCE(public.profiles.display_name, EXCLUDED.display_name);

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created') THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.username_available(p_username text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT CASE
    WHEN p_username IS NULL OR btrim(p_username) !~ '^[A-Za-z0-9_]{3,20}$' THEN false
    ELSE NOT EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE lower(username) = lower(btrim(p_username))
    )
  END;
$$;

REVOKE ALL ON FUNCTION public.username_available(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.username_available(text) TO anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION public.resolve_username_email(p_username text)
RETURNS text
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  normalized text;
  found_email text;
BEGIN
  normalized := lower(btrim(COALESCE(p_username, '')));
  IF normalized !~ '^[a-z0-9_]{3,20}$' THEN
    RETURN NULL;
  END IF;

  SELECT u.email
    INTO found_email
  FROM public.profiles p
  JOIN auth.users u ON u.id = p.id
  WHERE lower(p.username) = normalized
  LIMIT 1;

  RETURN found_email;
END;
$$;

REVOKE ALL ON FUNCTION public.resolve_username_email(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.resolve_username_email(text) TO service_role;

COMMENT ON FUNCTION public.resolve_username_email(text) IS
  'Maps a username to auth.users.email. service_role only. Does not return a profile row.';
