
import { DAILY_CHALLENGES } from "@/data/dailyChallenges";
import { EQArchetype } from "@/types";
import { DailyChallenge } from "@/data/dailyChallenges";

/**
 * Get today's challenge based on the current date
 * This ensures everyone gets the same challenge on the same day
 * but the challenge changes each day
 */
export function getTodaysChallenge(userArchetype?: EQArchetype): DailyChallenge {
  const today = new Date();
  const dateString = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
  
  // Create a deterministic index based on the date
  const dateHash = hashString(dateString);
  const index = dateHash % DAILY_CHALLENGES.length;
  
  // Get a base challenge for today
  let challenge = DAILY_CHALLENGES[index];
  
  // If user has an archetype, try to find a more relevant challenge
  if (userArchetype) {
    const archetypeSpecificChallenges = DAILY_CHALLENGES.filter(c => 
      c.archetypes?.includes(userArchetype)
    );
    
    if (archetypeSpecificChallenges.length > 0) {
      const archetypeIndex = dateHash % archetypeSpecificChallenges.length;
      challenge = archetypeSpecificChallenges[archetypeIndex];
    }
  }
  
  return challenge;
}

/**
 * Simple string hash function to create a consistent
 * but pseudo-random number from a string
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Format a date to YYYY-MM-DD
 */
export function formatDateForComparison(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Check if two ISO date strings are from the same day
 */
export function isSameDay(dateStr1: string, dateStr2: string): boolean {
  return formatDateForComparison(new Date(dateStr1)) === formatDateForComparison(new Date(dateStr2));
}
