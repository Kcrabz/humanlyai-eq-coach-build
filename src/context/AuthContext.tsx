
import React, { createContext, useContext } from "react";
import { useAuthState } from "@/hooks/useAuthState";
import { useAuthActions } from "@/hooks/useAuthActions";
import { useProfileActions } from "@/hooks/useProfileActions";
import { useAuthNavigation } from "@/hooks/useAuthNavigation";
import { AuthContextType } from "@/types/auth";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading, setUser } = useAuthState();
  const { login, signup, logout, updateProfile } = useAuthActions(setUser);
  const { setArchetype, setCoachingMode, setOnboarded } = useProfileActions(setUser);
  
  // Setup navigation based on auth state
  useAuthNavigation(user, isLoading);

  return (
    <AuthContext.Provider 
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
        updateProfile,
        setArchetype,
        setCoachingMode,
        setOnboarded
      }}
    >
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
