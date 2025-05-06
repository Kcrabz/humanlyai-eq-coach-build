
/**
 * Validates an email address format
 * @param email Email address to validate
 * @returns True if email is valid, false otherwise
 */
export const isValidEmail = (email: string): boolean => {
  // Basic email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates password strength
 * @param password Password to validate
 * @returns Object containing validation result and feedback
 */
export const validatePassword = (password: string): { 
  isValid: boolean; 
  feedback: string;
  strength: 'weak' | 'medium' | 'strong';
} => {
  // Password must be at least 8 characters
  if (password.length < 8) {
    return { 
      isValid: false, 
      feedback: "Password must be at least 8 characters long",
      strength: 'weak'
    };
  }

  // Check for medium strength: letters and numbers
  const hasMixedChars = /[a-zA-Z]/.test(password) && /\d/.test(password);
  
  // Check for strong strength: letters, numbers, and special characters
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  if (hasSpecialChar && hasMixedChars && password.length >= 10) {
    return {
      isValid: true,
      feedback: "Strong password",
      strength: 'strong'
    };
  } else if (hasMixedChars) {
    return {
      isValid: true,
      feedback: "Medium strength - consider adding special characters",
      strength: 'medium'
    };
  } else {
    return {
      isValid: true, 
      feedback: "Weak password - consider adding numbers and special characters",
      strength: 'weak'
    };
  }
};

/**
 * Sanitizes a string input by removing potentially harmful characters
 * @param input Input string to sanitize
 * @returns Sanitized string
 */
export const sanitizeInput = (input: string): string => {
  if (!input) return '';
  
  // Replace potentially harmful characters
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/`/g, '&#96;');
};

/**
 * Validates that a string is within a specified length range
 * @param input Input string to validate
 * @param minLength Minimum allowed length
 * @param maxLength Maximum allowed length
 * @returns True if string length is within range, false otherwise
 */
export const isValidLength = (
  input: string,
  minLength: number = 0,
  maxLength: number = Number.MAX_SAFE_INTEGER
): boolean => {
  return input.length >= minLength && input.length <= maxLength;
};

/**
 * Creates a validation error message for a field that fails length validation
 * @param fieldName Name of the field being validated
 * @param minLength Minimum allowed length
 * @param maxLength Maximum allowed length
 * @returns Error message string
 */
export const getLengthErrorMessage = (
  fieldName: string,
  minLength: number,
  maxLength: number = Number.MAX_SAFE_INTEGER
): string => {
  if (maxLength === Number.MAX_SAFE_INTEGER) {
    return `${fieldName} must be at least ${minLength} characters`;
  }
  return `${fieldName} must be between ${minLength} and ${maxLength} characters`;
};

/**
 * Safely parses JSON with error handling
 * @param jsonString JSON string to parse
 * @returns Parsed object or null if invalid
 */
export const safeJsonParse = (jsonString: string): any => {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Error parsing JSON:", error);
    return null;
  }
};
