
-- Fix infinite recursion issues in user_roles policies
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
CREATE POLICY "Admins can view all roles" 
  ON public.user_roles 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid() AND auth.users.id IN (
        SELECT user_id FROM public.user_roles 
        WHERE role IN ('admin', 'superadmin')
      )
    )
  );

-- Create a more efficient is_observer function
CREATE OR REPLACE FUNCTION public.is_observer()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  role_value text;
BEGIN
  SELECT role::text INTO role_value 
  FROM public.user_roles 
  WHERE user_id = auth.uid();
  
  RETURN role_value = 'observer';
END;
$$;
