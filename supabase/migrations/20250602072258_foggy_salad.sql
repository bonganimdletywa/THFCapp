-- Drop existing migrations to start fresh
DROP EXTENSION IF EXISTS "uuid-ossp" CASCADE;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist
DROP TABLE IF EXISTS users CASCADE;

-- Create users table
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

-- Create timestamp update function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating timestamp
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS users_self_access ON users;
DROP POLICY IF EXISTS admin_access ON users;
DROP POLICY IF EXISTS users_read_self ON users;
DROP POLICY IF EXISTS admin_read_all ON users;
DROP POLICY IF EXISTS admin_insert ON users;
DROP POLICY IF EXISTS admin_update ON users;
DROP POLICY IF EXISTS users_update_self ON users;
DROP POLICY IF EXISTS admin_update_all ON users;

-- Create simplified RLS policies
-- Allow users to read their own data
CREATE POLICY users_self_access ON users
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

-- Allow admins full access
CREATE POLICY admin_access ON users
  FOR ALL TO authenticated
  USING ((SELECT role FROM users WHERE id = auth.uid()) = 'zoho_admin')
  WITH CHECK ((SELECT role FROM users WHERE id = auth.uid()) = 'zoho_admin');

-- Allow users to update their own basic info
CREATE POLICY users_update_self ON users
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND
    role = (SELECT role FROM users WHERE id = auth.uid()) AND
    id = (SELECT id FROM users WHERE id = auth.uid())
  );

-- Create function to get current user's role
CREATE OR REPLACE FUNCTION get_current_user_role()
RETURNS TEXT AS $$
BEGIN
  RETURN (SELECT role FROM users WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;