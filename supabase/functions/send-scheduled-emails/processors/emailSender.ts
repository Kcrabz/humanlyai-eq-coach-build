
// Logic for sending emails
export async function sendEmail(
  supabase: any, 
  userId: string, 
  emailType: string, 
  templateName: string, 
  subject: string, 
  to: string, 
  data: Record<string, any>
) {
  try {
    // Call the send-email function
    const result = await supabase.functions.invoke('send-email', {
      body: JSON.stringify({
        userId,
        emailType,
        templateName,
        subject,
        to,
        data
      })
    });
    
    if (result.error) {
      throw new Error(`Error sending email: ${result.error}`);
    }
    
    return { success: true };
  } catch (err) {
    console.error(`Error sending email to user ${userId}:`, err);
    return { success: false, error: err.message };
  }
}
