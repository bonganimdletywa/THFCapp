-- Drop existing migrations to start fresh
DROP EXTENSION IF EXISTS "uuid-ossp" CASCADE;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist
DROP TABLE IF EXISTS users CASCADE;

-- Create users table with search_path explicitly set
SET search_path TO public;

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(255) NOT NULL,
  role TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  is_active BOOLEAN NOT NULL DEFAULT true,
  location TEXT NOT NULL DEFAULT 'Primary Hub',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login_at TIMESTAMPTZ,
  CONSTRAINT users_role_check CHECK (
    role IN (
      'production_operator',
      'dispatch_coordinator',
      'csi_field_worker',
      'thfc_production_operator',
      'zoho_admin'
    )
  ),
  CONSTRAINT users_status_check CHECK (
    status IN ('active', 'inactive')
  )
);

-- Create timestamp update function with explicit search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for updating timestamp
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS
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

-- Create simplified RLS policies with explicit schema references
CREATE POLICY users_self_access ON public.users
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY admin_access ON public.users
  FOR ALL TO authenticated
  USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'zoho_admin')
  WITH CHECK ((SELECT role FROM public.users WHERE id = auth.uid()) = 'zoho_admin');

CREATE POLICY users_update_self ON public.users
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND
    role = (SELECT role FROM public.users WHERE id = auth.uid()) AND
    id = (SELECT id FROM public.users WHERE id = auth.uid())
  );

-- Create function to get current user's role with explicit search_path
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
BEGIN
  RETURN (SELECT role FROM public.users WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;