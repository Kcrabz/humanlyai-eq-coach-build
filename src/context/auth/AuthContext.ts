
import { createContext } from 'react';
import { User } from '@/types';

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
  authEvent: string | null;
  loginEvent: string | null;
  profileLoaded: boolean;
  initialized: boolean;
  loginTimestamp: number | null;
  hasPremiumFeatures: boolean;
  sessionReady: boolean;
  isPwaMode: boolean;
  isMobileDevice: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export default AuthContext;
