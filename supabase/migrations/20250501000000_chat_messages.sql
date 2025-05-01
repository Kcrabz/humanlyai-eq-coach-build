
-- Create chat messages table
CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to view their own messages
CREATE POLICY "Users can view their own messages" 
  ON public.chat_messages 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own messages
CREATE POLICY "Users can insert their own messages" 
  ON public.chat_messages 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);
