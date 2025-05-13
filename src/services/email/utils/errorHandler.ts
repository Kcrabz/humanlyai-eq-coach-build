
import { toast } from "sonner";

/**
 * Error types for email operations
 */
export enum EmailErrorType {
  SEND_FAILURE = "send_failure",
  FETCH_FAILURE = "fetch_failure",
  UPDATE_FAILURE = "update_failure",
  CONNECTION_ERROR = "connection_error",
  INVALID_DATA = "invalid_data",
  UNKNOWN = "unknown"
}

/**
 * Interface for structured email errors
 */
export interface EmailError {
  type: EmailErrorType;
  message: string;
  details?: any;
  timestamp: Date;
}

/**
 * Creates a standardized error object for email operations
 */
export function createEmailError(
  type: EmailErrorType,
  message: string,
  details?: any
): EmailError {
  return {
    type,
    message,
    details,
    timestamp: new Date()
  };
}

/**
 * Log email errors to console with consistent formatting
 */
export function logEmailError(error: EmailError): void {
  console.error(
    `[Email Service Error] [${error.type}] ${error.timestamp.toISOString()}:`,
    error.message,
    error.details || ""
  );
}

/**
 * Show a toast notification for email errors
 */
export function notifyEmailError(error: EmailError, customMessage?: string): void {
  const displayMessage = customMessage || getDefaultErrorMessage(error.type);
  
  toast.error(displayMessage, {
    description: error.message,
  });
}

/**
 * Get a user-friendly error message based on error type
 */
function getDefaultErrorMessage(errorType: EmailErrorType): string {
  switch (errorType) {
    case EmailErrorType.SEND_FAILURE:
      return "Failed to send email";
    case EmailErrorType.FETCH_FAILURE:
      return "Failed to fetch email data";
    case EmailErrorType.UPDATE_FAILURE:
      return "Failed to update email preferences";
    case EmailErrorType.CONNECTION_ERROR:
      return "Connection error occurred";
    case EmailErrorType.INVALID_DATA:
      return "Invalid email data provided";
    default:
      return "An error occurred with the email service";
  }
}

/**
 * Handle email operation errors with standardized logging and notification
 */
export function handleEmailError(
  error: any,
  type: EmailErrorType = EmailErrorType.UNKNOWN,
  customMessage?: string
): EmailError {
  // Create structured error object
  const emailError = createEmailError(
    type,
    error?.message || "Unknown error occurred",
    error
  );
  
  // Log to console
  logEmailError(emailError);
  
  // Show toast notification
  notifyEmailError(emailError, customMessage);
  
  return emailError;
}

/**
 * Wrapper for try/catch blocks in email operations
 */
export async function withEmailErrorHandling<T>(
  operation: () => Promise<T>,
  errorType: EmailErrorType,
  errorMessage: string
): Promise<[T | null, EmailError | null]> {
  try {
    const result = await operation();
    return [result, null];
  } catch (error) {
    const emailError = handleEmailError(error, errorType, errorMessage);
    return [null, emailError];
  }
}
