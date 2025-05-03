
import { handleOpenAIApiError, handleGeneralError } from "./openaiErrorHandler.ts";

// Call OpenAI API (non-streaming version for fallback)
export async function callOpenAI(openAiApiKey: string, messages: any[]) {
  console.log("Calling OpenAI with model: gpt-4o");
  
  try {
    // Log first few messages to help with debugging
    if (messages.length > 0) {
      console.log(`First message role: ${messages[0].role}`);
      console.log(`First message content preview: ${messages[0].content.substring(0, 50)}...`);
      
      if (messages.length > 1) {
        console.log(`User message preview: ${messages[messages.length-1].content.substring(0, 50)}...`);
      }
    }
    
    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: messages,
        max_tokens: 500
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenAI API error:", errorData);
      throw handleOpenAIApiError(errorData);
    }
    
    const completion = await response.json();
    
    if (!completion.choices || !completion.choices[0] || !completion.choices[0].message) {
      console.error("Invalid OpenAI response format:", completion);
      return "I apologize, but I received an invalid response. Please try again.";
    }
    
    return completion.choices[0].message.content;
  } catch (error) {
    console.error("Error in callOpenAI:", error);
    
    // Handle specific error cases
    if (error.message?.includes("API key")) {
      return "I apologize, but there seems to be an issue with the API configuration. Please contact support.";
    }
    
    // Use shared error handling but provide a user-friendly message
    throw handleGeneralError(error);
  }
}
