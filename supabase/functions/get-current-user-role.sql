-- Function to get the current user's role
CREATE OR REPLACE FUNCTION get_current_user_role()
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Get the role of the currently authenticated user
  SELECT role INTO user_role 
  FROM public.users 
  WHERE id = auth.uid();
  
  -- Return the role or a default
  RETURN COALESCE(user_role, 'anonymous');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
