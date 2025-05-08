
import { estimateTokenCount } from "./utils.ts";
import { handleOpenAIApiError, handleGeneralError } from "./openaiErrorHandler.ts";

// Call OpenAI API with streaming support
export async function* streamOpenAI(openAiApiKey: string, messages: any[]) {
  console.log("Streaming from OpenAI with model: gpt-4o");
  
  try {
    // Log first few messages to help with debugging
    if (messages.length > 0) {
      console.log(`First message role: ${messages[0].role}`);
      console.log(`First message content preview: ${messages[0].content.substring(0, 50)}...`);
      
      if (messages.length > 1) {
        console.log(`User message preview: ${messages[messages.length-1].content.substring(0, 50)}...`);
      }
    }
    
    // Call OpenAI API with streaming enabled
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: messages,
        max_tokens: 500,
        stream: true
      }),
    });
    
    if (!response.ok) {
      // For non-streaming error responses, we need to parse as JSON
      try {
        const errorData = await response.json();
        console.error("OpenAI API error:", errorData);
        throw handleOpenAIApiError(errorData);
      } catch (parseError) {
        // If we can't parse as JSON, use the status text
        console.error("Error parsing OpenAI error response:", parseError);
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }
    }
    
    // Process the stream
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("Failed to get reader from response");
    }
    
    const decoder = new TextDecoder();
    let buffer = "";
    let completeResponse = "";
    
    // Add explicit "Starting stream..." message to help track progress
    console.log("Starting to read OpenAI stream...");
    
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          console.log("Stream reading complete");
          break;
        }
        
        // Decode chunk
        const chunk = decoder.decode(value);
        buffer += chunk;
        console.log("Received chunk of length:", chunk.length);
        
        // Process all complete lines in buffer
        let lines = buffer.split('\n');
        buffer = lines.pop() || ""; // Keep the last incomplete line in buffer
        
        for (const line of lines) {
          if (line.trim() === '') continue;
          if (line.trim() === 'data: [DONE]') {
            console.log("Received [DONE] marker");
            continue;
          }
          
          // Extract data portion
          const dataMatch = line.match(/^data: (.*)$/);
          if (!dataMatch) continue;
          
          try {
            const json = JSON.parse(dataMatch[1]);
            const contentDelta = json.choices[0]?.delta?.content || '';
            if (contentDelta) {
              completeResponse += contentDelta;
              console.log("Yielding content delta of length:", contentDelta.length);
              yield contentDelta;
            }
          } catch (e) {
            console.error("Error parsing streaming JSON:", e, "Line:", line);
          }
        }
      }
    } catch (streamError) {
      console.error("Error during stream processing:", streamError);
      // If we've already built some response, return it
      if (completeResponse.trim() !== '') {
        return completeResponse;
      }
      throw streamError; // Re-throw if we have no response
    }
    
    // If we didn't get any response, provide a fallback
    if (completeResponse.trim() === '') {
      const fallbackResponse = "I'm Kai, your EQ coach. I'm here to help with your emotional intelligence development. What would you like to work on today?";
      yield fallbackResponse;
      return fallbackResponse;
    }
    
    return completeResponse;
  } catch (error) {
    console.error("Error in streamOpenAI:", error);
    
    // Provide helpful error message that can be streamed
    const errorMessage = `I apologize, but I'm having trouble responding right now. Error: ${error.message || 'Unknown error'}. Please try again or contact support if the issue persists.`;
    
    // Yield the error message as part of the stream
    yield errorMessage;
    
    // Also throw the error for proper handling
    throw handleGeneralError(error);
  }
}
