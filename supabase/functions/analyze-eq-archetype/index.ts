
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAiApiKey = Deno.env.get('OPENAI_API_KEY');

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Format the quiz answers for the prompt
function formatAnswersForPrompt(answers: Record<string, number>): string {
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
  Object.keys(answers).sort().forEach((questionId, index) => {
    const questionNumber = index + 1;
    const questionText = questions[index];
    const rating = answers[questionId];
    formattedAnswers += `${questionNumber}. "${questionText}" - Rating: ${rating}/5\n`;
  });
  
  return formattedAnswers;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body
    const { answers, userId } = await req.json();
    
    if (!answers || Object.keys(answers).length !== 15) {
      return new Response(
        JSON.stringify({ error: "Invalid quiz data. Expecting answers to 15 questions." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Format user's answers for the prompt
    const formattedAnswers = formatAnswersForPrompt(answers);
    
    // System prompt for GPT-4o
    const systemPrompt = `You are Kai, the HumanlyAI Coach — an expert in Emotional Intelligence. A user has answered 15 questions on a scale from 1 (Strongly Disagree) to 5 (Strongly Agree). Based on their pattern of responses, identify which EQ Archetype best matches them:

- Reflector: Highly introspective, tends to overthink, hesitant to act
- Activator: Driven to act, fast-moving, avoids emotional pause
- Regulator: Emotionally controlled, often suppresses expression
- Connector: Prioritizes others, struggles with emotional boundaries
- Observer: Analytical, private, slow to emotionally engage

Instructions:
1. Determine the best-fit Archetype based on overall response pattern.
2. Return the following format:

Archetype: [One of the 5]
Bio: [2–3 sentence summary of their emotional tendencies]
Focus: [Growth edge to prioritize]
Tip: [Simple practice they can begin with today]

Here are the user's answers:
${formattedAnswers}`;

    // Call OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openAiApiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
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

    // Extract analysis parts (archetype, bio, focus, tip)
    const archetypeMatch = aiResponse.match(/Archetype:\s*([^\n]+)/i);
    const bioMatch = aiResponse.match(/Bio:\s*([^\n]+)/i);
    const focusMatch = aiResponse.match(/Focus:\s*([^\n]+)/i);
    const tipMatch = aiResponse.match(/Tip:\s*([^\n]+)/i);

    // Parse the archetype to match our system
    let archetype = archetypeMatch ? archetypeMatch[1].trim().toLowerCase() : null;
    
    // Map the archetype to our system's types if needed
    const archetypeMapping: Record<string, string> = {
      "reflector": "reflector",
      "activator": "activator", 
      "regulator": "regulator",
      "connector": "connector",
      "observer": "observer"
    };
    
    const mappedArchetype = archetype ? (archetypeMapping[archetype] || "reflector") : "reflector";
    
    // Return the analysis
    return new Response(
      JSON.stringify({
        archetype: mappedArchetype,
        bio: bioMatch ? bioMatch[1].trim() : "",
        focus: focusMatch ? focusMatch[1].trim() : "",
        tip: tipMatch ? tipMatch[1].trim() : "",
        raw_response: aiResponse
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(
      JSON.stringify({ error: error.message || "An error occurred processing your request" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
