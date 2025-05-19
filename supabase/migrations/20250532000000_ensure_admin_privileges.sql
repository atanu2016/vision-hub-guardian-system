
-- Ensure admin@home.local has superadmin role and proper profile settings

-- First make sure the user_roles table has the correct constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_roles_user_id_key'
  ) THEN
    ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_user_id_key UNIQUE (user_id);
  END IF;
END $$;

-- Create superadmin role entry for admin@home.local
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'superadmin' 
FROM auth.users 
WHERE email = 'admin@home.local'
ON CONFLICT (user_id) DO UPDATE SET role = 'superadmin';

-- Update the profile with admin flag for admin@home.local
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

-- Add a function to automatically restore admin privileges
CREATE OR REPLACE FUNCTION public.ensure_admin_privileges()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- If this is the admin email, ensure it has superadmin role
  IF NEW.email = 'admin@home.local' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'superadmin')
    ON CONFLICT (user_id) DO UPDATE SET role = 'superadmin';
    
    -- Also ensure the profile exists with admin flag
    INSERT INTO public.profiles (id, full_name, is_admin)
    VALUES (NEW.id, 'Administrator', true)
    ON CONFLICT (id) DO UPDATE SET is_admin = true;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Create a trigger to run this function whenever a user is created or updated
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'ensure_admin_privileges_trigger'
  ) THEN
    CREATE TRIGGER ensure_admin_privileges_trigger
    AFTER INSERT OR UPDATE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.ensure_admin_privileges();
  END IF;
END $$;
