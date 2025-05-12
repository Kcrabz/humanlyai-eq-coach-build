
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

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
    // Get query and user ID from request
    const { query, userId } = await req.json();
    
    if (!query || !userId) {
      return new Response(JSON.stringify({ error: "Missing required parameters" }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Connect to Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Supabase credentials not found");
    }
    
    const supabaseClient = createClient(
      supabaseUrl,
      supabaseServiceKey
    );
    
    // Get user's subscription tier
    const { data: userData, error: userError } = await supabaseClient
      .from('profiles')
      .select('subscription_tier')
      .eq('id', userId)
      .single();
      
    if (userError || !userData) {
      throw new Error("Error retrieving user data");
    }
    
    // Free users don't have memories
    if (userData.subscription_tier === 'free') {
      return new Response(JSON.stringify({ 
        hasRelevantMemories: false,
        count: 0
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Generate embedding for the query
    const openAiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openAiApiKey) {
      throw new Error("OpenAI API key not found");
    }
    
    const embeddingResponse = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openAiApiKey}`
      },
      body: JSON.stringify({
        input: query,
        model: "text-embedding-3-small"
      })
    });
    
    if (!embeddingResponse.ok) {
      const errorData = await embeddingResponse.json();
      console.error("OpenAI embedding API error:", errorData);
      throw new Error("Error generating embedding");
    }
    
    const embeddingData = await embeddingResponse.json();
    const queryEmbedding = embeddingData.data[0].embedding;
    
    // Calculate cutoff date based on tier
    const cutoffDate = new Date();
    if (userData.subscription_tier === 'basic') {
      cutoffDate.setDate(cutoffDate.getDate() - 30); // 30 days for basic
    } else {
      cutoffDate.setDate(cutoffDate.getDate() - 90); // 90 days for premium
    }
    
    // Get limit based on tier
    const retrievalCount = userData.subscription_tier === 'premium' ? 10 : 5;
    
    // Get memories using vector similarity search
    const { data, error } = await supabaseClient.rpc(
      'match_memories',
      {
        query_embedding: queryEmbedding,
        match_threshold: 0.7, // Minimum similarity threshold
        match_count: retrievalCount,
        user_id_param: userId,
        cutoff_date_param: cutoffDate.toISOString()
      }
    );
    
    if (error) {
      throw new Error("Error retrieving memories: " + error.message);
    }
    
    // Count memory types
    const memories = data || [];
    const topicCount = memories.filter(m => m.type === 'topic').length;
    const insightCount = memories.filter(m => m.type === 'insight' || m.type === 'breakthrough').length;
    const messageCount = memories.length - topicCount - insightCount;
    
    return new Response(JSON.stringify({
      hasRelevantMemories: memories.length > 0,
      count: memories.length,
      topicCount,
      insightCount,
      messageCount
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error("Error in check-memories function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
