
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

    console.log(`Processing request for user: ${user.id}`);

    // Get the user's API key from the database
    let userApiKey;
    try {
      const { data: apiKeyData, error: apiKeyError } = await supabaseClient
        .from('user_api_keys')
        .select('openai_api_key')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (!apiKeyError && apiKeyData?.openai_api_key) {
        userApiKey = apiKeyData.openai_api_key;
        console.log("Found user-provided API key");
      } else {
        console.error("No user API key found");
        return new Response(
          JSON.stringify({ 
            error: "Please add your OpenAI API key in settings to use the chat feature.",
            useAnotherKey: true 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } catch (error) {
      console.error("Error fetching user API key:", error);
      return new Response(
        JSON.stringify({ 
          error: "Failed to retrieve your API key. Please check settings.",
          useAnotherKey: true 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (!userApiKey) {
      console.error("No OpenAI API key available");
      return new Response(
        JSON.stringify({ error: 'API key not configured. Please add your API key in settings.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    try {
      // Get the user's subscription tier
      const { data: profileData, error: profileError } = await supabaseClient
        .from('profiles')
        .select('subscription_tier, eq_archetype, coaching_mode')
        .eq('id', user.id)
        .maybeSingle();
      
      // Prepare system content based on profile or default values
      let systemContent = systemPrompt;
      let archetype = "Not set";
      let coachingMode = "normal";
      
      if (!profileError && profileData) {
        archetype = profileData.eq_archetype || "Not set";
        coachingMode = profileData.coaching_mode || "normal";
      } else {
        console.log("No profile data found or error:", profileError);
      }
      
      systemContent += `\n\nUser's EQ Archetype: ${archetype}\nCoaching Mode: ${coachingMode}`;
      
      // Prepare messages for OpenAI
      let messages = [
        { role: 'system', content: systemContent },
        { role: 'user', content: message }
      ];
      
      // Use the model parameter to specify the model
      const modelToUse = "gpt-4o-mini";
      
      console.log(`Calling OpenAI with model: ${modelToUse}`);
      
      // Call OpenAI API
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userApiKey}`,
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
          return new Response(
            JSON.stringify({ 
              error: "API quota exceeded. Please update your API key in settings.",
              useAnotherKey: true 
            }),
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
      
      return new Response(
        JSON.stringify({ 
          error: "Failed to get response from OpenAI. Please check your API key in settings.",
          useAnotherKey: true 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
