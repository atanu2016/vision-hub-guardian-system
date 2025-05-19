
-- Fix the infinite recursion in profiles table RLS policies
-- First, drop all existing policies on profiles table to start clean
DROP POLICY IF EXISTS "Profiles are viewable by admins" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are viewable by owner" ON public.profiles;
DROP POLICY IF EXISTS "All authenticated users can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profiles" ON public.profiles;

-- Create a truly recursion-free policy using a security definer function
CREATE OR REPLACE FUNCTION public.check_if_user_is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN (
    -- Check email directly from auth.users (bypassing profiles)
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND (
        auth.users.email = 'admin@home.local' OR
        auth.users.email = 'superadmin@home.local'
      )
    )
    OR
    -- Check role directly (also bypassing profiles)
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'superadmin')
    )
  );
END;
$$;

-- Now create clean policies that won't cause recursion
-- Allow all authenticated users to view profiles
CREATE POLICY "Profiles viewable by all authenticated users" 
  ON public.profiles
  FOR SELECT 
  TO authenticated
  USING (true);

-- Allow users to update only their own profile
CREATE POLICY "Users can update their own profiles" 
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid());

-- Allow users to insert their own profile only
CREATE POLICY "Users can insert their own profiles"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());
