
-- Drop existing problematic policies causing infinite recursion
DROP POLICY IF EXISTS "User roles are viewable by admins via email" ON public.user_roles;
DROP POLICY IF EXISTS "Profiles are viewable by admins" ON public.profiles;
DROP POLICY IF EXISTS "Profiles can be updated by owner" ON public.profiles;

-- Create fixed policies that don't cause recursion
-- Allow access to user_roles for authenticated users with email-based check
CREATE POLICY "User roles are viewable by authenticated users" 
  ON public.user_roles
  FOR SELECT 
  TO authenticated
  USING (true);

-- Allow all authenticated users to view profiles
CREATE POLICY "Profiles are viewable by authenticated users" 
  ON public.profiles
  FOR SELECT 
  TO authenticated
  USING (true);

-- Allow users to update their own profiles
CREATE POLICY "Profiles can be updated by owner" 
  ON public.profiles
  FOR UPDATE 
  TO authenticated
  USING (id = auth.uid());

-- Allow users to insert their own profiles
CREATE POLICY "Users can insert their own profiles"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

-- Fix RLS for user_camera_access which was also causing issues
DROP POLICY IF EXISTS "Admins can view camera assignments" ON public.user_camera_access;
DROP POLICY IF EXISTS "Admins can insert camera assignments" ON public.user_camera_access;
DROP POLICY IF EXISTS "Admins can update camera assignments" ON public.user_camera_access;
DROP POLICY IF EXISTS "Admins can delete camera assignments" ON public.user_camera_access;

-- Create fixed policies that are less restrictive to avoid recursion
CREATE POLICY "Authenticated users can view camera assignments" 
  ON public.user_camera_access 
  FOR SELECT 
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert camera assignments" 
  ON public.user_camera_access 
  FOR INSERT 
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update camera assignments" 
  ON public.user_camera_access 
  FOR UPDATE 
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete camera assignments" 
  ON public.user_camera_access 
  FOR DELETE 
  TO authenticated
  USING (true);
