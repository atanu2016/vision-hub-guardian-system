
-- Add an optimized database function for camera assignments that runs as a single transaction
CREATE OR REPLACE FUNCTION public.assign_cameras_transaction(p_user_id UUID, p_camera_ids UUID[])
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- Delete existing assignments in a single query
  DELETE FROM public.user_camera_access 
  WHERE user_id = p_user_id;
  
  -- Only insert new assignments if we have camera IDs
  IF array_length(p_camera_ids, 1) > 0 THEN
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
