
import React, { createContext, useContext, useState } from "react";
import { User, EQArchetype, CoachingMode, SubscriptionTier } from "@/types";

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
  // State for auth error handling
  const [error, setError] = useState<string | null>(null);
  
  // Auth core hooks
  const authCore = useAuthCore();
  const authState = useAuthState();
  const authSession = useAuthSession();
  const authSignup = useAuthSignup();
  const authActions = useAuthActions();
  
  // Profile hooks
  const profileCore = useProfileCore(authState.setUser);
  const profileState = useProfileState();
  const profileActions = useProfileActions(authState.setUser);
  
  // Derived state
  const userHasArchetype = !!authState.user?.eq_archetype;
  const isAuthenticated = !!authState.user;
  
  // Get user subscription tier
  const getUserSubscription = () => {
    return authState.user?.subscription_tier || 'free';
  };
  
  // Reset password functionality stub
  const resetPassword = async (email: string): Promise<void> => {
    // Implement reset password functionality
    console.log("Reset password for:", email);
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
    isAuthenticated,
    resetPassword,
    error,
    updateProfile: profileCore.updateProfile,
    login: authCore.login,
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
