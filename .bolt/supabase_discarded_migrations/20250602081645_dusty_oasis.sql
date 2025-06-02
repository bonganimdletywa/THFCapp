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
  );

-- Users can read their own data
CREATE POLICY "users_read_own_data" ON public.users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Create trigger function to handle field-level validation
CREATE OR REPLACE FUNCTION validate_user_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if user is trying to modify sensitive fields
  IF OLD.id != NEW.id OR OLD.role != NEW.role OR OLD.email != NEW.email THEN
    RAISE EXCEPTION 'Cannot modify sensitive fields';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to enforce field update restrictions
DROP TRIGGER IF EXISTS validate_user_update_trigger ON public.users;
CREATE TRIGGER validate_user_update_trigger
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION validate_user_update();

-- Users can update their own non-sensitive data
CREATE POLICY "users_update_own_data" ON public.users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);