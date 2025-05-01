
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
