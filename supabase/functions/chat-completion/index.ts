
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
      return new Response(
        JSON.stringify({ error: 'API configuration error. Please contact support.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the user's subscription tier
    const { data: profileData, error: profileError } = await supabaseClient
      .from('profiles')
      .select('subscription_tier, eq_archetype, coaching_mode')
      .eq('id', user.id)
      .single();

    // If there's an error fetching the profile or it doesn't exist, create a default one
    if (profileError || !profileData) {
      // Create a default profile for the user
      await supabaseClient
        .from('profiles')
        .upsert({
          id: user.id,
          subscription_tier: 'free',
          onboarded: false
        });
      
      // Use default values
      const defaultProfileData = {
        subscription_tier: 'free',
        eq_archetype: null,
        coaching_mode: null
      };
      
      // Now we can proceed with these default values
      const isPremiumUser = defaultProfileData.subscription_tier === 'premium';
      
      // Prepare messages array with system prompt
      let messages = [
        { 
          role: 'system', 
          content: `${systemPrompt}\n\nUser's EQ Archetype: Not set\nCoaching Mode: normal`
        },
        { role: 'user', content: message }
      ];

      // Call OpenAI API
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: messages,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Error calling OpenAI API');
      }

      const completion = await response.json();
      const assistantResponse = completion.choices[0].message.content;

      return new Response(
        JSON.stringify({ response: assistantResponse }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If we have a valid profile, continue with it
    const isPremiumUser = profileData.subscription_tier === 'premium';
    
    // Prepare messages array with system prompt
    let messages = [
      { 
        role: 'system', 
        content: `${systemPrompt}\n\nUser's EQ Archetype: ${profileData.eq_archetype || 'Not set'}\nCoaching Mode: ${profileData.coaching_mode || 'normal'}`
      },
    ];

    // For premium users, include the last 5 messages for context
    if (isPremiumUser) {
      const { data: chatHistory } = await supabaseClient
        .from('chat_messages')
        .select('content, role')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10); // Fetch 10 to get last 5 exchanges (5 user + 5 assistant messages)

      if (chatHistory && chatHistory.length > 0) {
        messages = [
          ...messages,
          ...chatHistory.reverse().map((msg) => ({ 
            role: msg.role, 
            content: msg.content 
          }))
        ];
      }
    }

    // Add the current user message
    messages.push({ role: 'user', content: message });

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: messages,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Error calling OpenAI API');
    }

    const completion = await response.json();
    const assistantResponse = completion.choices[0].message.content;

    // For premium users, store the conversation in the database
    if (isPremiumUser) {
      // Store the user's message
      await supabaseClient.from('chat_messages').insert({
        user_id: user.id,
        content: message,
        role: 'user',
      });

      // Store the assistant's response
      await supabaseClient.from('chat_messages').insert({
        user_id: user.id,
        content: assistantResponse,
        role: 'assistant',
      });
    }

    return new Response(
      JSON.stringify({ response: assistantResponse }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in chat completion function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
