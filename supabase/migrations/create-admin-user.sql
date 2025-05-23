
-- Create admin user and set admin flag
-- This is for demonstration purposes only. In a production environment, use a more secure method.

-- Create a superadmin role entry for the admin user
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'superadmin' 
FROM auth.users 
WHERE email = 'admin@home.local'
ON CONFLICT (user_id) DO UPDATE SET role = 'superadmin';

-- Update the user profile with admin flag for admin@home.local
UPDATE public.profiles
SET is_admin = true,
    mfa_required = false
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'admin@home.local'
);

-- Ensure the profile exists for admin user with admin flag set
INSERT INTO public.profiles (id, full_name, is_admin, mfa_required)
SELECT id, 'Administrator', true, false
FROM auth.users 
WHERE email = 'admin@home.local'
ON CONFLICT (id) DO UPDATE SET is_admin = true, mfa_required = false;

-- Make sure the first user created is a superadmin (workaround for migration tools access)
UPDATE public.profiles
SET is_admin = true
WHERE id IN (
  SELECT id FROM auth.users ORDER BY created_at ASC LIMIT 1
);

-- Add superadmin role for all users with admin flag
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'superadmin'
FROM public.profiles
WHERE is_admin = true
ON CONFLICT (user_id) DO UPDATE SET role = 'superadmin';

-- Add comment to explain admin user creation should be done via Supabase dashboard
COMMENT ON TABLE public.profiles IS 'User profiles with admin flags';
