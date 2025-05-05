
/**
 * Types for chat stream handling
 */

// Information about token usage
export interface UsageInfo {
  currentUsage: number;
  limit: number;
  percentage: number;
}

// Options for handling stream processes
export interface StreamOptions {
  assistantMessageId: string;
  updateAssistantMessage: (id: string, content: string) => void;
  setLastSentMessage: (content: string | null) => void;
  setUsageInfo: (info: UsageInfo | null) => void;
}
