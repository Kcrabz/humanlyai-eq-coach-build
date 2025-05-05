
import React, { createContext, useContext, useEffect } from "react";
import { useAuthState } from "@/hooks/useAuthState";
import { useAuthActions } from "@/hooks/useAuthActions";
import { useProfileActions } from "@/hooks/useProfileActions";
import { AuthContextType } from "@/types/auth";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading, setUser } = useAuthState();
  const { login, signup, logout, updateProfile } = useAuthActions(setUser);
  const { setName, setArchetype, setCoachingMode, setOnboarded, forceUpdateProfile } = useProfileActions(setUser);
  
  // Debug the auth state
  useEffect(() => {
    console.log("Auth state changed:", { 
      isAuthenticated: !!user, 
      isLoading,
      userId: user?.id,
      onboarded: user?.onboarded
    });
  }, [user, isLoading]);

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
        setName,
        setArchetype,
        setCoachingMode,
        setOnboarded,
        setUser,
        forceUpdateProfile
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
