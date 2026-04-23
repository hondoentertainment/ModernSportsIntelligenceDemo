-- Automatically refresh updated_at on every update to user_data rows.
-- The application adapter also writes updated_at explicitly, but this trigger
-- acts as a backstop for direct SQL writes, migrations, and admin edits.

CREATE OR REPLACE FUNCTION handle_user_data_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS user_data_updated_at ON user_data;

CREATE TRIGGER user_data_updated_at
  BEFORE UPDATE ON user_data
  FOR EACH ROW
  EXECUTE FUNCTION handle_user_data_updated_at();
