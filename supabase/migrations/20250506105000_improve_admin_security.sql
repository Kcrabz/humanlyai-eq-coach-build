
-- Create a more efficient admin check function to avoid recursive policy issues
CREATE OR REPLACE FUNCTION public.is_admin_user(user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 SECURITY DEFINER
AS $function$
  SELECT EXISTS (
    SELECT 1 
    FROM public.admin_users a
    JOIN auth.users u ON u.email = a.email
    WHERE u.id = user_id
  );
$function$;

-- Update the is_admin function to use the new approach
CREATE OR REPLACE FUNCTION public.is_admin()
 RETURNS boolean
 LANGUAGE sql
 SECURITY DEFINER
AS $function$
  SELECT public.is_admin_user(auth.uid());
$function$;
