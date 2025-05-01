
import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { User, EQArchetype, CoachingMode, SubscriptionTier } from "@/types";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
  setArchetype: (archetype: EQArchetype) => void;
  setCoachingMode: (mode: CoachingMode) => void;
  setOnboarded: (value: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user data for now - would be replaced with Supabase
const mockUsers = [
  {
    id: "1",
    email: "demo@humanly.ai",
    name: "Demo User",
    subscription_tier: "free" as SubscriptionTier,
    onboarded: false,
  },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for saved user in localStorage
    const savedUser = localStorage.getItem("humanlyai_user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem("humanlyai_user", JSON.stringify(user));
    }
  }, [user]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Mock login - would be replaced with Supabase
      const foundUser = mockUsers.find((u) => u.email === email);
      if (!foundUser) {
        throw new Error("Invalid email or password");
      }
      
      setUser(foundUser);
      toast.success("Logged in successfully");
      
      // Redirect based on onboarding status
      if (!foundUser.onboarded) {
        navigate("/onboarding");
      } else {
        navigate("/chat");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to login");
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Mock signup - would be replaced with Supabase
      const newUser: User = {
        id: String(Math.floor(Math.random() * 1000)),
        email,
        subscription_tier: "free",
        onboarded: false,
      };
      
      setUser(newUser);
      mockUsers.push(newUser);
      toast.success("Account created successfully");
      navigate("/onboarding");
    } catch (error) {
      console.error("Signup error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to create account");
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("humanlyai_user");
    setUser(null);
    navigate("/");
  };

  const updateProfile = (updates: Partial<User>) => {
    if (!user) return;
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
  };

  const setArchetype = (archetype: EQArchetype) => {
    if (!user) return;
    updateProfile({ eq_archetype: archetype });
  };

  const setCoachingMode = (mode: CoachingMode) => {
    if (!user) return;
    updateProfile({ coaching_mode: mode });
  };

  const setOnboarded = (value: boolean) => {
    if (!user) return;
    updateProfile({ onboarded: value });
  };

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
