
-- Enable Row Level Security on the achievements table
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

-- We keep the existing policy "Users can view all achievements" which is already defined
