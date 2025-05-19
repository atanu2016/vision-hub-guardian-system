
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can view camera assignments" ON public.user_camera_access;
DROP POLICY IF EXISTS "Admins can insert camera assignments" ON public.user_camera_access;
DROP POLICY IF EXISTS "Admins can update camera assignments" ON public.user_camera_access;
DROP POLICY IF EXISTS "Admins can delete camera assignments" ON public.user_camera_access;

-- Create policy that allows admin users to select user camera assignments
CREATE POLICY "Admins can view camera assignments" 
  ON public.user_camera_access 
  FOR SELECT 
  TO authenticated
  USING (
    -- Check if user is admin using the function without recursion
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid() 
      AND (
        auth.users.email = 'admin@home.local' OR
        auth.users.email = 'superadmin@home.local'
      )
    )
    OR
    public.is_admin() = true
    OR
    public.get_user_role() IN ('admin', 'superadmin')
  );

-- Create policy that allows admins to insert camera assignments
CREATE POLICY "Admins can insert camera assignments" 
  ON public.user_camera_access 
  FOR INSERT 
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid() 
      AND (
        auth.users.email = 'admin@home.local' OR
        auth.users.email = 'superadmin@home.local'
      )
    )
    OR
    public.is_admin() = true
    OR
    public.get_user_role() IN ('admin', 'superadmin')
  );

-- Create policy that allows admins to update camera assignments
CREATE POLICY "Admins can update camera assignments" 
  ON public.user_camera_access 
  FOR UPDATE 
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
    public.is_admin() = true
    OR
    public.get_user_role() IN ('admin', 'superadmin')
  );

-- Create policy that allows admins to delete camera assignments
CREATE POLICY "Admins can delete camera assignments" 
  ON public.user_camera_access 
  FOR DELETE 
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
    public.is_admin() = true
    OR
    public.get_user_role() IN ('admin', 'superadmin')
  );

-- Enable RLS
ALTER TABLE public.user_camera_access ENABLE ROW LEVEL SECURITY;

-- Ensure the table exists and has proper structure
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_camera_access_id_seq') THEN
    CREATE SEQUENCE IF NOT EXISTS user_camera_access_id_seq;
  END IF;
END $$;
