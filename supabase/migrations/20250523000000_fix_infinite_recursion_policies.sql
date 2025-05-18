
-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view their own role" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view own profiles" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Create fixed policies for profiles
CREATE POLICY "Profiles are viewable by owner" 
  ON public.profiles
  FOR SELECT 
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Profiles are viewable by admins" 
  ON public.profiles
  FOR SELECT 
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid() 
    AND (
      auth.users.id IN (SELECT user_id FROM public.user_roles WHERE role IN ('admin', 'superadmin'))
      OR auth.users.email = 'admin@home.local'
    )
  ));

CREATE POLICY "Profiles can be updated by owner" 
  ON public.profiles
  FOR UPDATE 
  TO authenticated
  USING (id = auth.uid());

-- Create fixed policies for user_roles that don't cause recursion
CREATE POLICY "User roles are viewable by self" 
  ON public.user_roles
  FOR SELECT 
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "User roles are viewable by admins" 
  ON public.user_roles
  FOR SELECT 
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid() 
    AND auth.users.email = 'admin@home.local'
  ));

-- Bypass function for admin rights without using RLS
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN (
    SELECT EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND (
        auth.users.email = 'admin@home.local' OR
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
      )
    )
  );
END;
$$;
