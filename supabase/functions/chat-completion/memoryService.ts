
// Memory service for RAG implementation in Kai
// This handles vector embeddings and memory retrieval based on user subscription tier

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

// Define memory retrieval limits by subscription tier
const MEMORY_LIMITS = {
  free: {
    maxMemories: 5,
    maxAge: 7, // 7 days retention for free users
    retrievalCount: 3,
  },
  basic: {
    maxMemories: 20,
    maxAge: 30, // 30 days retention for basic users
    retrievalCount: 5,
  },
  premium: {
    maxMemories: 100,
    maxAge: 90, // 90 days retention for premium users
    retrievalCount: 10,
  }
};

// Types for memory entries
interface Memory {
  id: string;
  user_id: string;
  content: string;
  embedding: number[];
  created_at: string;
  relevance_score?: number;
  type: 'message' | 'insight' | 'breakthrough' | 'topic';
  metadata?: {
    topic?: string;
    sentiment?: string;
    importance?: number;
    source_message_id?: string;
  };
}

/**
 * Store a memory with embedding for future retrieval
 */
export async function storeMemory(
  supabaseClient: any,
  userId: string,
  content: string,
  memoryType: Memory['type'] = 'message',
  metadata: Memory['metadata'] = {}
): Promise<string | null> {
  try {
    // Generate embedding via OpenAI
    const embedding = await generateEmbedding(content);
    
    if (!embedding) {
      console.error("Failed to generate embedding for memory");
      return null;
    }
    
    // Store in memories table with embedding
    const { data, error } = await supabaseClient
      .from('user_memories')
      .insert({
        user_id: userId,
        content: content,
        embedding: embedding,
        type: memoryType,
        metadata: metadata
      })
      .select('id')
      .single();
      
    if (error) {
      console.error("Error storing memory:", error);
      return null;
    }
    
    return data.id;
  } catch (error) {
    console.error("Exception in storeMemory:", error);
    return null;
  }
}

/**
 * Retrieve relevant memories based on similarity to current query
 */
export async function retrieveRelevantMemories(
  supabaseClient: any,
  userId: string, 
  query: string,
  subscriptionTier: string = 'free'
): Promise<Memory[]> {
  try {
    // Get tier limitations
    const limits = MEMORY_LIMITS[subscriptionTier] || MEMORY_LIMITS.free;
    
    // Generate embedding for the query
    const queryEmbedding = await generateEmbedding(query);
    
    if (!queryEmbedding) {
      console.error("Failed to generate query embedding");
      return [];
    }
    
    // Calculate retention period based on tier
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - limits.maxAge);
    
    // Get memories using vector similarity search
    const { data, error } = await supabaseClient.rpc(
      'match_memories',
      {
        query_embedding: queryEmbedding,
        match_threshold: 0.7, // Minimum similarity threshold (0-1)
        match_count: limits.retrievalCount,
        user_id_param: userId,
        cutoff_date_param: cutoffDate.toISOString()
      }
    );
    
    if (error) {
      console.error("Error retrieving memories:", error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error("Exception in retrieveRelevantMemories:", error);
    return [];
  }
}

/**
 * Generate embeddings for text using OpenAI
 */
async function generateEmbedding(text: string): Promise<number[] | null> {
  try {
    const openAiApiKey = Deno.env.get("OPENAI_API_KEY");
    
    if (!openAiApiKey) {
      console.error("OpenAI API key not found");
      return null;
    }
    
    // Trim and clean the text
    const cleanedText = text.trim().replace(/\n+/g, " ");
    
    const response = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openAiApiKey}`
      },
      body: JSON.stringify({
        input: cleanedText,
        model: "text-embedding-3-small" // Use the most efficient embedding model
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenAI embedding API error:", errorData);
      return null;
    }
    
    const data = await response.json();
    return data.data[0].embedding;
  } catch (error) {
    console.error("Error generating embedding:", error);
    return null;
  }
}

/**
 * Format retrieved memories for inclusion in prompt
 */
export function formatMemoriesForContext(memories: Memory[]): string {
  if (!memories.length) return '';
  
  let formattedMemories = "\n\n📚 RELEVANT USER CONTEXT:\n";
  
  // Group memories by type for better organization
  const messageMemories = memories.filter(m => m.type === 'message');
  const insightMemories = memories.filter(m => m.type === 'insight' || m.type === 'breakthrough');
  const topicMemories = memories.filter(m => m.type === 'topic');
  
  // Add past messages if available
  if (messageMemories.length > 0) {
    formattedMemories += "📝 Related past messages:\n";
    messageMemories.forEach(memory => {
      formattedMemories += `- "${memory.content}"\n`;
    });
  }
  
  // Add insights if available
  if (insightMemories.length > 0) {
    formattedMemories += "\n🔍 Previous insights/breakthroughs:\n";
    insightMemories.forEach(memory => {
      formattedMemories += `- ${memory.content}\n`;
    });
  }
  
  // Add topics if available
  if (topicMemories.length > 0) {
    formattedMemories += "\n🏷️ Recurring topics:\n";
    topicMemories.forEach(memory => {
      const topic = memory.metadata?.topic || memory.content;
      formattedMemories += `- ${topic}\n`;
    });
  }
  
  // Add guidance for AI on how to use this context
  formattedMemories += "\nREMEMBER: Use these past interactions to provide more personalized and contextually relevant coaching. Reference previous insights when appropriate, but don't force connections that aren't relevant.";
  
  return formattedMemories;
}

/**
 * Extract insights from messages to store as memories
 */
export async function extractInsightsFromMessages(
  supabaseClient: any,
  userId: string,
  messages: any[]
): Promise<void> {
  try {
    // Only process for basic and premium tiers
    const { data: userData } = await supabaseClient
      .from('profiles')
      .select('subscription_tier')
      .eq('id', userId)
      .single();
      
    if (!userData || userData.subscription_tier === 'free') {
      return; // Skip insight extraction for free tier
    }
    
    // Get last assistant message
    const assistantMessages = messages.filter(m => m.role === 'assistant');
    if (assistantMessages.length === 0) return;
    
    const lastAssistantMessage = assistantMessages[assistantMessages.length - 1];
    
    // Get previous user message
    const userMessages = messages.filter(m => m.role === 'user');
    if (userMessages.length === 0) return;
    
    const lastUserMessage = userMessages[userMessages.length - 1];
    
    // For premium users, analyze assistant response for insights
    if (userData.subscription_tier === 'premium') {
      const openAiApiKey = Deno.env.get("OPENAI_API_KEY");
      if (!openAiApiKey) return;
      
      // Use OpenAI to extract insights
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${openAiApiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: "Extract 1-2 key insights or lessons from this exchange between user and AI coach. Format as concise statements."
            },
            {
              role: "user", 
              content: `User: ${lastUserMessage.content}\n\nCoach: ${lastAssistantMessage.content}`
            }
          ],
          max_tokens: 150
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        const insights = data.choices[0].message.content;
        
        // Store insight as a memory
        await storeMemory(
          supabaseClient, 
          userId, 
          insights, 
          'insight', 
          { source_message_id: lastUserMessage.id, importance: 0.8 }
        );
      }
    } else {
      // For basic tier, just store a simplified version of the message
      const simplifiedContent = lastUserMessage.content.length > 100 
        ? lastUserMessage.content.substring(0, 100) + "..." 
        : lastUserMessage.content;
        
      await storeMemory(
        supabaseClient,
        userId,
        simplifiedContent,
        'message',
        { source_message_id: lastUserMessage.id }
      );
    }
  } catch (error) {
    console.error("Error extracting insights:", error);
  }
}

/**
 * Clean up old memories based on subscription tier limits
 */
export async function pruneOldMemories(supabaseClient: any, userId: string, subscriptionTier: string = 'free'): Promise<void> {
  try {
    const limits = MEMORY_LIMITS[subscriptionTier] || MEMORY_LIMITS.free;
    
    // Calculate cutoff date
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - limits.maxAge);
    
    // Delete memories older than the retention period
    const { error } = await supabaseClient
      .from('user_memories')
      .delete()
      .eq('user_id', userId)
      .lt('created_at', cutoffDate.toISOString());
      
    if (error) {
      console.error("Error pruning old memories:", error);
    }
    
    // If approaching memory limit, delete lowest relevance memories
    const { data: countData } = await supabaseClient
      .from('user_memories')
      .select('id', { count: 'exact' })
      .eq('user_id', userId);
      
    const memoryCount = countData.count;
    
    if (memoryCount > limits.maxMemories * 0.9) { // If over 90% of limit
      // Get list of memories sorted by relevance/importance
      const { data: memories } = await supabaseClient
        .from('user_memories')
        .select('id, metadata')
        .eq('user_id', userId)
        .order('created_at', { ascending: true }) // Oldest first
        .limit(memoryCount - limits.maxMemories + 10); // Get enough to reduce below limit
        
      if (memories && memories.length > 0) {
        // Sort by importance if available, otherwise just use oldest
        const memoriesToDelete = memories
          .sort((a, b) => {
            const importanceA = a.metadata?.importance || 0;
            const importanceB = b.metadata?.importance || 0;
            return importanceA - importanceB;
          })
          .slice(0, memoryCount - limits.maxMemories)
          .map(m => m.id);
          
        // Delete the least important memories
        if (memoriesToDelete.length > 0) {
          await supabaseClient
            .from('user_memories')
            .delete()
            .in('id', memoriesToDelete);
        }
      }
    }
  } catch (error) {
    console.error("Error during memory pruning:", error);
  }
}
