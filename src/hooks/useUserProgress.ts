import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { EQArchetype } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useEQProgress } from "@/hooks/useEQProgress";
import { toast } from "@/components/ui/use-toast";

interface UserProgressStats {
  totalSessions: number;
  challengesCompleted: number;
  currentStreak: number;
  longestStreak: number;
  eq_archetype: EQArchetype;
  archetypeProgress: number;
  totalMinutes: number;
  totalReflections: number;
}

export const useUserProgress = () => {
  const { user, userStreakData } = useAuth();
  const { totalBreakthroughs } = useEQProgress();
  const [stats, setStats] = useState<UserProgressStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Make sure the user archetype is one of the allowed values or default to "reflector"
  const userEqArchetype: EQArchetype = (user?.eq_archetype && 
    ["reflector", "activator", "regulator", "connector", "observer"].includes(user.eq_archetype as string)) 
    ? (user.eq_archetype as EQArchetype) 
    : "reflector";
  
  // Fetch real user progress data from the database
  useEffect(() => {
    const fetchUserProgress = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }
      
      try {
        // Fetch chat messages count (sessions)
        const { count: messageCount, error: messageError } = await supabase
          .from('chat_messages')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);
        
        if (messageError) throw messageError;
        
        // Fetch challenge completions
        const { data: challenges, error: challengeError } = await supabase
          .from('user_achievements')
          .select('*')
          .eq('user_id', user.id)
          .eq('achieved', true);
        
        if (challengeError) throw challengeError;
        
        // Calculate total time spent (estimate based on message count)
        // Assuming average of 2 minutes per message exchange
        const estimatedMinutes = messageCount ? Math.round(messageCount / 2) : 0;
        
        // Calculate archetype progress based on breakthroughs and achievements
        const totalPossiblePoints = 100; // Maximum progress points
        const achievementsWeight = 0.4; // 40% of progress from achievements
        const breakthroughsWeight = 0.6; // 60% from breakthroughs
        
        const achievementsScore = challenges?.length ? Math.min(challenges.length * 10, 40) : 0;
        const breakthroughsScore = totalBreakthroughs ? Math.min(totalBreakthroughs * 15, 60) : 0;
        
        const progress = Math.min(
          Math.round(achievementsScore + breakthroughsScore),
          totalPossiblePoints
        );
        
        // Set the real user stats
        setStats({
          totalSessions: messageCount || 0,
          challengesCompleted: challenges?.length || 0,
          currentStreak: userStreakData?.currentStreak || 0,
          longestStreak: userStreakData?.longestStreak || 0,
          eq_archetype: userEqArchetype,
          archetypeProgress: progress,
          totalMinutes: estimatedMinutes,
          totalReflections: totalBreakthroughs || 0
        });
        
      } catch (error) {
        console.error("Error fetching user progress:", error);
        toast.error("There was a problem fetching your progress data.");
        
        // Fallback to basic stats if there's an error
        setStats({
          totalSessions: 0,
          challengesCompleted: 0,
          currentStreak: userStreakData?.currentStreak || 0,
          longestStreak: userStreakData?.longestStreak || 0,
          eq_archetype: userEqArchetype,
          archetypeProgress: 0,
          totalMinutes: 0,
          totalReflections: 0
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserProgress();
  }, [user?.id, userEqArchetype, userStreakData, totalBreakthroughs]);
  
  return {
    user,
    stats: stats || {
      totalSessions: 0,
      challengesCompleted: 0,
      currentStreak: userStreakData?.currentStreak || 0,
      longestStreak: userStreakData?.longestStreak || 0,
      eq_archetype: userEqArchetype,
      archetypeProgress: 0,
      totalMinutes: 0,
      totalReflections: 0
    },
    userArchetype: userEqArchetype,
    isLoading
  };
};
