
import { User, EQArchetype, CoachingMode, SubscriptionTier } from "@/types";

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<any>;
  signup: (email: string, password: string) => Promise<any>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  setName: (name: string) => Promise<void>;
  setArchetype: (archetype: EQArchetype) => Promise<void>;
  setCoachingMode: (mode: CoachingMode) => Promise<void>;
  setOnboarded: (value: boolean) => Promise<void>;
  setUser: (updater: ((prevUser: User | null) => User | null) | User | null) => void;
  forceUpdateProfile: (updates: Record<string, any>) => Promise<boolean>;
}
