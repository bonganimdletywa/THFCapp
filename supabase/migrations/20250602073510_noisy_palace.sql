-- Add test users
INSERT INTO public.users (
  email,
  full_name,
  role,
  status,
  is_active,
  location
) VALUES 
(
  'nkosinathidhilsec@gmail.com',
  'NkosinathiD',
  'csi_field_worker',
  'active',
  true,
  'Primary Hub'
),
(
  'dhilsecb@gmail.com',
  'dhilsecb',
  'csi_field_worker', 
  'active',
  true,
  'Primary Hub'
)
ON CONFLICT (email) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  status = EXCLUDED.status,
  is_active = EXCLUDED.is_active,
  location = EXCLUDED.location,
  updated_at = NOW();

-- Ensure RLS policies are properly set
DROP POLICY IF EXISTS users_read_self ON public.users;
DROP POLICY IF EXISTS admin_read_all ON public.users;

-- Recreate policies with proper access
CREATE POLICY users_read_self ON public.users
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY admin_read_all ON public.users
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'zoho_admin'
    )
  );