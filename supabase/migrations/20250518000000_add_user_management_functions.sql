
-- Function to check if user has a specific role securely
CREATE OR REPLACE FUNCTION public.get_all_users()
RETURNS SETOF json
SECURITY DEFINER
AS $$
DECLARE
  is_admin BOOLEAN;
  requesting_user_id UUID;
BEGIN
  -- Get the ID of the user making the request
  requesting_user_id := auth.uid();

  -- Check if requesting user is an admin
  SELECT EXISTS (
    SELECT 1 
    FROM user_roles 
    WHERE user_id = requesting_user_id 
    AND role IN ('admin', 'superadmin')
  ) INTO is_admin;
  
  -- If not in user_roles, check profiles
  IF NOT is_admin THEN
    SELECT is_admin INTO is_admin 
    FROM profiles
    WHERE id = requesting_user_id;
  END IF;
  
  -- If still not admin, raise exception
  IF NOT is_admin THEN
    RAISE EXCEPTION 'Permission denied: User % is not an admin', requesting_user_id;
  END IF;
  
  -- Return user data to admins
  RETURN QUERY
  WITH user_data AS (
    SELECT 
      p.id,
      p.full_name,
      p.mfa_enrolled,
      p.mfa_required,
      p.created_at,
      p.is_admin,
      COALESCE(ur.role, 'user'::user_role) as role
    FROM
      profiles p
    LEFT JOIN
      user_roles ur ON p.id = ur.user_id
  )
  
  SELECT 
    row_to_json(ud.*)
  FROM 
    user_data ud;
END;
$$ LANGUAGE plpgsql;
