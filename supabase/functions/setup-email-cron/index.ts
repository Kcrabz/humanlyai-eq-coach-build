
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
  // CORS handling
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the service role key
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    
    // Check if pg_cron extension is available
    const { data: hasCronExtension } = await supabase.rpc('has_extension', {
      extension_name: 'pg_cron'
    });
    
    if (!hasCronExtension) {
      return new Response(
        JSON.stringify({ 
          error: "pg_cron extension is not available", 
          message: "Please enable pg_cron extension in your Supabase project settings" 
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    // Setup daily cron job for engagement analysis at 1:00 AM UTC
    const { data: analyzeEngagementCron, error: analyzeError } = await supabase.rpc(
      'create_cron_job',
      {
        job_name: 'analyze_user_engagement',
        schedule: '0 1 * * *', // Run at 1:00 AM UTC every day
        command: `SELECT net.http_post(
          'https://${Deno.env.get("SUPABASE_PROJECT_REF")}.functions.supabase.co/analyze-engagement',
          '{}',
          'application/json',
          ARRAY[
            ('Authorization', 'Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}')::http_header
          ]
        );`
      }
    );
    
    // Setup daily cron job for sending scheduled emails at 9:00 AM UTC
    const { data: sendEmailsCron, error: emailsError } = await supabase.rpc(
      'create_cron_job',
      {
        job_name: 'send_scheduled_emails',
        schedule: '0 9 * * *', // Run at 9:00 AM UTC every day
        command: `SELECT net.http_post(
          'https://${Deno.env.get("SUPABASE_PROJECT_REF")}.functions.supabase.co/send-scheduled-emails',
          '{}',
          'application/json',
          ARRAY[
            ('Authorization', 'Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}')::http_header
          ]
        );`
      }
    );
    
    if (analyzeError || emailsError) {
      return new Response(
        JSON.stringify({ 
          error: "Failed to create cron jobs", 
          analyzeError, 
          emailsError 
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    return new Response(
      JSON.stringify({
        message: "Email cron jobs set up successfully",
        analyzeEngagementCron,
        sendEmailsCron,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error setting up email cron:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
