
import { ARCHETYPE_MAPPING } from "./constants.ts";

/**
 * Analyze quiz answers using OpenAI GPT-4o
 */
export async function analyzeWithAI(
  formattedAnswers: string,
  openAiApiKey: string
): Promise<{ 
  archetype: string | null;
  bio: string | null;
  growthArea: string | null;
  tip: string | null;
  rawResponse: string;
}> {
  try {
    // System prompt for GPT-4o
    const systemPrompt = `You are Kai, the HumanlyAI Coach — an expert in Emotional Intelligence. A user has answered 15 questions on a scale from 1 (Strongly Disagree) to 5 (Strongly Agree). Based on their pattern of responses, identify which EQ Archetype best matches them:

- Reflector: Highly introspective, tends to overthink, hesitant to act
- Activator: Driven to act, fast-moving, avoids emotional pause
- Regulator: Emotionally controlled, often suppresses expression
- Connector: Prioritizes others, struggles with emotional boundaries
- Observer: Analytical, private, slow to emotionally engage

Instructions:
1. Determine the best-fit Archetype based on overall response pattern.
2. Return the following format (use EXACTLY one of the 5 archetypes listed above, lowercase):

Archetype: [reflector/activator/regulator/connector/observer]
Bio: [2–3 sentence summary of their emotional tendencies]
GrowthArea: [Mindset or belief that needs adjustment, not a practical tip]
Tip: [Simple practice they can begin with today]

Here are the user's answers:
${formattedAnswers}`;

    // Call OpenAI API using GPT-4o model
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openAiApiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: "Please analyze my EQ based on my quiz answers." }
        ],
        temperature: 0.7,
        max_tokens: 350
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("OpenAI API error:", error);
      throw new Error(`OpenAI API error: ${error.error?.message || "Unknown error"}`);
    }

    const completion = await response.json();
    const aiResponse = completion.choices[0].message.content;

    // Extract analysis parts from AI response
    const archetypeMatch = aiResponse.match(/Archetype:\s*([^\n]+)/i);
    const bioMatch = aiResponse.match(/Bio:\s*([^\n]+)/i);
    const growthAreaMatch = aiResponse.match(/GrowthArea:\s*([^\n]+)/i);
    const tipMatch = aiResponse.match(/Tip:\s*([^\n]+)/i);

    // Parse the archetype to match our system
    let archetype = archetypeMatch ? archetypeMatch[1].trim().toLowerCase() : null;
    
    // Map the archetype to our system's types if needed
    const mappedArchetype = archetype ? (ARCHETYPE_MAPPING[archetype] || "reflector") : "reflector";
    
    console.log("Archetype detected:", archetype, "Mapped to:", mappedArchetype);
    
    return {
      archetype: mappedArchetype,
      bio: bioMatch ? bioMatch[1].trim() : null,
      growthArea: growthAreaMatch ? growthAreaMatch[1].trim() : null,
      tip: tipMatch ? tipMatch[1].trim() : null,
      rawResponse: aiResponse
    };
  } catch (error) {
    console.error("Error analyzing with AI:", error);
    throw error;
  }
}
