-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "admins_full_access" ON public.users;
DROP POLICY IF EXISTS "users_read_own_data" ON public.users;
DROP POLICY IF EXISTS "users_update_own_data" ON public.users;

-- Create new simplified policies without recursive checks
-- Admin full access policy based on auth.users metadata
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

-- Users can update their own basic profile data
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

-- Revoke update permissions on sensitive columns from regular users
REVOKE UPDATE(role, email, id) ON public.users FROM authenticated;
REVOKE UPDATE(role, email, id) ON public.users FROM anon;