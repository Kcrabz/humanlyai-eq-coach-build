
// Functions for logging email sending to database
export async function logEmailSent(
  supabase: any, 
  payload: any, 
  status = 'sent', 
  errorDetails = null
) {
  try {
    console.log("Logging email to database:", {
      user_id: payload.userId,
      email_type: payload.emailType,
      template_name: payload.templateName,
      status: status
    });
    
    const { data, error } = await supabase
      .from('email_logs')
      .insert({
        user_id: payload.userId,
        email_type: payload.emailType,
        template_name: payload.templateName,
        email_data: payload.data || {},
        status: status
      });
    
    if (error) {
      console.error("Error logging email:", error);
      return { success: false, error };
    }
    
    return { success: true, data };
  } catch (err) {
    console.error("Failed to log email:", err);
    return { success: false, error: err };
  }
}
