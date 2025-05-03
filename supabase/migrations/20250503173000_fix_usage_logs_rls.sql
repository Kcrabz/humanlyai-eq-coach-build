
-- Fix usage_logs RLS policies - ensure both service role and regular users can interact with them

DO $$
BEGIN
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Users can insert their own usage logs" ON public.usage_logs;
  DROP POLICY IF EXISTS "Users can update their own usage logs" ON public.usage_logs;
  
  -- Create policy for INSERT that allows both authenticated users and service role
  CREATE POLICY "Users can insert their own usage logs" 
    ON public.usage_logs 
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'service_role');
  
  -- Create policy for UPDATE that allows both authenticated users and service role
  CREATE POLICY "Users can update their own usage logs" 
    ON public.usage_logs 
    FOR UPDATE 
    USING (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'service_role');
END
$$;
