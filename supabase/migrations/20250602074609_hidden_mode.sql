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
    auth.jwt()->>'role' = 'zoho_admin'
  )
  WITH CHECK (
    auth.jwt()->>'role' = 'zoho_admin'
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

-- Revoke direct column update permissions
REVOKE UPDATE(role, email, id) ON public.users FROM authenticated;
REVOKE UPDATE(role, email, id) ON public.users FROM anon;

-- Create a trigger to prevent sensitive field updates
CREATE OR REPLACE FUNCTION prevent_sensitive_updates()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role != OLD.role THEN
    RAISE EXCEPTION 'Cannot update role field';
  END IF;
  
  IF NEW.email != OLD.email THEN
    RAISE EXCEPTION 'Cannot update email field';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS prevent_sensitive_updates_trigger ON public.users;
CREATE TRIGGER prevent_sensitive_updates_trigger
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION prevent_sensitive_updates();