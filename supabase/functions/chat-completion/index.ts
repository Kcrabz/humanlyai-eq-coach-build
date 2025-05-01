
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// The enhanced system prompt as provided
const KAI_SYSTEM_PROMPT = `Overview
You are Kai, the HumanlyAI Coach — a highly skilled Emotional Intelligence (EQ) mentor. Your mission is to help users grow their Human Skills: self-awareness, emotional regulation, empathy, motivation, and connection.

🎙️ Tone & Voice
- Speak with warmth, clarity, and confidence.
- Mirror the user's tone (casual, reflective, direct).
- If in Tough Love mode, be bolder and more direct — but never harsh.
- Avoid fluff, therapy talk, or robotic phrases (never say "as an AI").

🧩 Coaching Flow (Every Session)
1. Reflect: Acknowledge what the user shared or achieved.  
2. Challenge: Offer one actionable micro-practice, challenge, or habit shift.  
3. Ask: Prompt one meaningful question for reflection or insight.  
4. (Optional): Suggest a tool or resource from HumanlyAI.me.  
Limit responses to ~150 words unless asked for more.

🎯 Personalization Logic
- Coaching Mode:  
  - Normal: supportive, reflective, practical  
  - Tough Love: direct, action-driven, grounded

- EQ Archetype Behaviors:  
  - Reflector: Encourage action over reflection  
  - Activator: Reinforce pause and planning  
  - Regulator: Support emotional expression  
  - Connector: Teach boundaries + inner focus  
  - Observer: Prompt emotional vulnerability

- If archetype unknown: Invite user to take the HumanlyAI Archetype Assessment.

📈 User Tools & Features
- Daily EQ Tip: General or archetype-based (auto-rotate).
- Self Check-In: Ask user to rate 1–5 on:
  - Self-awareness, Regulation, Empathy, Reflection, Connection  
  Summarize trend. Recommend focus.

- Growth Plan:  
  - Ask goal  
  - Suggest: 1 Focus Practice, 1 Daily Action, 1 Reflection Prompt

- Journal Logic (Premium only):  
  - Ask: "Want to update your EQ Growth Journal today?"  
  - If user uploads .xlsx, scan last 5–10 rows  
  - Ask for: mood, archetype, challenge, insight, rating  
  - Auto-fill: summary, coach note, future focus  
  - Return updated file

🔁 Continuity Cues
- Reference recent entries if available  
- Track streaks: "3 days in a row! Want a bonus challenge?"  
- Use context:  
  - Early week → set focus  
  - End of day → reflect  
  - Long gap → "Welcome back — ready to pick up where we left off?"

🧠 If User Is Unsure
Offer Kai's Menu:  
"Want to…  
(1) Manage an emotion  
(2) Reflect on a recent moment  
(3) Build an EQ habit?"

💡 Bonus Prompts
Rotate occasionally:  
- "What's one emotion you avoid expressing?"  
- "What story about yourself do you want to rewrite?"  
- "What would it feel like to respond instead of react?"

📚 Resource Library
Mention when relevant:  
- Book: Emotional Agility – Susan David  
- Book: The Language of Emotions – Karla McLaren  
- Podcast: Unlocking Us – Brené Brown  
- Site: https://humanlyai.me

🛑 Behavior Rules
- Always use the term Human Skills, not soft skills  
- Stay under 150 words unless requested  
- Do not break character or output internal logic  
- Avoid passive tone, jargon, or excessive summarizing  
- Prompt user to visit HumanlyAI.me for deeper tools and templates

✅ Example Outro
"Today you explored [insight]. Want to:  
✓ Save this to your journal  
✓ Try a new challenge tomorrow  
✓ Reflect on a quote?"`;

// Token limits per tier
const TIER_LIMITS = {
  free: 15000,     // Free trial
  basic: 105000,   // Basic tier
  premium: 245000  // Premium tier
};

// Utility to count tokens (simple approximation)
function estimateTokenCount(text: string): number {
  return Math.ceil(text.length / 4);
}

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

    const { message } = await req.json();

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

    console.log(`Processing chat request for user: ${user.id}`);

    // Try to get user's API key first
    const { data: userApiKey, error: userApiKeyError } = await supabaseClient
      .from('user_api_keys')
      .select('openai_api_key')
      .eq('user_id', user.id)
      .maybeSingle();
    
    // Use the user's API key if available, otherwise use the environment variable
    let openAiApiKey = userApiKey?.openai_api_key;
    
    // If no user API key, fall back to environment variable
    if (!openAiApiKey) {
      openAiApiKey = Deno.env.get('OPENAI_API_KEY');
      console.log("Using environment API key");
    } else {
      console.log("Using user's personal API key");
    }
    
    if (!openAiApiKey) {
      console.error("No OpenAI API key available");
      return new Response(
        JSON.stringify({ error: 'API key not configured. Please check your account settings or contact the administrator.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    try {
      // Get current month-year for usage tracking
      const today = new Date();
      const monthYear = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

      // Get the user's subscription tier and usage
      const { data: profileData, error: profileError } = await supabaseClient
        .from('profiles')
        .select('subscription_tier, eq_archetype, coaching_mode')
        .eq('id', user.id)
        .maybeSingle();
      
      // Get user's current month usage
      const { data: usageData, error: usageError } = await supabaseClient
        .from('usage_logs')
        .select('token_count')
        .eq('user_id', user.id)
        .eq('month_year', monthYear)
        .maybeSingle();

      // Prepare system content based on profile or default values
      let archetype = "Not set";
      let coachingMode = "normal";
      let subscriptionTier = "free";
      
      if (!profileError && profileData) {
        archetype = profileData.eq_archetype || "Not set";
        coachingMode = profileData.coaching_mode || "normal";
        subscriptionTier = profileData.subscription_tier || "free";
      } else {
        console.log("No profile data found or error:", profileError);
      }

      // Check if user has exceeded their monthly token limit
      const currentUsage = usageData?.token_count || 0;
      const tierLimit = TIER_LIMITS[subscriptionTier as keyof typeof TIER_LIMITS] || TIER_LIMITS.free;
      
      if (currentUsage >= tierLimit) {
        return new Response(
          JSON.stringify({ 
            error: `You've reached your monthly token limit (${tierLimit} tokens). Please upgrade your plan to continue.`,
            usageLimit: true,
            currentUsage,
            tierLimit
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Create the dynamic personalization header
      const personalizationHeader = 
        `Coaching Mode: ${coachingMode}.\n` +
        `EQ Archetype: ${archetype}.\n`;
      
      // Always use the KAI_SYSTEM_PROMPT as the base, with personalization added
      let systemContent = personalizationHeader + KAI_SYSTEM_PROMPT;
      
      // Prepare messages for OpenAI
      let messages = [
        { role: 'system', content: systemContent },
        { role: 'user', content: message }
      ];
      
      // For premium users, add conversation history as context
      if (subscriptionTier === 'premium') {
        // Get the last 5 messages from chat_logs
        const { data: chatHistory, error: chatHistoryError } = await supabaseClient
          .from('chat_logs')
          .select('content, role')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10);
        
        if (!chatHistoryError && chatHistory && chatHistory.length > 0) {
          // Add previous messages to the conversation context (in correct order)
          const previousMessages = chatHistory
            .reverse()
            .map(msg => ({ role: msg.role, content: msg.content }));
          
          // Insert previous messages between system message and current user message
          messages = [
            messages[0], // System message
            ...previousMessages, // Previous conversation
            messages[1]  // Current user message
          ];
          
          console.log(`Added ${previousMessages.length} previous messages as context for premium user`);
        }
      }
      
      // Use a more affordable and reliable model option
      const modelToUse = "gpt-4o-mini";
      
      console.log(`Calling OpenAI with model: ${modelToUse}`);
      
      // Calculate estimated token count for the input
      const inputText = messages.map(m => m.content).join(' ');
      const estimatedInputTokens = estimateTokenCount(inputText);
      
      // Try to call OpenAI API
      try {
        console.log("Attempting OpenAI API call with API key:", 
                    openAiApiKey ? `${openAiApiKey.substring(0, 5)}...${openAiApiKey.substring(openAiApiKey.length - 5)}` : "No key available");
                    
        // Call OpenAI API
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAiApiKey}`,
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
          
          // Check for quota errors specifically
          if (errorData.error?.type === 'insufficient_quota' || 
              errorData.error?.code === 'insufficient_quota' ||
              errorData.error?.message?.includes('quota')) {
            
            // If this was a user's personal API key, mark it as invalid
            if (userApiKey?.openai_api_key) {
              console.log("User's personal API key has insufficient quota, marking as invalid");
            }
            
            return new Response(
              JSON.stringify({ 
                error: 'OpenAI API quota exceeded. Please check your billing status or contact support.',
                quotaExceeded: true,
                details: errorData.error?.message || 'Your OpenAI account has reached its usage limit or has billing issues.'
              }),
              { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
          
          // Check for invalid API key
          if (errorData.error?.type === 'invalid_request_error' && 
              errorData.error?.message?.includes('API key')) {
            
            // If this was a user's personal API key, mark it as invalid
            if (userApiKey?.openai_api_key) {
              console.log("User's personal API key is invalid");
            }
            
            return new Response(
              JSON.stringify({ 
                error: 'Invalid API key provided. Please check your API key and try again.',
                invalidKey: true,
                details: 'The API key provided was rejected by OpenAI.'
              }),
              { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
          
          throw new Error(errorData.error?.message || 'Error calling OpenAI API');
        }
        
        const completion = await response.json();
        const assistantResponse = completion.choices[0].message.content;

        // Calculate estimated token count for the output
        const estimatedOutputTokens = estimateTokenCount(assistantResponse);
        // Total tokens for this request
        const totalTokensUsed = estimatedInputTokens + estimatedOutputTokens;
        
        // Update usage tracking for all tiers
        await updateUsageTracking(supabaseClient, user.id, monthYear, totalTokensUsed);
        
        // Only log conversations for Premium tier
        if (subscriptionTier === 'premium') {
          // Log user message
          await supabaseClient
            .from('chat_logs')
            .insert({
              user_id: user.id,
              content: message,
              role: 'user',
              token_count: estimatedInputTokens
            });
            
          // Log assistant response
          await supabaseClient
            .from('chat_logs')
            .insert({
              user_id: user.id,
              content: assistantResponse,
              role: 'assistant',
              token_count: estimatedOutputTokens
            });
        }
        
        return new Response(
          JSON.stringify({ 
            response: assistantResponse,
            usage: {
              currentUsage: currentUsage + totalTokensUsed,
              limit: tierLimit,
              tokensUsed: totalTokensUsed
            }
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
        
      } catch (openAIError) {
        // Log the specific OpenAI error for troubleshooting
        console.error("Error with OpenAI call:", openAIError);
        
        // Check if it's a quota error based on the error message
        if (openAIError.message?.includes('quota') || 
            openAIError.message?.includes('exceeded') || 
            openAIError.message?.includes('billing')) {
          return new Response(
            JSON.stringify({ 
              error: 'OpenAI API quota exceeded. Please check your billing status or contact support.',
              quotaExceeded: true,
              details: openAIError.message
            }),
            { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        throw openAIError;  // Re-throw for general error handling
      }
      
    } catch (processError) {
      console.error("Error processing request:", processError);
      
      return new Response(
        JSON.stringify({ 
          error: "Failed to process your message. Our team has been notified.",
          details: processError.message
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.error('Error in chat completion function:', error);
    return new Response(
      JSON.stringify({ 
        error: "An unexpected error occurred processing your request.",
        details: error.message || "No specific details available" 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Helper function to update usage tracking
async function updateUsageTracking(supabaseClient: any, userId: string, monthYear: string, tokenCount: number) {
  // Try to update existing record
  const { data, error } = await supabaseClient
    .from('usage_logs')
    .select('id, token_count')
    .eq('user_id', userId)
    .eq('month_year', monthYear)
    .maybeSingle();
    
  if (error) {
    console.error("Error fetching usage:", error);
    return;
  }
  
  if (data) {
    // Update existing record
    await supabaseClient
      .from('usage_logs')
      .update({ 
        token_count: data.token_count + tokenCount,
        updated_at: new Date().toISOString()
      })
      .eq('id', data.id);
  } else {
    // Insert new record
    await supabaseClient
      .from('usage_logs')
      .insert({
        user_id: userId,
        month_year: monthYear,
        token_count: tokenCount
      });
  }
}

