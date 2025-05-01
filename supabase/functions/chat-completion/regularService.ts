
import { handleOpenAIApiError, handleGeneralError } from "./openaiErrorHandler.ts";

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
      throw handleOpenAIApiError(errorData);
    }
    
    const completion = await response.json();
    return completion.choices[0].message.content;
  } catch (error) {
    // Use shared error handling
    throw handleGeneralError(error);
  }
}
