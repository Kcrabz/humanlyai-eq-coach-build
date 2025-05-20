
// Functions for fetching user data
export async function fetchUserEmail(supabase: any, userId: string): Promise<string | null> {
  try {
    const { data: userData, error } = await supabase.auth.admin.getUserById(userId);
    
    if (error || !userData?.user?.email) {
      console.log(`Error or no email found for user ${userId}:`, error);
      return null;
    }
    
    return userData.user.email;
  } catch (err) {
    console.error("Error in fetchUserEmail:", err);
    return null;
  }
}
