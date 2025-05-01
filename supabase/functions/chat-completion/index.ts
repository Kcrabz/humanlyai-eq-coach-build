
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

// CORS headers for all responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// The enhanced system prompt
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

// Token limits per subscription tier
const TIER_LIMITS = {
  free: 15000,     // Free trial
  basic: 105000,   // Basic tier
  premium: 245000  // Premium tier
};

// Utility to count tokens (simple approximation)
function estimateTokenCount(text: string): number {
  return Math.ceil(text.length / 4);
}

// Helper function to handle OPTIONS requests
function handleOptionsRequest() {
  return new Response(null, { headers: corsHeaders });
}

// Helper function to create error responses
function createErrorResponse(message: string, status = 500, additionalData = {}) {
  return new Response(
    JSON.stringify({ 
      error: message,
      ...additionalData 
    }),
    { 
      status, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}

// Create Supabase client with auth context
function createSupabaseClient(req: Request) {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    { 
      global: { headers: { Authorization: req.headers.get('Authorization')! } },
      auth: { persistSession: false }
    }
  );
}

// Helper function to get authenticated user
async function getAuthenticatedUser(supabaseClient: any) {
  const { data: { user }, error } = await supabaseClient.auth.getUser();
  
  if (error || !user) {
    throw new Error('Unauthorized');
  }
  
  return user;
}

// Get the API key to use (user's personal or environment)
async function getOpenAIApiKey(supabaseClient: any, userId: string) {
  console.log(`Getting API key for user: ${userId}`);
  
  // Try to get user's API key first
  const { data: userApiKey, error: userApiKeyError } = await supabaseClient
    .from('user_api_keys')
    .select('openai_api_key')
    .eq('user_id', userId)
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
    throw new Error('API key not configured. Please check your account settings or contact the administrator.');
  }
  
  return openAiApiKey;
}

// Get user's subscription tier and usage data
async function getUserProfileAndUsage(supabaseClient: any, userId: string) {
  // Get current month-year for usage tracking
  const today = new Date();
  const monthYear = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

  // Get the user's subscription tier and profile data
  const { data: profileData, error: profileError } = await supabaseClient
    .from('profiles')
    .select('subscription_tier, eq_archetype, coaching_mode')
    .eq('id', userId)
    .maybeSingle();
  
  // Get user's current month usage
  const { data: usageData, error: usageError } = await supabaseClient
    .from('usage_logs')
    .select('token_count')
    .eq('user_id', userId)
    .eq('month_year', monthYear)
    .maybeSingle();

  // Set default values if no data found
  const archetype = profileData?.eq_archetype || "Not set";
  const coachingMode = profileData?.coaching_mode || "normal";
  const subscriptionTier = profileData?.subscription_tier || "free";
  const currentUsage = usageData?.token_count || 0;

  return {
    archetype,
    coachingMode,
    subscriptionTier,
    currentUsage,
    monthYear
  };
}

// Check if user has exceeded their monthly token limit
function checkUsageLimit(currentUsage: number, subscriptionTier: string) {
  const tierLimit = TIER_LIMITS[subscriptionTier as keyof typeof TIER_LIMITS] || TIER_LIMITS.free;
  
  if (currentUsage >= tierLimit) {
    throw {
      type: 'usage_limit',
      message: `You've reached your monthly token limit (${tierLimit} tokens). Please upgrade your plan to continue.`,
      currentUsage,
      tierLimit
    };
  }
  
  return tierLimit;
}

// Prepare messages for OpenAI API
function prepareMessages(message: string, archetype: string, coachingMode: string, chatHistory: any[] = []) {
  // Create the dynamic personalization header
  const personalizationHeader = 
    `Coaching Mode: ${coachingMode}.\n` +
    `EQ Archetype: ${archetype}.\n`;
  
  // Always use the KAI_SYSTEM_PROMPT as the base, with personalization added
  const systemContent = personalizationHeader + KAI_SYSTEM_PROMPT;
  
  // Base messages with system prompt and current user message
  let messages = [
    { role: 'system', content: systemContent },
    { role: 'user', content: message }
  ];
  
  // If we have chat history, add it between system message and current user message
  if (chatHistory && chatHistory.length > 0) {
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
    
    console.log(`Added ${previousMessages.length} previous messages as context`);
  }
  
  return messages;
}

// Call OpenAI API with streaming support
async function* streamOpenAI(openAiApiKey: string, messages: any[]) {
  console.log("Streaming from OpenAI with model: gpt-4o-mini");
  
  try {
    // Call OpenAI API with streaming enabled
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: messages,
        max_tokens: 500,
        stream: true
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenAI API error:", errorData);
      
      // Check for different error types
      if (errorData.error?.type === 'insufficient_quota' || 
          errorData.error?.code === 'insufficient_quota' ||
          errorData.error?.message?.includes('quota')) {
        
        throw {
          type: 'quota_exceeded',
          message: 'OpenAI API quota exceeded. Please check your billing status or contact support.',
          details: errorData.error?.message || 'Your OpenAI account has reached its usage limit or has billing issues.'
        };
      }
      
      if (errorData.error?.type === 'invalid_request_error' && 
          errorData.error?.message?.includes('API key')) {
        
        throw {
          type: 'invalid_key',
          message: 'Invalid API key provided. Please check your API key and try again.',
          details: 'The API key provided was rejected by OpenAI.'
        };
      }
      
      throw new Error(errorData.error?.message || 'Error calling OpenAI API');
    }
    
    // Process the stream
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("Failed to get reader from response");
    }
    
    const decoder = new TextDecoder();
    let buffer = "";
    let completeResponse = "";
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      // Decode chunk
      const chunk = decoder.decode(value);
      buffer += chunk;
      
      // Process all complete lines in buffer
      let lines = buffer.split('\n');
      buffer = lines.pop() || ""; // Keep the last incomplete line in buffer
      
      for (const line of lines) {
        if (line.trim() === '') continue;
        if (line.trim() === 'data: [DONE]') continue;
        
        // Extract data portion
        const dataMatch = line.match(/^data: (.*)$/);
        if (!dataMatch) continue;
        
        try {
          const json = JSON.parse(dataMatch[1]);
          const contentDelta = json.choices[0]?.delta?.content || '';
          if (contentDelta) {
            completeResponse += contentDelta;
            yield contentDelta;
          }
        } catch (e) {
          console.error("Error parsing streaming JSON:", e);
        }
      }
    }
    
    return completeResponse;
  } catch (error) {
    // Rethrow if it's already our custom error format
    if (error.type) {
      throw error;
    }
    
    // Check for quota errors in the error message
    if (error.message?.includes('quota') || 
        error.message?.includes('exceeded') || 
        error.message?.includes('billing')) {
      throw {
        type: 'quota_exceeded',
        message: 'OpenAI API quota exceeded. Please check your billing status or contact support.',
        details: error.message
      };
    }
    
    throw new Error(`OpenAI API error: ${error.message}`);
  }
}

// Call OpenAI API (non-streaming version for fallback)
async function callOpenAI(openAiApiKey: string, messages: any[]) {
  console.log("Calling OpenAI with model: gpt-4o-mini");
  
  try {
    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: messages,
        max_tokens: 500
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenAI API error:", errorData);
      
      // Check for different error types
      if (errorData.error?.type === 'insufficient_quota' || 
          errorData.error?.code === 'insufficient_quota' ||
          errorData.error?.message?.includes('quota')) {
        
        throw {
          type: 'quota_exceeded',
          message: 'OpenAI API quota exceeded. Please check your billing status or contact support.',
          details: errorData.error?.message || 'Your OpenAI account has reached its usage limit or has billing issues.'
        };
      }
      
      if (errorData.error?.type === 'invalid_request_error' && 
          errorData.error?.message?.includes('API key')) {
        
        throw {
          type: 'invalid_key',
          message: 'Invalid API key provided. Please check your API key and try again.',
          details: 'The API key provided was rejected by OpenAI.'
        };
      }
      
      throw new Error(errorData.error?.message || 'Error calling OpenAI API');
    }
    
    const completion = await response.json();
    return completion.choices[0].message.content;
  } catch (error) {
    // Rethrow if it's already our custom error format
    if (error.type) {
      throw error;
    }
    
    // Check for quota errors in the error message
    if (error.message?.includes('quota') || 
        error.message?.includes('exceeded') || 
        error.message?.includes('billing')) {
      throw {
        type: 'quota_exceeded',
        message: 'OpenAI API quota exceeded. Please check your billing status or contact support.',
        details: error.message
      };
    }
    
    throw new Error(`OpenAI API error: ${error.message}`);
  }
}

// Update usage tracking in the database
async function updateUsageTracking(supabaseClient: any, userId: string, monthYear: string, tokenCount: number) {
  try {
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
  } catch (error) {
    console.error("Error updating usage tracking:", error);
  }
}

// Log chat messages for premium users
async function logChatMessages(supabaseClient: any, userId: string, userMessage: string, assistantResponse: string, estimatedInputTokens: number, estimatedOutputTokens: number) {
  try {
    // Log user message
    await supabaseClient
      .from('chat_logs')
      .insert({
        user_id: userId,
        content: userMessage,
        role: 'user',
        token_count: estimatedInputTokens
      });
      
    // Log assistant response
    await supabaseClient
      .from('chat_logs')
      .insert({
        user_id: userId,
        content: assistantResponse,
        role: 'assistant',
        token_count: estimatedOutputTokens
      });
  } catch (error) {
    console.error("Error logging chat messages:", error);
  }
}

// Stream handler for chat completion
async function handleStreamingChatCompletion(req: Request) {
  const supabaseClient = createSupabaseClient(req);
  
  try {
    // Get authenticated user
    const user = await getAuthenticatedUser(supabaseClient);
    console.log(`Processing streaming chat request for user: ${user.id}`);
    
    // Extract user message from request
    const { message } = await req.json();
    
    // Get OpenAI API key
    const openAiApiKey = await getOpenAIApiKey(supabaseClient, user.id);
    
    // Get user profile and usage data
    const { 
      archetype, 
      coachingMode, 
      subscriptionTier, 
      currentUsage, 
      monthYear 
    } = await getUserProfileAndUsage(supabaseClient, user.id);
    
    // Check usage limits
    const tierLimit = checkUsageLimit(currentUsage, subscriptionTier);
    
    // Get chat history for premium users
    let chatHistory = [];
    if (subscriptionTier === 'premium') {
      // Get the last 10 messages from chat_logs
      const { data: chatHistoryData, error: chatHistoryError } = await supabaseClient
        .from('chat_logs')
        .select('content, role')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (!chatHistoryError && chatHistoryData) {
        chatHistory = chatHistoryData;
        console.log(`Retrieved ${chatHistory.length} previous messages for premium user`);
      }
    }
    
    // Prepare messages for OpenAI
    const messages = prepareMessages(message, archetype, coachingMode, chatHistory);
    
    // Calculate estimated token count for input
    const inputText = messages.map(m => m.content).join(' ');
    const estimatedInputTokens = estimateTokenCount(inputText);
    
    // Create a transformer to handle the streaming response
    const encoder = new TextEncoder();
    let fullResponse = "";
    
    // Set up streaming response
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();
    
    // Process the streaming response
    (async () => {
      try {
        // Send initial data packet with message info
        const initialData = {
          type: 'init',
          message: 'Stream initialized'
        };
        await writer.write(encoder.encode(`data: ${JSON.stringify(initialData)}\n\n`));
        
        // Process streaming responses
        for await (const chunk of streamOpenAI(openAiApiKey, messages)) {
          // Add each chunk to the full response
          fullResponse += chunk;
          
          // Send chunk to client
          const chunkData = {
            type: 'chunk',
            content: chunk
          };
          await writer.write(encoder.encode(`data: ${JSON.stringify(chunkData)}\n\n`));
        }
        
        // Calculate estimated token count for output
        const estimatedOutputTokens = estimateTokenCount(fullResponse);
        const totalTokensUsed = estimatedInputTokens + estimatedOutputTokens;
        
        // Update usage tracking
        await updateUsageTracking(supabaseClient, user.id, monthYear, totalTokensUsed);
        
        // Log chat messages for premium users
        if (subscriptionTier === 'premium') {
          await logChatMessages(
            supabaseClient, 
            user.id, 
            message, 
            fullResponse, 
            estimatedInputTokens, 
            estimatedOutputTokens
          );
        }
        
        // Send completion message with usage info
        const completionData = {
          type: 'complete',
          usage: {
            currentUsage: currentUsage + totalTokensUsed,
            limit: tierLimit,
            tokensUsed: totalTokensUsed
          }
        };
        await writer.write(encoder.encode(`data: ${JSON.stringify(completionData)}\n\n`));
      } catch (error) {
        console.error('Error in streaming:', error);
        
        // Send error message to client
        const errorData = {
          type: 'error',
          error: error.message || 'Unknown error',
          details: error
        };
        await writer.write(encoder.encode(`data: ${JSON.stringify(errorData)}\n\n`));
      } finally {
        await writer.close();
      }
    })();
    
    // Return the stream response
    return new Response(stream.readable, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    });
  } catch (error) {
    console.error('Error in streaming chat completion:', error);
    
    // Handle specific error types
    if (error.type === 'usage_limit') {
      return createErrorResponse(
        error.message,
        402,
        { 
          usageLimit: true,
          currentUsage: error.currentUsage,
          tierLimit: error.tierLimit
        }
      );
    }
    
    if (error.type === 'quota_exceeded') {
      return createErrorResponse(
        error.message,
        429,
        { 
          quotaExceeded: true,
          details: error.details
        }
      );
    }
    
    if (error.type === 'invalid_key') {
      return createErrorResponse(
        error.message,
        401,
        { 
          invalidKey: true,
          details: error.details
        }
      );
    }
    
    if (error.message === 'Unauthorized') {
      return createErrorResponse('Unauthorized', 401);
    }
    
    // Generic error response
    return createErrorResponse(
      "An unexpected error occurred processing your request.",
      500,
      { details: error.message || "No specific details available" }
    );
  }
}

// Non-streaming handler for chat completion (fallback)
async function handleChatCompletion(req: Request) {
  const supabaseClient = createSupabaseClient(req);
  
  try {
    // Get authenticated user
    const user = await getAuthenticatedUser(supabaseClient);
    console.log(`Processing chat request for user: ${user.id}`);
    
    // Extract user message from request
    const { message, stream } = await req.json();
    
    // If streaming is requested, use the streaming handler
    if (stream === true) {
      return handleStreamingChatCompletion(req);
    }
    
    // Get OpenAI API key
    const openAiApiKey = await getOpenAIApiKey(supabaseClient, user.id);
    
    // Get user profile and usage data
    const { 
      archetype, 
      coachingMode, 
      subscriptionTier, 
      currentUsage, 
      monthYear 
    } = await getUserProfileAndUsage(supabaseClient, user.id);
    
    // Check usage limits
    const tierLimit = checkUsageLimit(currentUsage, subscriptionTier);
    
    // Get chat history for premium users
    let chatHistory = [];
    if (subscriptionTier === 'premium') {
      // Get the last 10 messages from chat_logs
      const { data: chatHistoryData, error: chatHistoryError } = await supabaseClient
        .from('chat_logs')
        .select('content, role')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (!chatHistoryError && chatHistoryData) {
        chatHistory = chatHistoryData;
        console.log(`Retrieved ${chatHistory.length} previous messages for premium user`);
      }
    }
    
    // Prepare messages for OpenAI
    const messages = prepareMessages(message, archetype, coachingMode, chatHistory);
    
    // Calculate estimated token count for input
    const inputText = messages.map(m => m.content).join(' ');
    const estimatedInputTokens = estimateTokenCount(inputText);
    
    // Make OpenAI API call
    const assistantResponse = await callOpenAI(openAiApiKey, messages);
    
    // Calculate estimated token count for output
    const estimatedOutputTokens = estimateTokenCount(assistantResponse);
    const totalTokensUsed = estimatedInputTokens + estimatedOutputTokens;
    
    // Update usage tracking
    await updateUsageTracking(supabaseClient, user.id, monthYear, totalTokensUsed);
    
    // Log chat messages for premium users
    if (subscriptionTier === 'premium') {
      await logChatMessages(
        supabaseClient, 
        user.id, 
        message, 
        assistantResponse, 
        estimatedInputTokens, 
        estimatedOutputTokens
      );
    }
    
    // Return successful response
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
    
  } catch (error) {
    console.error('Error in chat completion function:', error);
    
    // Handle specific error types
    if (error.type === 'usage_limit') {
      return createErrorResponse(
        error.message,
        402,
        { 
          usageLimit: true,
          currentUsage: error.currentUsage,
          tierLimit: error.tierLimit
        }
      );
    }
    
    if (error.type === 'quota_exceeded') {
      return createErrorResponse(
        error.message,
        429,
        { 
          quotaExceeded: true,
          details: error.details
        }
      );
    }
    
    if (error.type === 'invalid_key') {
      return createErrorResponse(
        error.message,
        401,
        { 
          invalidKey: true,
          details: error.details
        }
      );
    }
    
    if (error.message === 'Unauthorized') {
      return createErrorResponse('Unauthorized', 401);
    }
    
    // Generic error response
    return createErrorResponse(
      "An unexpected error occurred processing your request.",
      500,
      { details: error.message || "No specific details available" }
    );
  }
}

// Main entry point
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return handleOptionsRequest();
  }

  try {
    // Check for streaming request via content-type or accept header
    const contentType = req.headers.get('content-type') || '';
    const acceptHeader = req.headers.get('accept') || '';
    const wantsStream = 
      contentType.includes('text/event-stream') || 
      acceptHeader.includes('text/event-stream');
    
    if (wantsStream) {
      return handleStreamingChatCompletion(req);
    } else {
      return handleChatCompletion(req);
    }
  } catch (error) {
    console.error('Unhandled error in chat completion function:', error);
    return createErrorResponse(
      "An unexpected error occurred processing your request.",
      500,
      { details: error.message || "No specific details available" }
    );
  }
});
