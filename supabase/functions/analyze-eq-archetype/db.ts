
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * Updates a user's profile with their determined EQ archetype
 */
export async function updateUserArchetype(
  userId: string,
  archetype: string,
  supabaseUrl?: string,
  supabaseServiceKey?: string
): Promise<boolean> {
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing Supabase credentials");
    return false;
  }

  try {
    console.log(`Updating archetype for user ${userId} to ${archetype}`);
    
    // Initialize Supabase client with service role key for admin privileges
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Update the user's profile with the determined archetype
    const { error } = await supabase
      .from('profiles')
      .update({ eq_archetype: archetype })
      .eq('id', userId);
    
    if (error) {
      console.error("Error updating user archetype:", error);
      return false;
    }
    
    console.log(`Successfully updated archetype for user ${userId}`);
    return true;
  } catch (error) {
    console.error("Error in updateUserArchetype:", error);
    return false;
  }
}
