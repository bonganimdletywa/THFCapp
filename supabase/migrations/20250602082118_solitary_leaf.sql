-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "admins_full_access" ON public.users;
DROP POLICY IF EXISTS "users_read_own_data" ON public.users;
DROP POLICY IF EXISTS "users_update_own_data" ON public.users;

-- Create new simplified policies without recursive checks
-- Admin full access policy based on JWT claims
CREATE POLICY "admins_full_access" ON public.users
  FOR ALL 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'zoho_admin'
    )
  );

-- Users can read their own data
CREATE POLICY "users_read_own_data" ON public.users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Users can update their own non-sensitive data
CREATE POLICY "users_update_own_data" ON public.users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Add column level security
ALTER TABLE public.users 
  ALTER COLUMN role SET DEFAULT 'csi_field_worker',
  ALTER COLUMN email SET NOT NULL,
  ALTER COLUMN role SET NOT NULL;

-- Revoke update permissions on sensitive columns
REVOKE UPDATE(role, email, id) ON public.users FROM authenticated;
REVOKE UPDATE(role, email, id) ON public.users FROM anon;

-- Create trigger function to prevent sensitive field updates
CREATE OR REPLACE FUNCTION prevent_sensitive_updates()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF NEW.role IS DISTINCT FROM OLD.role THEN
      RAISE EXCEPTION 'Cannot modify role';
    END IF;
    IF NEW.email IS DISTINCT FROM OLD.email THEN
      RAISE EXCEPTION 'Cannot modify email';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to enforce field update restrictions
DROP TRIGGER IF EXISTS prevent_sensitive_updates_trigger ON public.users;
CREATE TRIGGER prevent_sensitive_updates_trigger
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION prevent_sensitive_updates();