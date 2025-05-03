
import { estimateTokenCount } from "./utils.ts";
import { handleOpenAIApiError, handleGeneralError } from "./openaiErrorHandler.ts";

// Call OpenAI API with streaming support
export async function* streamOpenAI(openAiApiKey: string, messages: any[]) {
  console.log("Streaming from OpenAI with model: gpt-4o");
  
  try {
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
      const errorData = await response.json();
      console.error("OpenAI API error:", errorData);
      throw handleOpenAIApiError(errorData);
    }
    
    // Process the stream
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("Failed to get reader from response");
    }
    
    const decoder = new TextDecoder();
    let buffer = "";
    let completeResponse = "";
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      // Decode chunk
      const chunk = decoder.decode(value);
      buffer += chunk;
      
      // Process all complete lines in buffer
      let lines = buffer.split('\n');
      buffer = lines.pop() || ""; // Keep the last incomplete line in buffer
      
      for (const line of lines) {
        if (line.trim() === '') continue;
        if (line.trim() === 'data: [DONE]') continue;
        
        // Extract data portion
        const dataMatch = line.match(/^data: (.*)$/);
        if (!dataMatch) continue;
        
        try {
          const json = JSON.parse(dataMatch[1]);
          const contentDelta = json.choices[0]?.delta?.content || '';
          if (contentDelta) {
            completeResponse += contentDelta;
            yield contentDelta;
          }
        } catch (e) {
          console.error("Error parsing streaming JSON:", e);
        }
      }
    }
    
    return completeResponse;
  } catch (error) {
    // Use shared error handling
    throw handleGeneralError(error);
  }
}
