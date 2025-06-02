-- Drop and recreate RLS policies with proper access
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS users_self_access ON public.users;
DROP POLICY IF EXISTS admin_access ON public.users;
DROP POLICY IF EXISTS users_read_self ON public.users;
DROP POLICY IF EXISTS admin_read_all ON public.users;
DROP POLICY IF EXISTS admin_insert ON public.users;
DROP POLICY IF EXISTS admin_update ON public.users;
DROP POLICY IF EXISTS users_update_self ON public.users;
DROP POLICY IF EXISTS admin_update_all ON public.users;

-- Create new policies
-- Allow all authenticated users to read their own data
CREATE POLICY users_read_self ON public.users
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

-- Allow zoho_admin to read all users
CREATE POLICY admin_read_all ON public.users
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'zoho_admin'
    )
  );

-- Allow zoho_admin to insert new users
CREATE POLICY admin_insert ON public.users
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'zoho_admin'
    )
  );

-- Allow zoho_admin to update any user
CREATE POLICY admin_update_all ON public.users
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'zoho_admin'
    )
  );

-- Insert test admin user if not exists
INSERT INTO public.users (
  email,
  full_name,
  role,
  status,
  is_active,
  location
) VALUES (
  'admin@example.com',
  'Admin User',
  'zoho_admin',
  'active',
  true,
  'Primary Hub'
) ON CONFLICT (email) DO NOTHING;