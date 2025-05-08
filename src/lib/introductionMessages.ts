
// Function to check if we've already shown the introduction to this user
export function shouldShowIntroduction(userId: string): boolean {
  const introShown = localStorage.getItem(`humanly_intro_shown_${userId}`);
  return introShown !== 'true';
}

// Function to mark that we've shown the introduction to this user
export function markIntroductionAsShown(userId: string): void {
  localStorage.setItem(`humanly_intro_shown_${userId}`, 'true');
}

// Get the coaching mode-specific introduction message
export function getIntroductionMessage(coachingMode?: string): string {
  switch (coachingMode?.toLowerCase()) {
    case 'gentle':
      return "Hi there, I'm Kai — your EQ coach. I'm here to support your emotional growth with thoughtful questions and simple, practical ideas. We'll take it one step at a time. What would you like to focus on today?";
    
    case 'tough love':
      return "Hey, I'm Kai — your EQ coach. I'll be direct and honest, because growth takes guts. I'll challenge your thinking and give it to you straight — always with your goals in mind. So, what's something real you want to work on?";
    
    case 'analytical':
      return "Hello. I'm Kai, your EQ coach. I specialize in evidence-based approaches to emotional intelligence development. I can help you analyze patterns in your emotional responses and develop practical strategies. What area would you like to explore?";
    
    default: // 'normal' mode
      return "Hey! I'm Kai, your EQ coach. I'm here to help you develop emotionally intelligent skills through thoughtful questions and practical guidance. What's on your mind today?";
  }
}
