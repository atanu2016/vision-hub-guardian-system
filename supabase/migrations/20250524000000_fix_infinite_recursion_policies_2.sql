
-- Drop existing problematic policies causing infinite recursion
DROP POLICY IF EXISTS "User roles are viewable by admins" ON public.user_roles;

-- Create updated policy that checks email directly to avoid recursion
CREATE POLICY "User roles are viewable by admins via email" 
  ON public.user_roles
  FOR SELECT 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid() 
      AND (
        auth.users.email = 'admin@home.local' OR
        auth.users.email = 'superadmin@home.local'
      )
    )
    OR
    -- Check role via is_admin function which doesn't cause recursion
    public.is_admin()
  );

-- Make sure admin checking function exists (create if not exists)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER -- Critical for bypassing RLS
AS $$
BEGIN
  RETURN (
    SELECT EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND (
        auth.users.email = 'admin@home.local' OR 
        auth.users.email = 'superadmin@home.local' OR
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
      )
    )
  );
END;
$$;

-- Create a helper function for easier role checking
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid DEFAULT auth.uid())
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_email text;
  user_role text;
BEGIN
  -- Get user email first
  SELECT email INTO user_email FROM auth.users WHERE id = user_id;

  -- Special case for built-in admin accounts
  IF user_email = 'admin@home.local' OR user_email = 'superadmin@home.local' THEN
    RETURN 'superadmin';
  END IF;

  -- Check for roles in user_roles table
  SELECT role::text INTO user_role 
  FROM public.user_roles 
  WHERE user_roles.user_id = user_id
  LIMIT 1;

  -- Default to 'user' if no role found
  RETURN COALESCE(user_role, 'user');
END;
$$;

-- Create a view for camera assignments to simplify queries
CREATE OR REPLACE VIEW public.user_camera_assignments AS
SELECT
  users.id as user_id,
  users.email as user_email,
  COALESCE(public.get_user_role(users.id), 'user') as role,
  cameras.id as camera_id,
  cameras.name as camera_name,
  cameras.location as camera_location
FROM auth.users
LEFT JOIN public.cameras ON true
WHERE 
  -- Admins see all cameras
  COALESCE(public.get_user_role(users.id), 'user') IN ('admin', 'superadmin')
  OR
  -- Others see assigned cameras (implement camera assignments table later)
  EXISTS (
    SELECT 1 FROM public.camera_assignments 
    WHERE camera_assignments.user_id = users.id
    AND camera_assignments.camera_id = cameras.id
  );

-- Grant access to the view
ALTER VIEW public.user_camera_assignments OWNER TO postgres;
GRANT SELECT ON public.user_camera_assignments TO authenticated;
GRANT SELECT ON public.user_camera_assignments TO service_role;
