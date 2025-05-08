
import { handleOpenAIApiError, handleGeneralError } from "./openaiErrorHandler.ts";
import { validateResponse } from "./responseValidator.ts";

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
    
    console.log("Making fetch call to OpenAI API...");
    
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
        max_tokens: 400, // about 120-150 words
        temperature: 0.85,
        top_p: 1.0,
        frequency_penalty: 0.2,
        presence_penalty: 0.2
      }),
    });
    
    if (!response.ok) {
      try {
        const errorData = await response.json();
        console.error("OpenAI API error:", errorData);
        throw handleOpenAIApiError(errorData);
      } catch (parseError) {
        console.error("Error parsing OpenAI error response:", parseError);
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }
    }
    
    console.log("Received response from OpenAI API");
    const completion = await response.json();
    console.log("Parsed response JSON");
    
    if (!completion.choices || !completion.choices[0] || !completion.choices[0].message) {
      console.error("Invalid OpenAI response format:", completion);
      return "I apologize, but I received an invalid response. Please try again.";
    }
    
    const content = completion.choices[0].message.content;
    console.log(`Response content length: ${content.length} characters`);
    
    // Apply the response validator before returning
    const validatedContent = validateResponse(content);
    console.log("Response validated and potentially modified");
    
    return validatedContent;
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
