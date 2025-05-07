
-- Create a function to safely record user logins from the client side
CREATE OR REPLACE FUNCTION public.record_user_login(user_id_param UUID, user_agent_param TEXT DEFAULT NULL)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert the login record
  INSERT INTO public.user_login_history (user_id, user_agent)
  VALUES (user_id_param, user_agent_param);
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.record_user_login TO authenticated;
