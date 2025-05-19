
-- Create a function to update profile safely
CREATE OR REPLACE FUNCTION public.update_profile(
  user_id UUID,
  full_name_param TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.profiles 
  SET 
    full_name = full_name_param,
    updated_at = NOW()
  WHERE id = user_id;
  
  -- Return true if a row was affected (updated), or false otherwise
  RETURN FOUND;
END;
$$;

-- Create a function to get user role safely
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid DEFAULT auth.uid())
RETURNS user_role
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  role_val user_role;
  user_email text;
BEGIN
  -- First check if user is a special admin account
  SELECT email INTO user_email FROM auth.users WHERE id = _user_id;
  
  IF user_email IN ('admin@home.local', 'superadmin@home.local') THEN
    RETURN 'superadmin'::user_role;
  END IF;
  
  -- If not special account, check user_roles table
  SELECT role INTO role_val FROM public.user_roles WHERE user_id = _user_id;
  RETURN COALESCE(role_val, 'user'::user_role);
END;
$$;
