
import React, { createContext, useContext } from "react";
import { useAuthCore } from "@/hooks/useAuthCore";
import { useAuthState } from "@/hooks/useAuthState";
import { useAuthSignup } from "@/hooks/useAuthSignup";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useAuthActions } from "@/hooks/useAuthActions";
import { useProfileState } from "@/hooks/useProfileState";
import { useProfileCore } from "@/hooks/useProfileCore";
import { useProfileActions } from "@/hooks/useProfileActions";

// Create the auth context with default values
export interface AuthContextType {
  user: any;
  isLoading: boolean;
  error: string | null;
  isAuthenticated?: boolean;
  
  // Re-exported from useAuthActions
  login: (email: string, password: string) => Promise<any>;
  signup: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  
  // Re-exported from useProfileActions
  setName: (name: string) => Promise<void>;
  setArchetype?: (archetype: string) => Promise<void>;
  setCoachingMode?: (mode: string) => Promise<void>;
  setOnboarded?: (value: boolean) => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
  forceUpdateProfile: (data: any) => Promise<void>;
  setUser: (data: any) => void;
  
  // Additional functionality
  getUserSubscription: () => string;
  userHasArchetype: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Auth core hooks
  const authCore = useAuthCore();
  const authState = useAuthState(authCore);
  const authSession = useAuthSession(authCore);
  const authSignup = useAuthSignup(authCore);
  const authActions = useAuthActions(authCore, authState);
  
  // Profile hooks
  const profileCore = useProfileCore(authState);
  const profileState = useProfileState(profileCore);
  const profileActions = useProfileActions(profileCore, profileState);
  
  // Derived state
  const userHasArchetype = !!authState.user?.eq_archetype;
  const isAuthenticated = !!authState.user;
  
  // Get user subscription tier
  const getUserSubscription = () => {
    return authState.user?.subscription_tier || 'free';
  };
  
  // Combined context value
  const contextValue: AuthContextType = {
    ...authState,
    ...authSession,
    ...authSignup,
    ...authActions,
    ...profileActions,
    getUserSubscription,
    userHasArchetype,
    isAuthenticated
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
