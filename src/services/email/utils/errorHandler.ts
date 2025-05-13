
export enum EmailErrorType {
  FETCH_FAILURE = "FETCH_FAILURE",
  UPDATE_FAILURE = "UPDATE_FAILURE",
  SEND_FAILURE = "SEND_FAILURE",
  UNKNOWN = "UNKNOWN",
  INVALID_DATA = "INVALID_DATA"
}

export interface EmailError {
  type: EmailErrorType;
  message: string;
  originalError?: any;
}

/**
 * Handle email-related errors in a consistent way
 */
export function handleEmailError(error: any, type: EmailErrorType = EmailErrorType.UNKNOWN, message?: string): EmailError {
  console.error(`Email error (${type}):`, error);
  
  return {
    type,
    message: message || "An error occurred with email operations",
    originalError: error
  };
}

/**
 * Higher-order function to handle errors in email operations
 * @param fn Async function to execute
 * @param errorType Type of error if the function fails
 * @param errorMessage Custom error message
 * @returns Tuple with [result, error]
 */
export async function withEmailErrorHandling<T>(
  fn: () => Promise<T>,
  errorType: EmailErrorType = EmailErrorType.UNKNOWN,
  errorMessage?: string
): Promise<[T | null, EmailError | null]> {
  try {
    const result = await fn();
    return [result, null];
  } catch (error) {
    return [null, handleEmailError(error, errorType, errorMessage)];
  }
}
