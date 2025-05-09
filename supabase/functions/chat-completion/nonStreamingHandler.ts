
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { corsHeaders, createErrorResponse } from "./utils.ts";
import { prepareUserData, getChatHistory } from "./userService.ts";
import { extractUserMessage, prepareMessagesForAI, calculateTokenUsage } from "./messageService.ts";

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
    
    // Prepare messages for OpenAI
    const messages = prepareMessagesForAI(
      userMessage, 
      effectiveArchetype, 
      effectiveCoachingMode, 
      chatHistory,
      user.id
    );
    
    // Call OpenAI API
    const openAIResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openAiApiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4-turbo",
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
