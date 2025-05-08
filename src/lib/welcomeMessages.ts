
/**
 * Collection of welcome messages for fresh chat experiences
 */

const welcomeMessages = [
  "Welcome back! How can I help you today?",
  "Hello there! Ready to continue our conversation?",
  "Great to see you again! What would you like to discuss today?",
  "Welcome! What's on your mind?",
  "I'm here and ready to chat. What can I help with today?",
  "Hi there! What would you like to talk about?",
  "Welcome back to our conversation. How can I assist you?",
  "Hello! I'm ready to chat whenever you are.",
  "Good to see you! What would you like to explore today?",
  "Welcome! I'm here to help with whatever you need."
];

/**
 * Returns a random welcome message from the collection
 */
export const getRandomWelcomeMessage = (): string => {
  const randomIndex = Math.floor(Math.random() * welcomeMessages.length);
  return welcomeMessages[randomIndex];
};

/**
 * Returns a welcome message based on the time of day
 */
export const getTimeBasedWelcomeMessage = (): string => {
  const hour = new Date().getHours();
  
  if (hour < 12) {
    return "Good morning! How can I help you today?";
  } else if (hour < 18) {
    return "Good afternoon! What's on your mind?";
  } else {
    return "Good evening! How can I assist you tonight?";
  }
};

/**
 * Returns either a random or time-based welcome message
 * With 70% chance of random message, 30% chance of time-based
 */
export const getWelcomeMessage = (): string => {
  return Math.random() < 0.7 
    ? getRandomWelcomeMessage() 
    : getTimeBasedWelcomeMessage();
};
