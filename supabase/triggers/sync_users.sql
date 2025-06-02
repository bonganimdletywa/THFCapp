-- This trigger syncs user data between auth.users and public.users tables

-- Function to handle new user signups
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
DECLARE
  default_role TEXT := 'csi_field_worker';
  user_code TEXT;
BEGIN
  -- Generate a random user code if one doesn't exist
  user_code := SUBSTRING(MD5(NEW.email || CURRENT_TIMESTAMP::TEXT) FOR 6);
  user_code := UPPER(user_code);

  -- Insert a row into public.users
  INSERT INTO public.users (
    id, 
    email, 
    full_name, 
    role, 
    user_code,
    location,
    is_active,
    status,
    created_at,
    updated_at
  ) VALUES (
    NEW.id, 
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
    default_role,
    user_code,
    'Primary Hub',
    TRUE,
    'active',
    NEW.created_at,
    NEW.created_at
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger the function every time a user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to handle user updates
CREATE OR REPLACE FUNCTION public.handle_user_update() 
RETURNS TRIGGER AS $$
BEGIN
  -- Update email in public.users when it changes in auth.users
  UPDATE public.users
  SET 
    email = NEW.email,
    updated_at = CURRENT_TIMESTAMP
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger the function every time a user is updated
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  WHEN (OLD.email IS DISTINCT FROM NEW.email)
  EXECUTE FUNCTION public.handle_user_update();
