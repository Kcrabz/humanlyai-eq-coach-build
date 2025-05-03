
-- Enable Row Level Security on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to view their own profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can view their own profiles'
  ) THEN
    CREATE POLICY "Users can view their own profiles" 
      ON public.profiles 
      FOR SELECT 
      USING (auth.uid() = id);
  END IF;
END
$$;

-- Create policy to allow users to update their own profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can update their own profiles'
  ) THEN
    CREATE POLICY "Users can update their own profiles" 
      ON public.profiles 
      FOR UPDATE 
      USING (auth.uid() = id);
  END IF;
END
$$;

-- Create policy to allow users to insert their own profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can insert their own profiles'
  ) THEN
    CREATE POLICY "Users can insert their own profiles" 
      ON public.profiles 
      FOR INSERT 
      WITH CHECK (auth.uid() = id);
  END IF;
END
$$;

-- Enable Row Level Security on chat_messages table
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to view their own chat messages
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies WHERE tablename = 'chat_messages' AND policyname = 'Users can view their own chat messages'
  ) THEN
    CREATE POLICY "Users can view their own chat messages" 
      ON public.chat_messages 
      FOR SELECT 
      USING (auth.uid() = user_id);
  END IF;
END
$$;

-- Create policy to allow users to insert their own chat messages
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies WHERE tablename = 'chat_messages' AND policyname = 'Users can insert their own chat messages'
  ) THEN
    CREATE POLICY "Users can insert their own chat messages" 
      ON public.chat_messages 
      FOR INSERT 
      WITH CHECK (auth.uid() = user_id);
  END IF;
END
$$;

-- Enable Row Level Security on usage_logs table
ALTER TABLE public.usage_logs ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to view their own usage logs
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies WHERE tablename = 'usage_logs' AND policyname = 'Users can view their own usage logs'
  ) THEN
    CREATE POLICY "Users can view their own usage logs" 
      ON public.usage_logs 
      FOR SELECT 
      USING (auth.uid() = user_id);
  END IF;
END
$$;

-- Create policy to allow users to insert/update their own usage logs
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies WHERE tablename = 'usage_logs' AND policyname = 'Users can update their own usage logs'
  ) THEN
    CREATE POLICY "Users can update their own usage logs" 
      ON public.usage_logs 
      FOR UPDATE 
      USING (auth.uid() = user_id);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies WHERE tablename = 'usage_logs' AND policyname = 'Users can insert their own usage logs'
  ) THEN
    CREATE POLICY "Users can insert their own usage logs" 
      ON public.usage_logs 
      FOR INSERT 
      WITH CHECK (auth.uid() = user_id);
  END IF;
END
$$;
