
import { prepareContextMessages } from "./contextService";
import { sendMessage } from "./messageService";
import { RetryOptions } from "../types";

/**
 * Retry the last message that failed
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
  if (!lastSentMessage) {
    console.error("No message to retry");
    return;
  }
  
  console.log("Retrying last message:", lastSentMessage);
  
  const { addUserMessage, addAssistantMessage } = options;
  
  // Create a new user message with the last content
  addUserMessage(lastSentMessage);
  
  // Prepare minimal context for retry
  const contextMessages = prepareContextMessages(
    lastSentMessage, 
    [], // No previous context needed for retry
    user?.subscription_tier
  );
  
  // Send the message again
  await sendMessage(
    lastSentMessage,
    addUserMessage,
    addAssistantMessage,
    errorOptions,
    setLastSentMessage,
    setIsLoading,
    setUsageInfo,
    contextMessages,
    user
  );
}
