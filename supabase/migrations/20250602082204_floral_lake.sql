/*
  # Fix users table RLS policies

  1. Security Changes
    - Enable RLS on users table
    - Add policies for:
      - Authenticated users to read their own data
      - Admins to have full access to all user data
      - Users to update their own non-sensitive data

  2. Changes
    - Ensures proper access control for user data
    - Fixes permission denied errors in the application
*/

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

-- Create policy for users to update their own non-sensitive data
CREATE POLICY "users_update_own_data"
ON public.users
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id AND
  -- Prevent updates to sensitive fields
  (
    NEW.id = OLD.id AND
    NEW.email = OLD.email AND
    NEW.role = OLD.role AND
    NEW.status = OLD.status
  )
);

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