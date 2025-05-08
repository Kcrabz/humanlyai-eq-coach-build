
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { EQArchetype } from "@/types";

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
  const { user } = useAuth();
  
  // Make sure the user archetype is one of the allowed values or default to "reflector"
  const userEqArchetype: EQArchetype = (user?.eq_archetype && 
    ["reflector", "activator", "regulator", "connector", "observer"].includes(user.eq_archetype as string)) 
    ? (user.eq_archetype as EQArchetype) 
    : "reflector";
  
  // Stats that would be fetched from a real backend
  const [stats, setStats] = useState<UserProgressStats>({
    totalSessions: 12,
    challengesCompleted: 4,
    currentStreak: 5,
    longestStreak: 7,
    eq_archetype: userEqArchetype,
    archetypeProgress: 65, // percentage
    totalMinutes: 45,
    totalReflections: 8
  });
  
  return {
    user,
    stats,
    userArchetype: userEqArchetype
  };
};
