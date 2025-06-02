-- This migration adds the location column to the users table
-- and updates the role type constraint

-- Step 1: Add location column to users table with default value
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS location TEXT NOT NULL DEFAULT 'Primary Hub';

-- Step 2: Update existing role enum type or create a new one
-- First, check if we need to drop the existing constraint
DO $$
BEGIN
    -- Drop specific constraint if it exists
    IF EXISTS (
        SELECT 1 
        FROM pg_constraint 
        WHERE conname = 'users_role_check' 
        AND conrelid = 'users'::regclass::oid
    ) THEN
        EXECUTE 'ALTER TABLE users DROP CONSTRAINT users_role_check';
    END IF;
END $$;

-- Step 3: Add the new constraint for roles
ALTER TABLE users
ADD CONSTRAINT users_role_check
CHECK (role IN (
  'production_operator', 
  'dispatch_coordinator', 
  'csi_field_worker', 
  'thfc_production_operator', 
  'zoho_admin'
));

-- Step 4: Update existing users to have valid roles
-- This converts any 'field_worker' to 'csi_field_worker' and 'admin' to 'zoho_admin'
UPDATE users 
SET role = 'csi_field_worker' 
WHERE role = 'field_worker';

UPDATE users 
SET role = 'zoho_admin' 
WHERE role = 'admin';

-- Step 5: Create function to update user timestamps
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 6: Add trigger for automatically updating timestamps
DROP TRIGGER IF EXISTS update_users_timestamp ON users;

CREATE TRIGGER update_users_timestamp
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- Step 7: Add RLS (Row Level Security) policies for the users table
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policy for user's own data (they can read their own data)
DROP POLICY IF EXISTS users_self_access ON users;

CREATE POLICY users_self_access
ON users
FOR SELECT
USING (auth.uid() = id);

-- Create policy for admins (zoho_admin role can access all rows)
DROP POLICY IF EXISTS admin_access ON users;

CREATE POLICY admin_access
ON users
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'zoho_admin'
  )
);
