
-- Create a function to update user profile securely
CREATE OR REPLACE FUNCTION public.update_user_profile(user_id uuid, full_name_param text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- Update the profile of the specified user
  UPDATE public.profiles
  SET 
    full_name = full_name_param,
    updated_at = now()
  WHERE id = user_id;
  
  -- Return nothing (void)
  RETURN;
END;
$function$;

-- Create a SQL function that can be used by the frontend
COMMENT ON FUNCTION public.update_user_profile IS 'Updates a user profile with the given parameters';
