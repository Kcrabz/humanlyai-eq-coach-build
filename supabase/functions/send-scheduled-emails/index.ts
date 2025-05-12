
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Helper function to fetch a challenge for a user
async function fetchDailyChallenge(supabase, userId: string) {
  try {
    // Get user's archetype to find relevant challenges
    const { data: profile } = await supabase
      .from('profiles')
      .select('eq_archetype')
      .eq('id', userId)
      .single();
    
    // Return a default challenge text if we can't find a specific one
    return {
      challengeText: "Practice active listening in your next conversation by focusing entirely on the speaker without planning your response."
    };
  } catch (err) {
    console.error("Error fetching challenge:", err);
    return {
      challengeText: "Reflect on a recent emotional reaction you had and identify what triggered it."
    };
  }
}

serve(async (req) => {
  // CORS handling
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    
    // Fetch users with their engagement metrics
    const { data: users, error: usersError } = await supabase
      .from("user_engagement_metrics")
      .select("*, profiles(name, eq_archetype, coaching_mode), user_streaks(current_streak, last_active_date)");
    
    if (usersError) {
      throw usersError;
    }
    
    const now = new Date();
    const processingResults = {
      total: users.length,
      emailsSent: 0,
      emailTypes: {
        daily: 0,
        weekly: 0,
        reengagement: 0
      }
    };
    
    // Process each user to determine what emails to send
    const emailPromises = users.map(async (user) => {
      try {
        const { user_id: userId, engagement_phase: phase, last_login, profiles } = user;
        const lastLoginDate = last_login ? new Date(last_login) : null;
        const userName = profiles?.name || "there";
        const currentStreak = user.user_streaks?.current_streak || 0;
        
        // Check when we last sent an email to this user
        const { data: lastEmail } = await supabase
          .from('email_logs')
          .select('*')
          .eq('user_id', userId)
          .order('sent_at', { ascending: false })
          .limit(1)
          .single();
        
        const lastEmailDate = lastEmail ? new Date(lastEmail.sent_at) : null;
        const daysSinceLastEmail = lastEmailDate ? Math.floor((now.getTime() - lastEmailDate.getTime()) / (1000 * 60 * 60 * 24)) : 999;
        
        // Check user's email preferences
        const { data: preferences } = await supabase
          .from('email_preferences')
          .select('*')
          .eq('user_id', userId)
          .single();
        
        if (!preferences) {
          console.log(`No email preferences found for user ${userId}`);
          return;
        }
        
        // Get the user's email
        const { data: userData } = await supabase.auth.admin.getUserById(userId);
        if (!userData?.user?.email) {
          console.log(`No email found for user ${userId}`);
          return;
        }
        
        // Determine what email to send based on engagement phase and last activity
        let emailType = null;
        let templateName = null;
        let subject = null;
        let emailData = {};
        
        // Determine days since last login
        const daysSinceLastLogin = lastLoginDate 
          ? Math.floor((now.getTime() - lastLoginDate.getTime()) / (1000 * 60 * 60 * 24)) 
          : 999;
        
        // For onboarding users (first 7 days): daily email if they haven't logged in today
        if (phase === 'onboarding' && preferences.daily_nudges && daysSinceLastEmail >= 1) {
          // Daily nudge for onboarding users
          emailType = 'daily_nudge';
          templateName = 'daily-nudge';
          subject = "Your Daily EQ Challenge";
          
          // Fetch a challenge for this user
          const challenge = await fetchDailyChallenge(supabase, userId);
          emailData = {
            name: userName,
            currentStreak,
            ...challenge
          };
          
          processingResults.emailTypes.daily++;
        }
        // For habit-forming users (weeks 2-4): 3-5 sessions per week
        else if (phase === 'habit-forming' && preferences.challenge_reminders && daysSinceLastLogin >= 2 && daysSinceLastEmail >= 2) {
          emailType = 'challenge';
          templateName = 'daily-nudge';
          subject = "Continue Your EQ Growth Journey";
          
          // Fetch a challenge for this user
          const challenge = await fetchDailyChallenge(supabase, userId);
          emailData = {
            name: userName,
            currentStreak,
            ...challenge
          };
          
          processingResults.emailTypes.daily++;
        }
        // For post-habit users (week 5+): weekly summary and re-engagement if inactive
        else if (phase === 'post-habit') {
          // If they haven't logged in for 7+ days and opted into inactivity reminders
          if (daysSinceLastLogin >= 7 && preferences.inactivity_reminders && daysSinceLastEmail >= 7) {
            emailType = 're_engagement';
            templateName = 're-engagement';
            subject = "We Miss You! Continue Your EQ Journey";
            emailData = {
              name: userName,
              daysSinceLastLogin,
              personalisedPrompt: "Your emotional intelligence journey is waiting for you. Take a moment today to reflect and grow."
            };
            
            processingResults.emailTypes.reengagement++;
          }
          // Weekly summary if they haven't received one in the last 6 days
          else if (preferences.weekly_summary && (
            !lastEmailDate || 
            lastEmailDate.getDay() !== now.getDay() || 
            daysSinceLastEmail >= 6
          )) {
            emailType = 'weekly_summary';
            templateName = 'weekly-summary';
            subject = "Your Weekly EQ Progress Report";
            emailData = {
              name: userName,
              sessionsCompleted: 3, // Placeholder
              challengesCompleted: 2, // Placeholder
              breakthroughsCount: 1, // Placeholder
              personalisedInsight: "You're showing great progress in self-awareness! Keep practicing mindfulness."
            };
            
            processingResults.emailTypes.weekly++;
          }
        }
        
        // If we determined an email should be sent, send it
        if (emailType && templateName && subject) {
          // Call the send-email function
          const result = await supabase.functions.invoke('send-email', {
            body: JSON.stringify({
              userId,
              emailType,
              templateName,
              subject,
              to: userData.user.email,
              data: emailData
            })
          });
          
          if (result.error) {
            throw new Error(`Error sending email: ${result.error}`);
          }
          
          processingResults.emailsSent++;
          return { userId, emailType, success: true };
        }
        
        return { userId, emailType: null, success: true };
      } catch (err) {
        console.error(`Error processing user ${user.user_id}:`, err);
        return { userId: user.user_id, error: err.message, success: false };
      }
    });
    
    // Wait for all email processing to complete
    const results = await Promise.all(emailPromises);
    
    return new Response(
      JSON.stringify({
        ...processingResults,
        results: results.filter(r => r.emailType !== null),
      }),
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
