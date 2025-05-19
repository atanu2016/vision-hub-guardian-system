
-- Re-create the optimized database function for camera assignments
DROP FUNCTION IF EXISTS public.assign_cameras_transaction;

CREATE OR REPLACE FUNCTION public.assign_cameras_transaction(p_user_id UUID, p_camera_ids UUID[])
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- Delete existing assignments in a single query
  DELETE FROM public.user_camera_access 
  WHERE user_id = p_user_id;
  
  -- Only insert new assignments if we have camera IDs and the array is not empty
  IF p_camera_ids IS NOT NULL AND array_length(p_camera_ids, 1) > 0 THEN
    -- Insert all new assignments in a single query using unnest for maximum performance
    INSERT INTO public.user_camera_access (user_id, camera_id, created_at)
    SELECT 
      p_user_id,
      camera_id,
      now()
    FROM 
      unnest(p_camera_ids) AS camera_id;
  END IF;
END;
$function$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.assign_cameras_transaction TO authenticated;

-- Add an RPC function to check if a session is still valid
CREATE OR REPLACE FUNCTION public.check_session_valid()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- This function simply returns true if called with a valid auth token
  -- We use this as a quick way to verify a session is still valid
  RETURN auth.uid() IS NOT NULL;
END;
$function$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.check_session_valid TO authenticated;
