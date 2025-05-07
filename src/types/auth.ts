
import { User, EQArchetype, CoachingMode, SubscriptionTier } from "@/types";

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  authEvent?: "SIGN_IN_COMPLETE" | "RESTORED_SESSION" | "SIGN_OUT_COMPLETE" | null;
  profileLoaded?: boolean;
  login: (email: string, password: string) => Promise<any>;
  signup: (email: string, password: string, securityQuestionId?: string, securityAnswer?: string) => Promise<any>;
  logout: () => void;
  resetPassword: (email: string) => Promise<boolean>;  // Changed from Promise<void> to Promise<boolean>
  updateProfile: (updates: Partial<User>) => Promise<void>;
  setName: (name: string) => Promise<void>;
  setArchetype: (archetype: EQArchetype) => Promise<void>;
  setCoachingMode: (mode: CoachingMode) => Promise<void>;
  setOnboarded: (value: boolean) => Promise<void>;
  setUser: (updater: ((prevUser: User | null) => User | null) | User | null) => void;
  forceUpdateProfile: (updates: Record<string, any>) => Promise<boolean>;
  getUserSubscription: () => SubscriptionTier;
  userHasArchetype: boolean;
  
  // Premium features
  isPremiumMember: boolean;
  userStreakData: UserStreakData | null;
  userAchievements: UserAchievement[] | null;
}

export interface UserStreakData {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  totalActiveDays: number;
}

export interface UserAchievement {
  id: string;
  title: string;
  description: string;
  achieved: boolean;
  achievedAt: string | null;
  type: 'streak' | 'breakthrough' | 'milestone' | 'challenge';
  icon: string;
}

export interface EQBreakthrough {
  id: string;
  userId: string;
  message: string;
  insight: string;
  detectedAt: string;
  category: string;
}
