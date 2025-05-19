
-- Drop existing problematic policies
DROP POLICY IF EXISTS "Profiles are viewable by owner" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are viewable by admins" ON public.profiles;
DROP POLICY IF EXISTS "Profiles can be updated by owner" ON public.profiles;

-- Create fixed policies for profiles that don't cause recursion
CREATE POLICY "Profiles are viewable by owner" 
  ON public.profiles
  FOR SELECT 
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Profiles are viewable by admin emails" 
  ON public.profiles
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
  );

CREATE POLICY "Profiles can be updated by owner" 
  ON public.profiles
  FOR UPDATE 
  TO authenticated
  USING (id = auth.uid());

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
