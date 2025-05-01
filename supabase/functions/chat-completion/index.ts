
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the Auth context of the logged in user
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { 
        global: { headers: { Authorization: req.headers.get('Authorization')! } },
        auth: { persistSession: false }
      }
    );

    const { message, systemPrompt } = await req.json();

    // Get the user from the request
    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get API key from environment variable
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    
    if (!OPENAI_API_KEY) {
      console.error("OpenAI API key not configured");
      return new Response(
        JSON.stringify({ error: 'API configuration error. Please contact support.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Prepare a mock response if we need to test without using OpenAI API
    const mockResponse = `This is a mock response from the coach. You asked about: "${message}"
    
    As your coach, I'd suggest focusing on prioritizing tasks based on their importance and urgency.

    What specific areas are you finding most challenging to prioritize right now?`;

    try {
      // Get the user's subscription tier
      const { data: profileData, error: profileError } = await supabaseClient
        .from('profiles')
        .select('subscription_tier, eq_archetype, coaching_mode')
        .eq('id', user.id)
        .single();
      
      // Prepare system content based on profile or default values
      let systemContent = systemPrompt;
      let archetype = "Not set";
      let coachingMode = "normal";
      
      if (!profileError && profileData) {
        archetype = profileData.eq_archetype || "Not set";
        coachingMode = profileData.coaching_mode || "normal";
      }
      
      systemContent += `\n\nUser's EQ Archetype: ${archetype}\nCoaching Mode: ${coachingMode}`;
      
      // Prepare messages for OpenAI
      let messages = [
        { role: 'system', content: systemContent },
        { role: 'user', content: message }
      ];
      
      // Use the model parameter to specify the model
      const modelToUse = "gpt-4o-mini"; // Using a less expensive model to help with quota issues
      
      console.log(`Calling OpenAI with model: ${modelToUse}`);
      
      // Call OpenAI API
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: modelToUse,
          messages: messages,
          max_tokens: 500
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("OpenAI API error:", errorData);
        
        if (errorData.error?.message?.includes("exceeded your current quota")) {
          console.log("Using mock response due to quota exceeded");
          return new Response(
            JSON.stringify({ response: mockResponse }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        throw new Error(errorData.error?.message || 'Error calling OpenAI API');
      }
      
      const completion = await response.json();
      const assistantResponse = completion.choices[0].message.content;
      
      return new Response(
        JSON.stringify({ response: assistantResponse }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
      
    } catch (openAIError) {
      console.error("Error with OpenAI or profile:", openAIError);
      
      // Fallback to mock response if OpenAI fails for any reason
      console.log("Using mock response due to error");
      return new Response(
        JSON.stringify({ response: mockResponse }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.error('Error in chat completion function:', error);
    return new Response(
      JSON.stringify({ error: error.message || "An unexpected error occurred" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
