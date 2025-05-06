
import { serve } from "https://deno.land/std@0.170.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.23.0";
import { corsHeaders, errorResponse, successResponse, BreakthroughResponse } from "./utils.ts";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

// Create a Supabase client with the service role key
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse the request body
    const { message, userId, messageId } = await req.json();
    
    // Validate required parameters
    if (!message || !userId || !messageId) {
      return errorResponse("Missing required parameters: message, userId, or messageId");
    }

    // Check if we have the OpenAI API key
    if (!OPENAI_API_KEY) {
      return errorResponse("Missing OpenAI API key configuration", 500);
    }

    // Analyze the message for EQ breakthrough using OpenAI
    const analysis = await detectBreakthrough(message);

    if (analysis.breakthrough) {
      // Save the breakthrough to the database
      const { error: dbError } = await supabase
        .from("eq_breakthroughs")
        .insert({
          user_id: userId,
          message_id: messageId, 
          message: message,
          insight: analysis.insight || "An emotional intelligence insight was detected.",
          category: analysis.category || "general",
        });

      if (dbError) {
        console.error("Error storing breakthrough:", dbError);
        return errorResponse("Error storing breakthrough", 500);
      }
    }

    // Return the analysis results
    return successResponse(analysis);
  } catch (error) {
    console.error("Error processing request:", error);
    return errorResponse(`Error processing request: ${error.message}`, 500);
  }
});

async function detectBreakthrough(message: string): Promise<BreakthroughResponse> {
  try {
    // Call OpenAI API to analyze the message for EQ breakthrough
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo-1106",
        messages: [
          {
            role: "system",
            content: `You are an emotional intelligence analyzer. Determine if the user message shows a breakthrough in emotional awareness, self-regulation, empathy, or social skills. 
            If it does, respond with JSON: {"breakthrough": true, "category": "emotional-awareness|self-regulation|empathy|social-skills", "insight": "brief description of the insight"}.
            If not, respond with JSON: {"breakthrough": false}.
            Respond with valid JSON only, no explanations.`
          },
          {
            role: "user",
            content: message,
          },
        ],
        response_format: { type: "json_object" },
        temperature: 0.2,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error("OpenAI API error:", data);
      return { breakthrough: false, error: "Error analyzing message" };
    }

    try {
      // Parse the content as JSON
      const result = JSON.parse(data.choices[0].message.content);
      return result;
    } catch (e) {
      console.error("Error parsing OpenAI response:", e);
      return { breakthrough: false, error: "Error parsing analysis" };
    }
  } catch (error) {
    console.error("Error in breakthrough detection:", error);
    return { breakthrough: false, error: error.message };
  }
}
