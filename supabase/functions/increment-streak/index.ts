
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the request body
    const { user_id } = await req.json();
    
    if (!user_id) {
      return new Response(
        JSON.stringify({ error: "Missing user_id" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    // Create a Supabase client with the service role key
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    
    // Get the current date (UTC) to use for last_active_date
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    
    // First, check if the user has an existing streak record
    const { data: existingStreak, error: queryError } = await supabase
      .from("user_streaks")
      .select("*")
      .eq("user_id", user_id)
      .single();
    
    if (queryError && queryError.code !== "PGRST116") { // PGRST116 means no rows returned
      console.error("Error fetching streak:", queryError);
      throw queryError;
    }
    
    if (!existingStreak) {
      // Create a new streak record for the user
      const { data: newStreak, error: insertError } = await supabase
        .from("user_streaks")
        .insert({
          user_id,
          current_streak: 1,
          longest_streak: 1,
          last_active_date: today,
          total_active_days: 1,
        })
        .select()
        .single();
      
      if (insertError) throw insertError;
      
      return new Response(
        JSON.stringify({ success: true, streak: newStreak }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    // Check if the user is already active today
    if (existingStreak.last_active_date === today) {
      // User is already counted for today, don't increment streak
      return new Response(
        JSON.stringify({ success: true, streak: existingStreak, message: "Already active today" }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    // Calculate days since last activity
    const lastActiveDate = existingStreak.last_active_date 
      ? new Date(existingStreak.last_active_date) 
      : null;
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    
    let newCurrentStreak = existingStreak.current_streak;
    let newLongestStreak = existingStreak.longest_streak;
    let totalDays = existingStreak.total_active_days || 0;
    
    // Check if the last active date was yesterday or earlier today
    if (lastActiveDate && (
        lastActiveDate.toISOString().split('T')[0] === yesterday.toISOString().split('T')[0] ||
        lastActiveDate.toISOString().split('T')[0] === today
    )) {
      // User is maintaining their streak
      newCurrentStreak += 1;
      
      // Update longest streak if current streak is longer
      if (newCurrentStreak > newLongestStreak) {
        newLongestStreak = newCurrentStreak;
      }
    } else {
      // Streak broken - start a new streak
      newCurrentStreak = 1;
    }
    
    // Increment total active days
    totalDays += 1;
    
    // Update the streak record
    const { data: updatedStreak, error: updateError } = await supabase
      .from("user_streaks")
      .update({
        current_streak: newCurrentStreak,
        longest_streak: newLongestStreak,
        last_active_date: today,
        total_active_days: totalDays,
      })
      .eq("user_id", user_id)
      .select()
      .single();
    
    if (updateError) throw updateError;
    
    return new Response(
      JSON.stringify({ success: true, streak: updatedStreak }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in increment-streak function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
