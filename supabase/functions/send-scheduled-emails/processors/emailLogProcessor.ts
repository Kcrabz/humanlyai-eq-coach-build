
// Functions for interacting with email logs
export async function fetchLastEmailSent(supabase: any, userId: string) {
  try {
    const { data } = await supabase
      .from('email_logs')
      .select('*')
      .eq('user_id', userId)
      .order('sent_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    return data;
  } catch (err) {
    console.error("Error fetching last email:", err);
    return null;
  }
}
