
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface UserEngagement {
  id: string;
  userId: string;
  registrationDate: string;
  lastLogin: string | null;
  loginCount: number;
  chatMessageCount: number;
  challengeCompletionCount: number;
  currentStreak: number;
  engagementPhase: string;
  engagementScore: number;
}

serve(async (req) => {
  // CORS handling
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    
    // Get all users with their engagement metrics
    const { data: users, error: usersError } = await supabase
      .from("user_engagement_metrics")
      .select("*");
    
    if (usersError) {
      throw usersError;
    }
    
    // Process each user and update their engagement phase
    const updates = users.map(async (user) => {
      try {
        // Calculate engagement phase based on registration date and activity
        const registrationDate = new Date(user.registration_date);
        const now = new Date();
        const daysSinceRegistration = Math.floor((now.getTime() - registrationDate.getTime()) / (1000 * 60 * 60 * 24));
        
        // Default to current phase if already set
        let engagementPhase = user.engagement_phase;
        
        // Determine engagement phase based on days since registration
        if (daysSinceRegistration <= 7) {
          engagementPhase = 'onboarding';
        } else if (daysSinceRegistration <= 28) {
          engagementPhase = 'habit-forming';
        } else {
          engagementPhase = 'post-habit';
        }
        
        // Calculate engagement score based on activity metrics (0-100)
        const loginScore = Math.min(user.login_count * 2, 30); // Max 30 points
        const messageScore = Math.min(user.chat_message_count * 0.5, 30); // Max 30 points
        const challengeScore = Math.min(user.challenge_completion_count * 5, 20); // Max 20 points
        const streakScore = Math.min(user.current_streak * 2, 20); // Max 20 points
        
        const engagementScore = loginScore + messageScore + challengeScore + streakScore;
        
        // Update the user's engagement metrics
        const { error: updateError } = await supabase
          .from("user_engagement_metrics")
          .update({
            engagement_phase: engagementPhase,
            engagement_score: engagementScore,
            last_calculated_at: new Date().toISOString(),
          })
          .eq("user_id", user.user_id);
        
        if (updateError) {
          console.error(`Error updating user ${user.user_id}:`, updateError.message);
          return null;
        }
        
        return {
          userId: user.user_id,
          engagementPhase,
          engagementScore,
        };
      } catch (err) {
        console.error(`Error processing user ${user.user_id}:`, err);
        return null;
      }
    });
    
    // Wait for all updates to complete
    const results = await Promise.all(updates);
    const validResults = results.filter(Boolean);
    
    return new Response(
      JSON.stringify({
        processed: validResults.length,
        total: users.length,
        updated: validResults,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in analyze-engagement function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
