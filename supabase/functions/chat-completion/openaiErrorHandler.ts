
// Error types for OpenAI API errors
export interface OpenAIError {
  type: string;
  message: string;
  details?: string;
}

// Process API errors from OpenAI response
export function handleOpenAIApiError(errorData: any): OpenAIError {
  // Check for quota/billing errors
  if (errorData.error?.type === 'insufficient_quota' || 
      errorData.error?.code === 'insufficient_quota' ||
      errorData.error?.message?.includes('quota')) {
    
    return {
      type: 'quota_exceeded',
      message: 'OpenAI API quota exceeded. Please check your billing status or contact support.',
      details: errorData.error?.message || 'Your OpenAI account has reached its usage limit or has billing issues.'
    };
  }
  
  // Check for invalid API key errors
  if (errorData.error?.type === 'invalid_request_error' && 
      errorData.error?.message?.includes('API key')) {
    
    return {
      type: 'invalid_key',
      message: 'Invalid API key provided. Please check your API key and try again.',
      details: 'The API key provided was rejected by OpenAI.'
    };
  }
  
  // Generic error fallback
  return {
    type: 'api_error',
    message: errorData.error?.message || 'Error calling OpenAI API',
    details: JSON.stringify(errorData)
  };
}

// Process general errors from try/catch blocks
export function handleGeneralError(error: any): OpenAIError {
  // Rethrow if it's already our custom error format
  if (error.type) {
    return error;
  }
  
  // Check for quota errors in the error message
  if (error.message?.includes('quota') || 
      error.message?.includes('exceeded') || 
      error.message?.includes('billing')) {
    return {
      type: 'quota_exceeded',
      message: 'OpenAI API quota exceeded. Please check your billing status or contact support.',
      details: error.message
    };
  }
  
  // Generic error
  return {
    type: 'unknown_error',
    message: `OpenAI API error: ${error.message}`,
    details: error.stack
  };
}
