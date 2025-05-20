
// Fetch user's first name from profiles table
export async function getUserName(supabase: any, userId: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('first_name')
      .eq('id', userId)
      .single();
    
    if (error || !data) {
      console.warn("Could not fetch user profile:", error);
      return null;
    }
    
    return data.first_name || null;
  } catch (err) {
    console.error("Error fetching user name:", err);
    return null;
  }
}
