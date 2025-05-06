
-- Add created_at index to optimize queries on the chat_messages table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'chat_messages' AND indexname = 'chat_messages_created_at_idx'
  ) THEN
    CREATE INDEX IF NOT EXISTS chat_messages_created_at_idx ON public.chat_messages (created_at);
  END IF;
END
$$;

-- Add user_id index to optimize queries on the chat_messages table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'chat_messages' AND indexname = 'chat_messages_user_id_idx'
  ) THEN
    CREATE INDEX IF NOT EXISTS chat_messages_user_id_idx ON public.chat_messages (user_id);
  END IF;
END
$$;

-- Add composite index on user_id and created_at
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'chat_messages' AND indexname = 'chat_messages_user_id_created_at_idx'
  ) THEN
    CREATE INDEX IF NOT EXISTS chat_messages_user_id_created_at_idx ON public.chat_messages (user_id, created_at);
  END IF;
END
$$;
