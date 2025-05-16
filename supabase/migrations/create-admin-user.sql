
-- Create admin user and set admin flag
-- This is for demonstration purposes only. In a production environment, use a more secure method.

-- Create admin user role entry first to ensure the role exists
INSERT INTO public.user_roles (user_id, role)
VALUES ('00000000-0000-0000-0000-000000000000', 'superadmin')
ON CONFLICT (user_id) DO NOTHING;

-- Update the user profile with admin flag
UPDATE public.profiles
SET is_admin = true,
    mfa_required = false
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'admin@example.com'
);

-- Ensure the profile exists for admin user
INSERT INTO public.profiles (id, full_name, is_admin, mfa_required)
SELECT id, 'Administrator', true, false
FROM auth.users 
WHERE email = 'admin@example.com'
ON CONFLICT (id) DO UPDATE SET is_admin = true, mfa_required = false;

-- Add comment to explain that admin user creation should be done via Supabase dashboard
COMMENT ON TABLE public.profiles IS 'User profiles with admin flags';
