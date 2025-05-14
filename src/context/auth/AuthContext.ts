
import { createContext } from 'react';
import { User } from '@/types';
import { UserStreakData, UserAchievement } from '@/types/auth';

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  signup: (email: string, password: string, metadata?: any) => Promise<boolean>;
  resetPassword: (email: string) => Promise<boolean>;
  updatePassword: (password: string) => Promise<boolean>;
  updateUserProfile: (updates: Partial<User>) => Promise<boolean>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  forceUpdateProfile: (updates: Record<string, any>) => Promise<boolean>;
  authEvent: string | null;
  loginEvent: string | null;
  profileLoaded: boolean;
  initialized: boolean;
  loginTimestamp: number | null;
  hasPremiumFeatures: boolean;
  sessionReady: boolean;
  isPwaMode: boolean;
  isMobileDevice: boolean;
  
  // Profile update functions
  setName: (name: string) => Promise<void>;
  setArchetype: (archetype: string) => Promise<void>;
  setCoachingMode: (mode: string) => Promise<void>;
  setOnboarded: (value: boolean) => Promise<void>;
  setUser: (updater: ((prevUser: User | null) => User | null) | User | null) => void;
  
  // Premium features
  isPremiumMember: boolean;
  userStreakData: UserStreakData | null;
  userAchievements: UserAchievement[] | null;
  getUserSubscription: () => string;
  userHasArchetype: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export default AuthContext;
