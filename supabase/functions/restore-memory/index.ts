
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Function to generate embeddings (copied from memoryService)
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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get data from request
    const { userId, content, memoryType, metadata } = await req.json();
    
    if (!userId || !content || !memoryType) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
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
    
    // Generate embedding for memory content
    const embedding = await generateEmbedding(content);
    
    if (!embedding) {
      throw new Error("Failed to generate embedding for memory");
    }
    
    // Insert memory back into vector store
    const { data, error } = await supabaseClient
      .rpc('insert_memory', {
        p_user_id: userId,
        p_content: content,
        p_type: memoryType,
        p_metadata: metadata,
        p_embedding: embedding
      });
    
    if (error) {
      console.error("Error restoring memory:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify({
      success: true,
      message: "Memory restored successfully"
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error("Error in restore-memory function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
