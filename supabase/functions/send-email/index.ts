
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { supabaseClient } from "../_shared/supabase-client.ts";
import { corsHeaders, handleCorsPreflightRequest } from "./helpers/cors.ts";
import { createErrorResponse } from "./helpers/errors.ts";
import { logEmailSent } from "./services/emailLogger.ts";
import { getUserName } from "./services/userService.ts";
import { renderEmailTemplate } from "./templates/emailTemplates.ts";
import { checkEmailPreferences } from "./services/emailPreferences.ts";
import { EmailPayload } from "./types.ts";

const resendApiKey = Deno.env.get("RESEND_API_KEY");
const resend = new Resend(resendApiKey);

// Main request handler
serve(async (req) => {
  console.log("Send-email function invoked");
  
  // Handle CORS preflight requests
  const corsResponse = handleCorsPreflightRequest(req);
  if (corsResponse) return corsResponse;

  // Check if Resend API key is configured
  if (!resendApiKey) {
    console.error("Resend API key is not configured");
    return createErrorResponse("Resend API key is not configured", 500);
  }

  try {
    console.log("Processing email request");
    
    // Get the request body
    let payload: EmailPayload;
    
    try {
      const contentType = req.headers.get('content-type') || '';
      console.log("Request content type:", contentType);

      // Handle both stringified and direct JSON objects
      if (contentType.includes('application/json')) {
        console.log("Parsing JSON payload");
        payload = await req.json() as EmailPayload;
      } else {
        console.log("Parsing text payload");
        const body = await req.text();
        try {
          payload = JSON.parse(body) as EmailPayload;
        } catch (parseError) {
          console.error("Failed to parse text as JSON:", parseError);
          throw new Error("Invalid JSON format");
        }
      }
      
      console.log("Parsed payload:", JSON.stringify(payload, null, 2));
      
      // Validate required fields
      if (!payload.userId || !payload.templateName || !payload.subject) {
        console.error("Missing required fields");
        throw new Error("Missing required fields in payload: userId, templateName, and subject are required");
      }
      
    } catch (parseError) {
      console.error("Error parsing request body:", parseError);
      return createErrorResponse(`Invalid request format: ${parseError.message}`, 400);
    }
    
    // Create Supabase admin client
    console.log("Creating Supabase client");
    const supabase = supabaseClient(req);
    
    // Get recipient email - either from payload or from auth.users
    let recipientEmail = payload.to;
    
    if (!recipientEmail) {
      console.log(`No recipient email in payload, fetching from auth.users for userId: ${payload.userId}`);
      try {
        const { data: userData, error: userError } = await supabase.auth.admin.getUserById(payload.userId);
        
        if (userError) {
          console.error("Error fetching user:", userError);
          // Still log the attempt with failure status
          await logEmailSent(supabase, payload, 'failed', `User not found: ${userError.message}`);
          throw new Error(`User not found: ${userError.message}`);
        }
        
        if (!userData?.user?.email) {
          console.error("User has no email");
          // Still log the attempt with failure status
          await logEmailSent(supabase, payload, 'failed', "User has no email address");
          throw new Error("User has no email address");
        }
        
        recipientEmail = userData.user.email;
        console.log(`Found recipient email: ${recipientEmail}`);
      } catch (userFetchError) {
        console.error("Failed to fetch user email:", userFetchError);
        await logEmailSent(supabase, payload, 'failed', `Failed to fetch user email: ${userFetchError.message}`);
        return createErrorResponse(`Failed to fetch user email: ${userFetchError.message}`, 404);
      }
    }
    
    // Check user email preferences before sending
    const { canSend, reason } = await checkEmailPreferences(supabase, payload.userId, payload.emailType);
    
    if (!canSend) {
      console.log(`User ${payload.userId} has opted out of ${payload.emailType} emails`);
      // Log the opt-out as a "skipped" status
      await logEmailSent(supabase, payload, 'skipped', reason);
      return new Response(
        JSON.stringify({ message: reason || "User has opted out of this email type" }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get user's first name if available
    let userName = "there";
    try {
      const firstName = await getUserName(supabase, payload.userId);
      if (firstName) {
        userName = firstName;
        console.log(`Using user's first name: ${userName}`);
        
        // Update the data with the user's name
        payload.data = {
          ...(payload.data || {}),
          firstName: firstName,
          name: firstName
        };
      }
    } catch (nameError) {
      console.error("Error getting user's name:", nameError);
      // Continue with default name if there's an error
    }
    
    // Set the correct application URL
    const appBaseUrl = "https://humanly.ai";
    payload.data = {
      ...(payload.data || {}),
      appUrl: appBaseUrl
    };
    
    // Render the email HTML using the template
    console.log("Generating email content with template:", payload.templateName);
    const htmlContent = renderEmailTemplate(payload.templateName, payload.data || {});
    
    console.log(`Sending email to: ${recipientEmail}`);
    
    // Send the email
    try {
      // First log that we're attempting to send the email
      await logEmailSent(supabase, payload, 'sending');
      
      const emailResult = await resend.emails.send({
        from: "Humanly <onboarding@resend.dev>", // Changed from humanly.ai to resend.dev
        to: [recipientEmail],
        subject: payload.subject,
        html: htmlContent,
      });
      
      console.log("Email API response:", emailResult);
      
      // Check for errors in the response
      if (emailResult.error) {
        console.error("Error from Resend API:", emailResult.error);
        
        // Update the log with failure status
        await logEmailSent(supabase, payload, 'failed', emailResult.error);
        
        return createErrorResponse(`Failed to send email: ${emailResult.error}`, 500);
      }
      
      // Update the log with success status
      await logEmailSent(supabase, payload, 'sent');
      
      // Return the result
      return new Response(
        JSON.stringify({ success: true, data: emailResult }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } catch (sendError) {
      console.error("Exception sending email via Resend:", sendError);
      
      // Update the log with failure status
      await logEmailSent(supabase, payload, 'failed', sendError.message);
      
      return createErrorResponse(`Failed to send email: ${sendError.message}`, 500);
    }
  } catch (error) {
    // Log and return any errors
    return createErrorResponse(error);
  }
});
