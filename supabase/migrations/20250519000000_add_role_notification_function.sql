
-- Function to notify when a role changes
CREATE OR REPLACE FUNCTION public.notify_role_change(user_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  -- This function is just a placeholder that will be called when a role changes
  -- The actual notification happens through the Postgres NOTIFY/LISTEN mechanism
  PERFORM pg_notify('role_changes', json_build_object('user_id', user_id, 'timestamp', now())::text);
  RETURN;
END;
$function$;

-- Update indexes for user_roles to improve performance
CREATE INDEX IF NOT EXISTS user_roles_user_id_idx ON public.user_roles (user_id);
CREATE INDEX IF NOT EXISTS user_roles_role_idx ON public.user_roles (role);

-- Make sure row level security is enabled on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for user_roles if not exists
DO $$
BEGIN
  -- Check if the policy already exists before creating it
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_roles' 
    AND policyname = 'Users can view their own role'
  ) THEN
    -- Create the policy
    CREATE POLICY "Users can view their own role" 
      ON public.user_roles 
      FOR SELECT 
      USING (auth.uid() = user_id);
  END IF;
  
  -- Check if the policy already exists before creating it
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_roles' 
    AND policyname = 'Admins can view all roles'
  ) THEN
    -- Create the policy
    CREATE POLICY "Admins can view all roles" 
      ON public.user_roles 
      FOR SELECT 
      USING (
        EXISTS (
          SELECT 1 FROM user_roles 
          WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin')
        )
      );
  END IF;
  
  -- Check if the policy already exists before creating it
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_roles' 
    AND policyname = 'Superadmins can update roles'
  ) THEN
    -- Create the policy
    CREATE POLICY "Superadmins can update roles" 
      ON public.user_roles 
      FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM user_roles 
          WHERE user_id = auth.uid() AND role = 'superadmin'
        )
      );
  END IF;
END $$;
