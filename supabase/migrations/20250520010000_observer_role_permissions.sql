
-- Ensure that the user_role enum type has the observer role
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type
    JOIN pg_namespace ON pg_namespace.oid = pg_type.typnamespace
    WHERE pg_type.typname = 'user_role'
    AND pg_namespace.nspname = 'public'
  ) THEN
    -- Create the enum if it doesn't exist
    CREATE TYPE public.user_role AS ENUM ('user', 'admin', 'superadmin', 'observer');
  ELSE
    -- Add the value if the enum exists but doesn't have 'observer'
    BEGIN
      ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'observer';
    EXCEPTION WHEN duplicate_object THEN
      -- Value already exists, do nothing
    END;
  END IF;
END$$;

-- Create a function to check observer status
CREATE OR REPLACE FUNCTION public.is_observer()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'observer'
  );
END;
$$;

-- Update permissions on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_roles' AND policyname = 'Users can view their own role'
  ) THEN
    CREATE POLICY "Users can view their own role" 
      ON public.user_roles 
      FOR SELECT 
      USING (auth.uid() = user_id);
  END IF;

  -- Create or replace other policies
  DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
  CREATE POLICY "Admins can view all roles" 
    ON public.user_roles 
    FOR SELECT 
    USING (
      EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin')
      )
    );

  DROP POLICY IF EXISTS "Superadmins can insert roles" ON public.user_roles;
  CREATE POLICY "Superadmins can insert roles" 
    ON public.user_roles 
    FOR INSERT 
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() AND role = 'superadmin'
      )
    );

  DROP POLICY IF EXISTS "Superadmins can update roles" ON public.user_roles;
  CREATE POLICY "Superadmins can update roles" 
    ON public.user_roles 
    FOR UPDATE
    USING (
      EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() AND role = 'superadmin'
      )
    );

  DROP POLICY IF EXISTS "Superadmins can delete roles" ON public.user_roles;
  CREATE POLICY "Superadmins can delete roles" 
    ON public.user_roles 
    FOR DELETE
    USING (
      EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() AND role = 'superadmin'
      )
    );
END $$;

-- Add indexes to improve performance
CREATE INDEX IF NOT EXISTS user_roles_user_id_idx ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS user_roles_role_idx ON public.user_roles(role);

-- Make sure we have a unique constraint on user_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_roles_user_id_key'
  ) THEN
    ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_user_id_key UNIQUE (user_id);
  END IF;
END $$;
