
import { User, EQArchetype, CoachingMode, SubscriptionTier } from "@/types";

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<any>;
  signup: (email: string, password: string) => Promise<any>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
  setArchetype: (archetype: EQArchetype) => void;
  setCoachingMode: (mode: CoachingMode) => void;
  setOnboarded: (value: boolean) => void;
}
