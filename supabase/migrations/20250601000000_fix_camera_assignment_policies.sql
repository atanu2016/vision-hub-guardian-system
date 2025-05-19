
-- Fix camera assignment policies to prevent recursion
CREATE OR REPLACE POLICY "Users can view their own camera assignments" 
ON public.user_camera_access
FOR SELECT 
TO authenticated
USING (user_id = auth.uid() OR EXISTS (
  SELECT 1 FROM auth.users
  WHERE auth.users.id = auth.uid() 
  AND (auth.users.email = 'admin@home.local' OR auth.users.email = 'superadmin@home.local')
));

-- Ensure admins can manage camera assignments
CREATE OR REPLACE POLICY "Admins can manage camera assignments" 
ON public.user_camera_access
FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid() 
    AND (
      auth.users.email = 'admin@home.local' OR 
      auth.users.email = 'superadmin@home.local' OR
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true) OR
      EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin'))
    )
  )
);
