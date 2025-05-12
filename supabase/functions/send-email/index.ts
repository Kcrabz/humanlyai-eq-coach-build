
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { supabaseClient } from "../_shared/supabase-client.ts";

const resendApiKey = Deno.env.get("RESEND_API_KEY");
const resend = new Resend(resendApiKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EmailPayload {
  userId: string;
  emailType: string;
  templateName: string;
  subject: string;
  to: string;
  data?: Record<string, any>;
}

// Helper to log email sending to database
async function logEmailSent(supabase, payload: EmailPayload) {
  try {
    const { data, error } = await supabase
      .from('email_logs')
      .insert({
        user_id: payload.userId,
        email_type: payload.emailType,
        template_name: payload.templateName,
        email_data: payload.data || {},
      });
    
    if (error) {
      console.error("Error logging email:", error);
    }
    
    return { data, error };
  } catch (err) {
    console.error("Failed to log email:", err);
    return { data: null, error: err };
  }
}

// Template renderer function - will be expanded with more templates
function renderEmailTemplate(templateName: string, data: Record<string, any>) {
  // Default values for templates
  const userName = data.name || 'there';
  const appUrl = 'https://humanly.ai';
  
  // Template selection
  switch (templateName) {
    case 'daily-nudge':
      return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Daily EQ Challenge</h2>
          <p>Hi ${userName},</p>
          <p>Ready for today's emotional intelligence challenge?</p>
          <p>${data.challengeText || "Practice active listening in your next conversation."}</p>
          <div style="margin: 20px 0;">
            <a href="${appUrl}/chat" style="background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Start Now</a>
          </div>
          <p>Your current streak: ${data.currentStreak || 0} days</p>
          <p>Keep growing your emotional intelligence!</p>
          <hr>
          <p style="font-size: 12px; color: #666;">
            <a href="${appUrl}/settings/email-preferences">Manage email preferences</a>
          </p>
        </div>
      `;
    
    case 'weekly-summary':
      return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Your Weekly EQ Progress</h2>
          <p>Hi ${userName},</p>
          <p>Here's what you accomplished this week:</p>
          <ul>
            <li>Sessions completed: ${data.sessionsCompleted || 0}</li>
            <li>Challenges completed: ${data.challengesCompleted || 0}</li>
            <li>EQ breakthroughs: ${data.breakthroughsCount || 0}</li>
          </ul>
          <p>${data.personalisedInsight || "You're making great progress on your EQ journey!"}</p>
          <div style="margin: 20px 0;">
            <a href="${appUrl}/progress" style="background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Full Progress</a>
          </div>
          <hr>
          <p style="font-size: 12px; color: #666;">
            <a href="${appUrl}/settings/email-preferences">Manage email preferences</a>
          </p>
        </div>
      `;
    
    case 're-engagement':
      return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>We Miss You!</h2>
          <p>Hi ${userName},</p>
          <p>It's been a while since your last session. Your EQ journey is waiting for you!</p>
          <p>${data.personalisedPrompt || "Did you know consistent practice is key to emotional intelligence growth?"}</p>
          <div style="margin: 20px 0;">
            <a href="${appUrl}/chat" style="background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Resume Your Journey</a>
          </div>
          <p>We've saved your progress and have new insights waiting for you.</p>
          <hr>
          <p style="font-size: 12px; color: #666;">
            <a href="${appUrl}/settings/email-preferences">Manage email preferences</a>
          </p>
        </div>
      `;
      
    default:
      return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>A Message from Humanly</h2>
          <p>Hi ${userName},</p>
          <p>${data.message || "Thanks for using Humanly!"}</p>
          <div style="margin: 20px 0;">
            <a href="${appUrl}" style="background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Visit Humanly</a>
          </div>
          <hr>
          <p style="font-size: 12px; color: #666;">
            <a href="${appUrl}/settings/email-preferences">Manage email preferences</a>
          </p>
        </div>
      `;
  }
}

// Main request handler
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Check if Resend API key is configured
  if (!resendApiKey) {
    return new Response(
      JSON.stringify({ error: "Resend API key is not configured" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  try {
    // Get the request body
    const payload = await req.json() as EmailPayload;
    
    // Create Supabase admin client
    const supabase = supabaseClient(req);
    
    // Check user email preferences before sending
    const { data: preferences } = await supabase
      .from('email_preferences')
      .select('*')
      .eq('user_id', payload.userId)
      .single();
    
    // If the user has opted out of this type of email, don't send it
    if (preferences) {
      if (payload.emailType === 'daily_nudge' && !preferences.daily_nudges ||
          payload.emailType === 'weekly_summary' && !preferences.weekly_summary ||
          payload.emailType === 'achievement' && !preferences.achievement_notifications ||
          payload.emailType === 'challenge' && !preferences.challenge_reminders ||
          payload.emailType === 're_engagement' && !preferences.inactivity_reminders) {
        return new Response(
          JSON.stringify({ message: "User has opted out of this email type" }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    }
    
    // Get the user's email from the auth.users table
    const { data: userData } = await supabase.auth.admin.getUserById(payload.userId);
    
    if (!userData?.user) {
      return new Response(
        JSON.stringify({ error: "User not found" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    // Render the email HTML using the template
    const htmlContent = renderEmailTemplate(payload.templateName, payload.data || {});
    
    // Send the email
    const emailResult = await resend.emails.send({
      from: "Humanly <notifications@humanly.ai>",
      to: [payload.to || userData.user.email],
      subject: payload.subject,
      html: htmlContent,
    });
    
    // Log the email in the database
    await logEmailSent(supabase, payload);
    
    // Return the result
    return new Response(
      JSON.stringify(emailResult),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    // Log and return any errors
    console.error("Error in send-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
