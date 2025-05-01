
-- Create user_api_keys table
CREATE TABLE public.user_api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  openai_api_key TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_api_keys ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to view their own API keys
CREATE POLICY "Users can view their own API keys" 
  ON public.user_api_keys 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own API keys
CREATE POLICY "Users can insert their own API keys" 
  ON public.user_api_keys 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to update their own API keys
CREATE POLICY "Users can update their own API keys" 
  ON public.user_api_keys 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create policy to allow users to delete their own API keys
CREATE POLICY "Users can delete their own API keys" 
  ON public.user_api_keys 
  FOR DELETE 
  USING (auth.uid() = user_id);
