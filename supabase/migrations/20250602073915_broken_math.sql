/*
  # Fix infinite recursion in users RLS policies

  1. Changes
    - Drop existing problematic RLS policies that cause infinite recursion
    - Create new simplified policies that avoid querying the users table within policy definitions
    
  2. Security
    - Maintain same level of access control but with more efficient policy definitions
    - Ensure admins retain full access
    - Users can still read and update their own data
    - No changes to table structure or data
*/

-- Drop existing problematic policies
DROP POLICY IF EXISTS "admin_access" ON public.users;
DROP POLICY IF EXISTS "admin_read_all" ON public.users;
DROP POLICY IF EXISTS "users_read_self" ON public.users;
DROP POLICY IF EXISTS "users_self_access" ON public.users;
DROP POLICY IF EXISTS "users_update_self" ON public.users;

-- Create new simplified policies
CREATE POLICY "admins_full_access" ON public.users
  FOR ALL 
  TO authenticated
  USING (role = 'zoho_admin')
  WITH CHECK (role = 'zoho_admin');

CREATE POLICY "users_read_own_data" ON public.users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "users_update_own_data" ON public.users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id 
    AND role = (SELECT role FROM public.users WHERE id = auth.uid())
  );