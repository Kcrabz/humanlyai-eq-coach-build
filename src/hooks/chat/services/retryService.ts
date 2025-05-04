
import { handleApiErrors } from "@/utils/chatErrorHandler";
import { sendMessageStream } from "./streamService";
import { RetryOptions } from "../types";
import { supabase } from "@/integrations/supabase/client";

/**
 * Retry the last message that was sent
 */
export async function retryLastMessage(
  lastSentMessage: string | null,
  options: RetryOptions,
  user: any,
  errorOptions: {
    navigate: ReturnType<typeof import("react-router-dom").useNavigate>;
    setError: (error: string | null) => void;
  },
  setLastSentMessage: (content: string | null) => void,
  setIsLoading: (loading: boolean) => void,
  setUsageInfo: (info: any) => void
) {
  if (!lastSentMessage) return;
  
  errorOptions.setError(null);
  // Use streaming for retries
  const userMessageId = options.addUserMessage(lastSentMessage);
  const assistantMessageId = options.addAssistantMessage("");
  
  await sendMessageStream(
    {
      content: lastSentMessage,
      userMessageId,
      assistantMessageId,
      updateAssistantMessage: options.updateAssistantMessage
    },
    user,
    errorOptions,
    setLastSentMessage,
    setIsLoading,
    setUsageInfo
  );
}
