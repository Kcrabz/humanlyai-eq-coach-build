
import { supabase } from "@/integrations/supabase/client";
import { handleApiErrors } from "@/utils/chatErrorHandler";
import { handleChatStream } from "@/utils/chatStreamHandler";
import { toast } from "sonner";
import { 
  processStringSSEData,
  processObjectResponse,
  createFallbackMessage
} from "./streamResponseHandlers";

/**
 * Process a response from the Edge Function that may contain stream data
 * in different formats
 */
export async function processStreamResponse(
  data: any, 
  assistantMessageId: string,
  updateAssistantMessage: ((id: string, content: string) => void) | undefined,
  setLastSentMessage: (content: string | null) => void,
  setUsageInfo: (info: any) => void
): Promise<void> {
  // Handle different response formats
  
  // Case 1: Response is a string of SSE data
  if (typeof data === 'string') {
    console.log("Response is direct string data, length:", data.length);
    const fullResponse = processStringSSEData(
      data,
      assistantMessageId,
      updateAssistantMessage,
      setUsageInfo
    );
    
    if (fullResponse) {
      console.log("Successfully extracted response from string data:", fullResponse.substring(0, 50) + "...");
      setLastSentMessage(null);
      return;
    }
  } 
  // Case 2: Response is a ReadableStream
  else if (data.body instanceof ReadableStream) {
    console.log("Response is a ReadableStream, processing...");
    const reader = data.body.getReader();
    
    // Handle the streaming process
    await handleChatStream(reader, {
      assistantMessageId,
      updateAssistantMessage: updateAssistantMessage || (() => {}),
      setLastSentMessage,
      setUsageInfo
    });
    
    console.log("Stream processing completed");
    return;
  } 
  // Case 3: Response is an object with content data
  else if (typeof data === 'object') {
    const extractedContent = processObjectResponse(
      data,
      assistantMessageId,
      updateAssistantMessage,
      setUsageInfo
    );
    
    if (extractedContent) {
      setLastSentMessage(null);
      return;
    }
  }

  // If we reach here, we couldn't extract the response properly
  console.error("Couldn't properly extract response from:", data);
  
  // Use fallback message as last resort
  createFallbackMessage(assistantMessageId, updateAssistantMessage);
}
