
import { ChallengeData } from "../types.ts";

// Helper function to fetch a challenge for a user
export async function fetchDailyChallenge(supabase: any, userId: string): Promise<ChallengeData> {
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
