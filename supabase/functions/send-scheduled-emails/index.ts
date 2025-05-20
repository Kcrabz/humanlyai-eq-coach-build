
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { corsHeaders } from "./utils.ts";
import { processUsers } from "./processors/userProcessor.ts";
import { createSupabaseClient } from "./supabaseClient.ts";

serve(async (req) => {
  // CORS handling
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createSupabaseClient();
    
    // Fetch users with their engagement metrics
    const { data: users, error: usersError } = await supabase
      .from("user_engagement_metrics")
      .select("*, profiles(name, eq_archetype, coaching_mode), user_streaks(current_streak, last_active_date)");
    
    if (usersError) {
      throw usersError;
    }
    
    // Process all users to determine and send emails
    const processingResults = await processUsers(users, supabase);
    
    return new Response(
      JSON.stringify(processingResults),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in send-scheduled-emails function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
