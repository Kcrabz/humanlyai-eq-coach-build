
// Helper functions for formatting data

/**
 * Format the quiz answers for the prompt
 */
export function formatAnswersForPrompt(answers: number[]): string {
  const questions = [
    "I reflect on my emotions before reacting.",
    "I often take quick action without hesitation.",
    "I find it difficult to express how I feel.",
    "I prioritize the needs of others over my own.",
    "I take time to pause and process before responding.",
    "I thrive on momentum and dislike delays.",
    "I keep emotional struggles to myself.",
    "I avoid conflict to maintain harmony.",
    "I prefer thinking over feeling in tough situations.",
    "I struggle to say \"no\" even when I need to.",
    "I am highly self-aware of my emotional state.",
    "I value deep personal connections over tasks.",
    "I feel comfortable sharing vulnerability.",
    "I overanalyze before making decisions.",
    "I often focus more on logic than emotions."
  ];
  
  let formattedAnswers = "";
  answers.forEach((rating, index) => {
    const questionNumber = index + 1;
    const questionText = questions[index];
    formattedAnswers += `${questionNumber}. "${questionText}" - Rating: ${rating}/5\n`;
  });
  
  return formattedAnswers;
}
