
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
    // Get user ID from request
    const { userId } = await req.json();
    
    if (!userId) {
      return new Response(JSON.stringify({ error: "Missing user ID" }), {
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
        totalMemories: 0,
        insightCount: 0,
        messageCount: 0,
        topicCount: 0
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Get total count of memories
    const { count: totalCount, error: countError } = await supabaseClient
      .from('user_memories')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);
      
    if (countError) {
      throw new Error("Error counting memories");
    }
    
    // Get counts by memory type
    const { data: typeData, error: typeError } = await supabaseClient
      .from('user_memories')
      .select('type')
      .eq('user_id', userId);
      
    if (typeError) {
      throw new Error("Error retrieving memory types");
    }
    
    const insightCount = typeData.filter(m => m.type === 'insight' || m.type === 'breakthrough').length;
    const topicCount = typeData.filter(m => m.type === 'topic').length;
    const messageCount = totalCount - insightCount - topicCount;
    
    // Get oldest and newest memory dates
    const { data: dateData, error: dateError } = await supabaseClient
      .from('user_memories')
      .select('created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });
      
    if (dateError) {
      throw new Error("Error retrieving memory dates");
    }
    
    const oldestMemory = dateData.length > 0 ? dateData[0].created_at : null;
    const newestMemory = dateData.length > 0 ? dateData[dateData.length - 1].created_at : null;
    
    return new Response(JSON.stringify({
      totalMemories: totalCount,
      insightCount,
      messageCount,
      topicCount,
      oldestMemory,
      newestMemory
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error("Error in memory-stats function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
