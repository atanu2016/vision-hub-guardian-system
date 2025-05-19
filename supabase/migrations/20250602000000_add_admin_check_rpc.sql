
-- Add a more efficient RPC function for checking admin status
CREATE OR REPLACE FUNCTION public.is_admin_bypass_rls()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- Check special email directly without using profiles table
  IF EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND (
      email = 'admin@home.local' OR
      email = 'superadmin@home.local'
    )
  ) THEN
    RETURN true;
  END IF;

  -- Check is_admin flag in profiles
  IF EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND is_admin = true
  ) THEN
    RETURN true;
  END IF;

  -- Check roles table for admin/superadmin role
  IF EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'superadmin')
  ) THEN
    RETURN true;
  END IF;

  RETURN false;
END;
$function$;
