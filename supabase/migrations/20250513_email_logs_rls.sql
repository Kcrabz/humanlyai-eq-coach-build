
-- Create RLS policy to allow edge functions to insert into email_logs
CREATE POLICY "Enable insert for service role" 
ON public.email_logs 
FOR INSERT 
TO service_role 
USING (true);

-- Create RLS policy to allow admins to view all email logs
CREATE POLICY "Allow admins to view all email logs"
ON public.email_logs
FOR SELECT
USING (
  (SELECT EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE email = (
      SELECT email FROM auth.users
      WHERE id = auth.uid()
    )
  ))
);

-- Enable RLS on email_logs if not already enabled
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;
