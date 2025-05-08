
import { prepareContextMessages } from "./services/contextService";
import { sendMessage as sendMessageService } from "./services/messageService";
import { sendMessageStream as sendMessageStreamService } from "./services/streamService";
import { retryLastMessage as retryLastMessageService } from "./services/retryService";
import { SendMessageOptions, RetryOptions } from "./types";

/**
 * Send a regular message with non-streaming response
 */
export async function sendMessage(
  content: string,
  addUserMessage: (message: string) => string,
  addAssistantMessage: (message: string) => string,
  errorOptions: {
    navigate: ReturnType<typeof import("react-router-dom").useNavigate>;
    setError: (error: string | null) => void;
  },
  setLastSentMessage: (content: string | null) => void,
  setIsLoading: (loading: boolean) => void,
  setUsageInfo: (info: any) => void,
  currentMessages: any[] = [],
  user: any = null
) {
  // Create user message in UI
  addUserMessage(content);
  
  // Prepare context messages for AI
  const contextMessages = prepareContextMessages(content, currentMessages, user?.subscription_tier);
  
  // Send the message
  await sendMessageService(
    content, 
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

/**
 * Send a message with streaming response
 */
export async function sendMessageStream(
  options: SendMessageOptions,
  user: any,
  errorOptions: {
    navigate: ReturnType<typeof import("react-router-dom").useNavigate>;
    setError: (error: string | null) => void;
  },
  setLastSentMessage: (content: string | null) => void,
  setIsLoading: (loading: boolean) => void,
  setUsageInfo: (info: any) => void,
  currentMessages: any[] = []
) {
  await sendMessageStreamService(
    options,
    user,
    errorOptions,
    setLastSentMessage,
    setIsLoading,
    setUsageInfo,
    currentMessages
  );
}

/**
 * Retry the last message
 */
export const retryLastMessage = retryLastMessageService;
