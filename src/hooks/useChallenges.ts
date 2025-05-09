
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { getTodaysChallenge, isSameDay, formatDateForComparison } from "@/utils/challengeUtils";
import { supabase } from "@/integrations/supabase/client";
import { DailyChallenge } from "@/data/dailyChallenges";
import { toast } from "sonner";

export interface ChallengeHistoryItem {
  id: number | string;
  title: string;
  name?: string;
  completed: boolean;
  date: string;
}

export function useChallenges() {
  const { user, userAchievements } = useAuth();
  const [todaysChallenge, setTodaysChallenge] = useState<DailyChallenge | null>(null);
  const [isChallengeCompleted, setIsChallengeCompleted] = useState(false);
  const [pastChallenges, setPastChallenges] = useState<ChallengeHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Get today's challenge based on the date
  useEffect(() => {
    if (user) {
      // Only pass the archetype to getTodaysChallenge if it's a valid EQ archetype (not "Not set")
      const validArchetype = user.eq_archetype !== "Not set" ? user.eq_archetype : undefined;
      const challenge = getTodaysChallenge(validArchetype);
      setTodaysChallenge(challenge);
      
      // Check if today's challenge is already completed
      if (userAchievements) {
        const today = new Date().toISOString();
        const completedToday = userAchievements.some(a => 
          a.title === challenge.title && 
          a.achieved && 
          a.achievedAt && 
          isSameDay(a.achievedAt, today)
        );
        
        setIsChallengeCompleted(completedToday);
      }
      
      setIsLoading(false);
    }
  }, [user, userAchievements]);
  
  // Load past challenges from user history
  useEffect(() => {
    const loadPastChallenges = async () => {
      if (!user?.id) return;
      
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('user_achievements')
          .select(`
            id,
            achieved, 
            achieved_at,
            achievement_id,
            achievements (
              title,
              description,
              type,
              category,
              icon
            )
          `)
          .eq('user_id', user.id)
          .eq('achievements.type', 'challenge')
          .order('achieved_at', { ascending: false });
          
        if (error) throw error;
        
        if (data) {
          const formattedChallenges: ChallengeHistoryItem[] = data.map(item => ({
            id: item.id,
            title: item.achievements?.title || "Daily Challenge",
            completed: item.achieved,
            date: item.achieved_at ? new Date(item.achieved_at).toLocaleDateString() : 'N/A'
          }));
          
          setPastChallenges(formattedChallenges);
        }
      } catch (error) {
        console.error("Error loading past challenges:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPastChallenges();
  }, [user?.id]);
  
  // Mark today's challenge as completed - using a direct user achievement without creating new achievement
  const completeChallenge = useCallback(async () => {
    if (!user?.id || !todaysChallenge || isChallengeCompleted) return;
    
    try {
      // Find existing achievement for this challenge title
      const { data: existingAchievement, error: findError } = await supabase
        .from('achievements')
        .select('id')
        .eq('title', todaysChallenge.title)
        .eq('type', 'challenge')
        .maybeSingle();
      
      if (findError) {
        console.error("Error finding achievement:", findError);
        // Continue with the function - we'll use a virtual achievement instead
      }
      
      // If an achievement record exists, use it, otherwise create a virtual one just for the UI
      let achievementId = existingAchievement?.id || '';
      
      if (!achievementId) {
        // We'll just use client-side tracking in this case
        // Instead of creating a new achievement record which might fail due to RLS
        console.info("No achievement record found, using client-side tracking");
      }
      
      // Create the user_achievement record
      if (achievementId) {
        const { error } = await supabase
          .from('user_achievements')
          .insert({
            user_id: user.id,
            achievement_id: achievementId,
            achieved: true,
            achieved_at: new Date().toISOString()
          });
          
        if (error) {
          console.warn("Error recording achievement in database:", error);
          // We'll continue with client-side state update even if the DB update fails
        }
      }
      
      // Update the local state regardless of database success
      setIsChallengeCompleted(true);
      
      // Update the local past challenges list
      setPastChallenges(prev => [{
        id: Date.now().toString(),
        title: todaysChallenge.title,
        completed: true,
        date: new Date().toLocaleDateString()
      }, ...prev]);
      
      toast.success("Daily challenge completed!", {
        description: "Great job! Keep up the good work.",
        duration: 3000
      });
      
    } catch (error) {
      console.error("Error completing challenge:", error);
      // Don't show error toast to avoid confusion - we'll still update the UI state
    }
  }, [user?.id, todaysChallenge, isChallengeCompleted]);
  
  return {
    todaysChallenge,
    isChallengeCompleted,
    pastChallenges,
    completeChallenge,
    isLoading
  };
}
