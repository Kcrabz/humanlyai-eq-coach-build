
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const openAiApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Format the quiz answers for the prompt
function formatAnswersForPrompt(answers: number[]): string {
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

async function updateUserArchetype(userId: string, archetype: string): Promise<boolean> {
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing Supabase credentials");
    return false;
  }

  try {
    // Initialize Supabase client with service role key for admin privileges
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Update the user's profile with the determined archetype
    const { error } = await supabase
      .from('profiles')
      .update({ eq_archetype: archetype })
      .eq('id', userId);
    
    if (error) {
      console.error("Error updating user archetype:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error in updateUserArchetype:", error);
    return false;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Create Supabase client using auth header from request
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response(
      JSON.stringify({ error: "Missing Authorization header" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    // Parse request body
    const { answers, userId } = await req.json();
    
    if (!answers || answers.length !== 15 || !Array.isArray(answers)) {
      return new Response(
        JSON.stringify({ error: "Invalid quiz data. Expecting array of 15 numeric answers." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "Missing userId parameter" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Format user's answers for the prompt
    const formattedAnswers = formatAnswersForPrompt(answers);
    
    // System prompt for GPT-4o - Updated to clarify distinction between Growth Area and Tip
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
GrowthArea: [Mindset or belief that needs adjustment]
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

    // Extract analysis parts (archetype, bio, growth area, tip)
    const archetypeMatch = aiResponse.match(/Archetype:\s*([^\n]+)/i);
    const bioMatch = aiResponse.match(/Bio:\s*([^\n]+)/i);
    // Updated regex to look for GrowthArea instead of Focus
    const growthAreaMatch = aiResponse.match(/GrowthArea:\s*([^\n]+)/i);
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
    
    // Update user's profile with the determined archetype
    if (mappedArchetype) {
      await updateUserArchetype(userId, mappedArchetype);
    }
    
    // Return the analysis
    return new Response(
      JSON.stringify({
        archetype: mappedArchetype,
        bio: bioMatch ? bioMatch[1].trim() : "",
        focus: growthAreaMatch ? growthAreaMatch[1].trim() : "", // Keep "focus" key for backward compatibility
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
