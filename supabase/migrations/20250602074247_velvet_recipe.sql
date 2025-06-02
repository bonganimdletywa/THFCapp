-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "admins_full_access" ON public.users;
DROP POLICY IF EXISTS "users_read_own_data" ON public.users;
DROP POLICY IF EXISTS "users_update_own_data" ON public.users;

-- Create new simplified policies without recursive checks
-- Admin full access policy
CREATE POLICY "admins_full_access" ON public.users
  FOR ALL 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'zoho_admin'
    )
  )
  WITH CHECK (
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
  WITH CHECK (
    auth.uid() = id 
    AND (
      -- Only allow updating non-sensitive fields
      NEW.id = OLD.id 
      AND NEW.role = OLD.role
      AND NEW.email = OLD.email
    )
  );