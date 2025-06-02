-- Enable RLS on users table (if not already enabled)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "users_read_own_data" ON public.users;
DROP POLICY IF EXISTS "users_update_own_data" ON public.users;
DROP POLICY IF EXISTS "admins_full_access" ON public.users;

-- Create policy for users to read their own data
CREATE POLICY "users_read_own_data"
ON public.users
FOR SELECT
TO authenticated
USING (
  auth.uid() = id
);

-- Create policy for users to update their own data
CREATE POLICY "users_update_own_data"
ON public.users
FOR UPDATE
TO authenticated
USING (auth.uid() = id);

-- Create policy for admins to have full access
CREATE POLICY "admins_full_access"
ON public.users
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND (auth.users.raw_user_meta_data->>'role')::text = 'zoho_admin'
  )
);

-- Create function to prevent updates to sensitive fields
CREATE OR REPLACE FUNCTION prevent_sensitive_updates()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.id != OLD.id THEN
    RAISE EXCEPTION 'Cannot modify user ID';
  END IF;
  
  IF NEW.email != OLD.email THEN
    RAISE EXCEPTION 'Cannot modify email directly';
  END IF;
  
  IF NEW.role != OLD.role THEN
    RAISE EXCEPTION 'Cannot modify role directly';
  END IF;
  
  IF NEW.status != OLD.status THEN
    RAISE EXCEPTION 'Cannot modify status directly';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to protect sensitive fields
DROP TRIGGER IF EXISTS protect_sensitive_fields ON public.users;
CREATE TRIGGER protect_sensitive_fields
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION prevent_sensitive_updates();