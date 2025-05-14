
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { getAuthState, AuthState, navigateBasedOnAuthState } from "@/services/authService";

/**
 * Enhanced authentication guard that uses the centralized auth service
 */
export const AuthenticationGuard = () => {
  const { user, isLoading, authEvent } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;
  
  // Main auth redirection effect - improved for reliability
  useEffect(() => {
    // Skip if still loading auth state
    if (isLoading) return;
    
    // Skip password reset pages
    if (pathname === "/reset-password" || pathname === "/update-password") return;
    
    // Get the current auth state
    const authState = getAuthState();
    
    // If we have an explicit auth state from a recent login/signup
    if (authState && Date.now() - authState.timestamp < 5000) {
      console.log("Recent auth state detected:", authState.state);
      
      // Handle specific auth states
      switch (authState.state) {
        case AuthState.SIGNED_IN:
        case AuthState.SIGNED_UP:
          // New login or signup - navigate to dashboard
          console.log("Recently logged in or signed up, navigating to dashboard");
          navigate("/dashboard", { replace: true });
          return;
          
        case AuthState.NEEDS_ONBOARDING:
          // User needs onboarding - navigate to onboarding
          console.log("User needs onboarding, navigating to onboarding");
          navigate("/onboarding", { replace: true });
          return;
      }
    }
    
    // Use the central navigation service for all other cases
    if (user) {
      navigateBasedOnAuthState(user, navigate, pathname);
    }
  }, [user, isLoading, pathname, navigate, authEvent]);

  return null;
};
