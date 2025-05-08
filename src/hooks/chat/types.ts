
import { UsageInfo } from "@/utils/chatStreamHandler";

// Error handler options
export interface ErrorHandlerOptions {
  navigate: ReturnType<typeof import("react-router-dom").useNavigate>;
  setError: (error: string | null) => void;
}

// Options for message sending
export interface SendMessageOptions {
  content: string;
  userMessageId: string;
  assistantMessageId: string;
  updateAssistantMessage?: (id: string, content: string) => void;
}

// Response for retry last message
export interface RetryOptions {
  addUserMessage: (message: string) => string;
  addAssistantMessage: (message: string) => string;
  updateAssistantMessage: (id: string, content: string) => void;
}

// Chat actions context type
export interface ChatActionsContext {
  isLoading: boolean;
  usageInfo: UsageInfo | null;
  error: string | null;
  sendMessage: (content: string, 
    addUserMessage: (content: string) => string,
    addAssistantMessage: (content: string) => string,
    updateAssistantMessage: (id: string, content: string) => void,
    currentMessages?: any[]) => Promise<void>;
  retryLastMessage: (options: RetryOptions) => Promise<void>;
  startNewChat: (clearMessages: () => void) => void;
}
