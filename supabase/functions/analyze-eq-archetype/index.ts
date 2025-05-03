
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { analyzeWithAI } from "./ai.ts";
import { formatAnswersForPrompt } from "./formatting.ts";
import { updateUserArchetype } from "./db.ts";
import { CORS_HEADERS } from "./constants.ts";
import { AnalysisRequest, AnalysisResponse } from "./types.ts";

const openAiApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: CORS_HEADERS });
  }

  // Create Supabase client using auth header from request
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response(
      JSON.stringify({ error: "Missing Authorization header" }),
      { status: 401, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }

  try {
    // Parse request body
    const { answers, userId }: AnalysisRequest = await req.json();
    
    if (!answers || answers.length !== 15 || !Array.isArray(answers)) {
      return new Response(
        JSON.stringify({ error: "Invalid quiz data. Expecting array of 15 numeric answers." }),
        { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "Missing userId parameter" }),
        { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    // Format user's answers for the prompt
    const formattedAnswers = formatAnswersForPrompt(answers);
    
    console.log("Processing answers for user:", userId);
    
    // Process with AI
    const analysis = await analyzeWithAI(formattedAnswers, openAiApiKey || "");
    
    console.log("Analysis result:", analysis.archetype);
    
    // Update user's profile with the determined archetype if valid
    if (analysis.archetype) {
      await updateUserArchetype(userId, analysis.archetype, supabaseUrl || "", supabaseServiceKey || "");
    }
    
    // Return the analysis
    const response: AnalysisResponse = {
      archetype: analysis.archetype || "reflector",
      bio: analysis.bio || "",
      focus: analysis.growthArea || "", // Keep "focus" key for backward compatibility
      tip: analysis.tip || "",
      raw_response: analysis.rawResponse
    };

    console.log("Sending response:", response.archetype);

    return new Response(
      JSON.stringify(response),
      { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(
      JSON.stringify({ error: error.message || "An error occurred processing your request" }),
      { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }
});
