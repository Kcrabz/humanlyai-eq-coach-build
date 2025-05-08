
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { EQArchetype } from "@/types";

interface UserProgressStats {
  totalSessions: number;
  challengesCompleted: number;
  currentStreak: number;
  longestStreak: number;
  eq_archetype: string;
  archetypeProgress: number;
  totalMinutes: number;
  totalReflections: number;
}

export const useUserProgress = () => {
  const { user } = useAuth();
  
  // Stats that would be fetched from a real backend
  const [stats, setStats] = useState<UserProgressStats>({
    totalSessions: 12,
    challengesCompleted: 4,
    currentStreak: 5,
    longestStreak: 7,
    eq_archetype: user?.eq_archetype || "innovator",
    archetypeProgress: 65, // percentage
    totalMinutes: 45,
    totalReflections: 8
  });
  
  const userArchetype = user?.eq_archetype as EQArchetype | undefined || "innovator";
  
  return {
    user,
    stats,
    userArchetype
  };
};
