
-- Create a SQL function that will safely return the user's role without triggering RLS recursion
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid DEFAULT auth.uid())
RETURNS user_role
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  user_role_val user_role;
BEGIN
  SELECT role INTO user_role_val FROM public.user_roles WHERE user_id = _user_id;
  RETURN COALESCE(user_role_val, 'user'::user_role);
END;
$function$;

-- Function to check if current user is admin (avoids recursion)
CREATE OR REPLACE FUNCTION public.check_admin_status(user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  admin_status BOOLEAN;
  admin_role_exists BOOLEAN;
BEGIN
  -- Check if user has admin flag in profiles
  SELECT is_admin INTO admin_status 
  FROM public.profiles 
  WHERE id = user_id;
  
  -- Check if user has admin or superadmin role
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = user_id
    AND role IN ('admin', 'superadmin')
  ) INTO admin_role_exists;
  
  RETURN COALESCE(admin_status, false) OR COALESCE(admin_role_exists, false);
END;
$function$;

-- Create is_observer function to check if a user has observer role
CREATE OR REPLACE FUNCTION public.is_observer(user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  role_value text;
BEGIN
  SELECT role::text INTO role_value 
  FROM public.user_roles 
  WHERE user_id = user_id;
  
  RETURN role_value = 'observer';
END;
$function$;
