
-- Function to check if a table exists in the schema
CREATE OR REPLACE FUNCTION public.check_table_exists(table_name text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  table_exists boolean;
BEGIN
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public'
    AND table_name = $1
  ) INTO table_exists;
  
  RETURN table_exists;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.check_table_exists(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_table_exists(text) TO anon;
GRANT EXECUTE ON FUNCTION public.check_table_exists(text) TO service_role;
