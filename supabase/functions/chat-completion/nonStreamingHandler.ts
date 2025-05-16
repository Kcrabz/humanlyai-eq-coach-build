
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { corsHeaders, createErrorResponse } from "./utils.ts";
import { prepareUserData, getChatHistory } from "./userService.ts";
import { extractUserMessage, prepareMessagesForAI, calculateTokenUsage } from "./messageService.ts";
import { 
  retrieveRelevantMemories, 
  formatMemoriesForContext, 
  storeMemory, 
  extractInsightsFromMessages,
  pruneOldMemories
} from "./memoryService.ts";

// Handler for non-streaming chat completion
export async function handleChatCompletion(req: Request, reqBody: any) {
  try {
    // Get user data and settings
    const {
      supabaseClient,
      user,
      openAiApiKey,
      effectiveArchetype,
      effectiveCoachingMode,
      effectiveSubscriptionTier,
      effectivePrimaryTopic,
      currentUsage,
      tierLimit,
      monthYear
    } = await prepareUserData(req, reqBody);
    
    // Extract message from request
    const { userMessage, clientProvidedHistory } = await extractUserMessage(reqBody);
    
    // Get chat history based on subscription tier
    const chatHistory = await getChatHistory(
      supabaseClient, 
      user.id, 
      effectiveSubscriptionTier,
      clientProvidedHistory
    );

    console.log(`Using ${effectiveArchetype} archetype and ${effectiveCoachingMode} coaching mode`);
    console.log(`User has used ${currentUsage} out of ${tierLimit} tokens this month`);
    
    // Retrieve relevant memories based on user's subscription tier
    let relevantMemories = [];
    if (effectiveSubscriptionTier !== 'free') {
      console.log(`Retrieving memories for ${effectiveSubscriptionTier} tier user`);
      relevantMemories = await retrieveRelevantMemories(
        supabaseClient,
        user.id,
        userMessage,
        effectiveSubscriptionTier
      );
      console.log(`Retrieved ${relevantMemories.length} relevant memories`);
    }
    
    // Prepare memories context string
    const memoriesContext = formatMemoriesForContext(relevantMemories);
    
    // Prepare messages for OpenAI
    const messages = prepareMessagesForAI(
      userMessage, 
      effectiveArchetype, 
      effectiveCoachingMode, 
      chatHistory,
      user.id
    );
    
    // If we have relevant memories, add them to the system message
    if (memoriesContext) {
      // Find the system message
      const systemMessageIndex = messages.findIndex(m => m.role === 'system');
      if (systemMessageIndex >= 0) {
        // Append memories context to the system message
        messages[systemMessageIndex].content += memoriesContext;
      }
    }
    
    // Call OpenAI API
    const openAIResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openAiApiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1-turbo",
        messages,
      }),
    });

    if (!openAIResponse.ok) {
      const errorData = await openAIResponse.json();
      console.error("OpenAI API error:", errorData);
      
      // Handle quota exceeded errors specifically
      if (openAIResponse.status === 429) {
        return createErrorResponse(
          "OpenAI API quota exceeded. Please check your account.",
          429,
          { details: errorData.error?.message || "Rate limit or quota reached" }
        );
      }
      
      return createErrorResponse(
        "Error calling OpenAI API",
        openAIResponse.status,
        { details: errorData.error?.message || "No specific details available" }
      );
    }
    
    const data = await openAIResponse.json();
    const responseText = data.choices[0].message.content;
    
    // Calculate token usage
    const usage = calculateTokenUsage(messages, responseText);
    
    // Track token usage even for free users (but don't count against limits)
    const newUsage = currentUsage + usage.totalTokens;
    console.log(`Tracking token usage: ${currentUsage} + ${usage.totalTokens} = ${newUsage}`);
    
    // Update usage tracking in database even for free users
    // This ensures we have consistent usage data for all user types
    const { error: usageError } = await supabaseClient
      .from("usage_logs")
      .upsert({
        user_id: user.id,
        month_year: monthYear,
        token_count: newUsage,
        updated_at: new Date().toISOString()
      });
    
    if (usageError) {
      console.error("Error updating usage:", usageError);
    } else {
      console.log(`Successfully updated usage for user ${user.id}`);
    }
    
    // Store messages in database for all users
    // This helps us track message history regardless of subscription tier
    const { error: msgError } = await supabaseClient
      .from("chat_messages")
      .insert([
        {
          user_id: user.id,
          content: userMessage,
          role: 'user',
        },
        {
          user_id: user.id,
          content: responseText,
          role: 'assistant',
        }
      ]);
    
    if (msgError) {
      console.error("Error storing messages:", msgError);
    }
    
    // For basic and premium tiers, store message in memory system for RAG
    if (effectiveSubscriptionTier !== 'free') {
      try {
        // Store user message
        await storeMemory(
          supabaseClient, 
          user.id, 
          userMessage, 
          'message'
        );
        
        // For premium users, also extract insights
        if (effectiveSubscriptionTier === 'premium') {
          // Extract and store insights in the background
          // This won't block the response
          extractInsightsFromMessages(
            supabaseClient, 
            user.id, 
            [...chatHistory, {role: 'user', content: userMessage}, {role: 'assistant', content: responseText}]
          );
          
          // Periodically clean up old memories
          pruneOldMemories(supabaseClient, user.id, effectiveSubscriptionTier);
        }
      } catch (memoryError) {
        console.error("Error storing memory:", memoryError);
        // Don't fail the request if memory storage fails
      }
    }
    
    // Return the response
    return new Response(
      JSON.stringify({
        response: responseText,
        usage: {
          currentUsage: newUsage,
          limit: tierLimit,
          thisRequest: usage.totalTokens
        }
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in chat completion:", error);
    return createErrorResponse(
      error.message || "Error processing chat completion",
      500
    );
  }
}
