
// Response validation utility to enforce concise and focused responses
// Prevents multi-point responses and enforces style guidelines

/**
 * Validate and potentially modify the response from the AI to ensure
 * it adheres to our communication guidelines:
 * - No lists of multiple points
 * - Single ideas/tips per response
 * - Appropriate length
 * - Always ends with a question
 */
export function validateResponse(response: string): string {
  // Skip validation for very short responses
  if (response.length < 30) return response;
  
  // Check for list indicators
  const hasNumberedList = /\d+\.\s/.test(response);
  const hasBulletPoints = /•|\*|-\s/.test(response);
  const hasSequence = /(?:first|second|third|finally|lastly)[,:]|\bsteps?\b/i.test(response);
  
  // Check if response appears to be listing multiple items
  if (hasNumberedList || hasBulletPoints || hasSequence) {
    // Extract just the first part/sentence before the list
    let firstPart = "";
    
    if (hasNumberedList) {
      firstPart = response.split(/\d+\.\s/)[0].trim();
    } else if (hasBulletPoints) {
      firstPart = response.split(/•|\*|-\s/)[0].trim();
    } else if (hasSequence) {
      // Get content before "first" or similar sequence indicator
      const sequenceSplit = response.split(/(?:first|second|third|finally|lastly)[,:]/i)[0].trim();
      firstPart = sequenceSplit;
    }
    
    // Ensure we have something meaningful
    if (firstPart.length < 20) {
      // If the introduction is too short, take slightly more content
      firstPart = response.split("\n")[0];
    }
    
    // Add a gentle redirect
    return `${firstPart}\n\nWhat specific aspect would you like to focus on?`;
  }
  
  // Check for response length
  if (response.length > 800) {
    // Find a good sentence break point around 700 characters
    const truncated = response.substring(0, 700);
    const lastSentenceBreak = Math.max(
      truncated.lastIndexOf('. '), 
      truncated.lastIndexOf('? '),
      truncated.lastIndexOf('! ')
    );
    
    if (lastSentenceBreak > 300) {
      const shortenedResponse = response.substring(0, lastSentenceBreak + 1);
      return `${shortenedResponse}\n\nWhat are your thoughts on this so far?`;
    }
  }
  
  // Check if response ends with a question
  if (!response.trim().match(/[?]\s*$/)) {
    // Add a personalized open-ended question if one isn't present
    const questions = [
      "What's your experience with this?",
      "How does that resonate with you?",
      "What are your thoughts on this?",
      "How might this work for your situation?",
      "What part of this feels most relevant to you?"
    ];
    const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
    return `${response.trim()}\n\n${randomQuestion}`;
  }
  
  return response;
}
