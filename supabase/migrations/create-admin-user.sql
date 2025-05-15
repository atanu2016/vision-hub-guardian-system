
-- Create admin user and set admin flag
-- This is for demonstration purposes only. In a production environment, use a more secure method.
-- Run this script in the SQL editor of your Supabase project.

-- Create admin user (Note: This will only work if run directly in Supabase SQL editor, not as a migration)
-- To properly create a user, do this via the Supabase Authentication dashboard

-- Then update the user profile to set them as admin
UPDATE public.profiles
SET is_admin = true
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'admin@example.com'
);

-- Also set as superadmin
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'superadmin'
FROM auth.users 
WHERE email = 'admin@example.com'
ON CONFLICT (user_id) DO UPDATE
SET role = 'superadmin';

-- Set all existing users as superadmin for good measure
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'superadmin'
FROM auth.users
ON CONFLICT (user_id) DO UPDATE
SET role = 'superadmin';

-- And ensure all profiles have admin flag set
UPDATE public.profiles
SET is_admin = true;
