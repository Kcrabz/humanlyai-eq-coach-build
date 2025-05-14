
import { useState, useEffect, useMemo } from "react";
import { User } from "@/types";
import { UserStreakData, UserAchievement } from "@/types/auth";
import { fetchUserStreakData, fetchUserAchievements } from "@/services/premiumUserService";

export function usePremiumFeatures(user: User | null) {
  // Premium feature states
  const [userStreakData, setUserStreakData] = useState<UserStreakData | null>(null);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[] | null>(null);
  
  // Determine if user is a premium member
  const isPremiumMember = useMemo(() => 
    user?.subscription_tier === 'premium', 
  [user?.subscription_tier]);
  
  // Derived flag for premium features
  const hasPremiumFeatures = isPremiumMember;

  // Fetch premium user data when user logs in and is premium
  useEffect(() => {
    const fetchPremiumUserData = async () => {
      if (user?.id && isPremiumMember) {
        try {
          // Fetch user streak data using our service function
          const streakData = await fetchUserStreakData(user.id);
          if (streakData) {
            setUserStreakData(streakData);
          }
          
          // Fetch user achievements using our service function
          const achievementData = await fetchUserAchievements(user.id);
          if (achievementData) {
            setUserAchievements(achievementData);
          }
        } catch (error) {
          console.error("Error fetching premium user data:", error);
        }
      } else {
        // Reset premium data if user is not premium or logged out
        setUserStreakData(null);
        setUserAchievements(null);
      }
    };
    
    fetchPremiumUserData();
  }, [user?.id, isPremiumMember]);

  return {
    isPremiumMember,
    hasPremiumFeatures,
    userStreakData,
    userAchievements
  };
}
