
import { estimateTokenCount } from "./utils.ts";
import { createSystemMessage } from "./promptTemplates.ts";

// Prepare messages for OpenAI API
export function prepareMessages(message: string, archetype: string, coachingMode: string, chatHistory: any[] = []) {
  // Get the system message with personalization
  const systemContent = createSystemMessage(archetype, coachingMode);
  
  // Base messages with system prompt and current user message
  let messages = [
    { role: 'system', content: systemContent },
    { role: 'user', content: message }
  ];
  
  // If we have chat history, add it between system message and current user message
  if (chatHistory && chatHistory.length > 0) {
    // Add previous messages to the conversation context (in correct order)
    const previousMessages = chatHistory
      .reverse()
      .map(msg => ({ role: msg.role, content: msg.content }));
    
    // Insert previous messages between system message and current user message
    messages = [
      messages[0], // System message
      ...previousMessages, // Previous conversation
      messages[1]  // Current user message
    ];
    
    console.log(`Added ${previousMessages.length} previous messages as context`);
  }
  
  return messages;
}

// Call OpenAI API with streaming support
export async function* streamOpenAI(openAiApiKey: string, messages: any[]) {
  console.log("Streaming from OpenAI with model: gpt-4o-mini");
  
  try {
    // Call OpenAI API with streaming enabled
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: messages,
        max_tokens: 500,
        stream: true
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenAI API error:", errorData);
      
      // Check for different error types
      if (errorData.error?.type === 'insufficient_quota' || 
          errorData.error?.code === 'insufficient_quota' ||
          errorData.error?.message?.includes('quota')) {
        
        throw {
          type: 'quota_exceeded',
          message: 'OpenAI API quota exceeded. Please check your billing status or contact support.',
          details: errorData.error?.message || 'Your OpenAI account has reached its usage limit or has billing issues.'
        };
      }
      
      if (errorData.error?.type === 'invalid_request_error' && 
          errorData.error?.message?.includes('API key')) {
        
        throw {
          type: 'invalid_key',
          message: 'Invalid API key provided. Please check your API key and try again.',
          details: 'The API key provided was rejected by OpenAI.'
        };
      }
      
      throw new Error(errorData.error?.message || 'Error calling OpenAI API');
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
    // Rethrow if it's already our custom error format
    if (error.type) {
      throw error;
    }
    
    // Check for quota errors in the error message
    if (error.message?.includes('quota') || 
        error.message?.includes('exceeded') || 
        error.message?.includes('billing')) {
      throw {
        type: 'quota_exceeded',
        message: 'OpenAI API quota exceeded. Please check your billing status or contact support.',
        details: error.message
      };
    }
    
    throw new Error(`OpenAI API error: ${error.message}`);
  }
}

// Call OpenAI API (non-streaming version for fallback)
export async function callOpenAI(openAiApiKey: string, messages: any[]) {
  console.log("Calling OpenAI with model: gpt-4o-mini");
  
  try {
    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: messages,
        max_tokens: 500
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenAI API error:", errorData);
      
      // Check for different error types
      if (errorData.error?.type === 'insufficient_quota' || 
          errorData.error?.code === 'insufficient_quota' ||
          errorData.error?.message?.includes('quota')) {
        
        throw {
          type: 'quota_exceeded',
          message: 'OpenAI API quota exceeded. Please check your billing status or contact support.',
          details: errorData.error?.message || 'Your OpenAI account has reached its usage limit or has billing issues.'
        };
      }
      
      if (errorData.error?.type === 'invalid_request_error' && 
          errorData.error?.message?.includes('API key')) {
        
        throw {
          type: 'invalid_key',
          message: 'Invalid API key provided. Please check your API key and try again.',
          details: 'The API key provided was rejected by OpenAI.'
        };
      }
      
      throw new Error(errorData.error?.message || 'Error calling OpenAI API');
    }
    
    const completion = await response.json();
    return completion.choices[0].message.content;
  } catch (error) {
    // Rethrow if it's already our custom error format
    if (error.type) {
      throw error;
    }
    
    // Check for quota errors in the error message
    if (error.message?.includes('quota') || 
        error.message?.includes('exceeded') || 
        error.message?.includes('billing')) {
      throw {
        type: 'quota_exceeded',
        message: 'OpenAI API quota exceeded. Please check your billing status or contact support.',
        details: error.message
      };
    }
    
    throw new Error(`OpenAI API error: ${error.message}`);
  }
}
