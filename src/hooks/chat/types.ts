
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
  addAssistantMessage: (message: string) => void;
  updateAssistantMessage: (id: string, content: string) => void;
}
