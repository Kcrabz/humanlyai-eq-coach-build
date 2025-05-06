
-- Enable Row Level Security on admin_users table
ALTER TABLE IF EXISTS public.admin_users ENABLE ROW LEVEL SECURITY;

-- Only admin users can view the admin_users table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies WHERE tablename = 'admin_users' AND policyname = 'Admin users can view admin_users table'
  ) THEN
    CREATE POLICY "Admin users can view admin_users table" 
      ON public.admin_users 
      FOR SELECT 
      USING (
        EXISTS (
          SELECT 1 FROM public.admin_users 
          WHERE email = (
            SELECT email FROM auth.users 
            WHERE id = auth.uid()
          )
        )
      );
  END IF;
END
$$;

-- Only admin users can modify the admin_users table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies WHERE tablename = 'admin_users' AND policyname = 'Admin users can modify admin_users table'
  ) THEN
    CREATE POLICY "Admin users can modify admin_users table" 
      ON public.admin_users 
      FOR ALL 
      USING (
        EXISTS (
          SELECT 1 FROM public.admin_users 
          WHERE email = (
            SELECT email FROM auth.users 
            WHERE id = auth.uid()
          )
        )
      );
  END IF;
END
$$;

-- Function to optimize 'is_admin' check to avoid recursive calls
CREATE OR REPLACE FUNCTION public.is_admin()
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  user_email text;
  is_admin_user boolean;
BEGIN
  -- Get current user's email directly
  SELECT email INTO user_email 
  FROM auth.users
  WHERE id = auth.uid();
  
  -- Check if the email exists in admin_users
  SELECT EXISTS (
    SELECT 1 
    FROM public.admin_users
    WHERE email = user_email
  ) INTO is_admin_user;
  
  RETURN is_admin_user;
END;
$function$;

-- Create an index to optimize the admin lookup
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'admin_users' AND indexname = 'admin_users_email_idx'
  ) THEN
    CREATE INDEX IF NOT EXISTS admin_users_email_idx ON public.admin_users (email);
  END IF;
END
$$;
