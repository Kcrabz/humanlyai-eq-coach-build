
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { getAuthState, AuthState } from "@/services/authService";

/**
 * Enhanced authentication guard that prevents redirection loops
 */
export const AuthenticationGuard = () => {
  const { user, isLoading, authEvent } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;
  
  // Main auth redirection effect - improved to prevent loops
  useEffect(() => {
    // Skip if still loading auth state
    if (isLoading) return;
    
    // Skip password reset pages
    if (pathname === "/reset-password" || pathname === "/update-password") return;
    
    // Skip the chat page if we're already there and user is authenticated and onboarded
    if (pathname === "/chat" && user?.onboarded) {
      console.log("Already on chat page and user is onboarded, skipping redirection");
      return;
    }
    
    // Get the current auth state
    const authState = getAuthState();
    const isIntentionalChatNavigation = localStorage.getItem('intentional_navigation_to_chat') === 'true';
    
    // Clear intentional navigation flag after using it
    if (isIntentionalChatNavigation) {
      localStorage.removeItem('intentional_navigation_to_chat');
    }
    
    // If we don't have a user (not authenticated), don't do anything
    if (!user) return;
    
    // Handle specific cases to prevent redirection loops
    if (pathname === "/dashboard" || pathname === "/onboarding") {
      // Already on dashboard or onboarding, don't redirect
      console.log(`Already on ${pathname}, skipping redirection`);
      return;
    }
    
    // For chat page, make sure user is onboarded
    if (pathname === "/chat") {
      if (!user.onboarded) {
        console.log("User needs onboarding, redirecting to onboarding");
        navigate("/onboarding", { replace: true });
      }
      return;
    }
    
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
  }, [user, isLoading, pathname, navigate, authEvent]);

  return null;
};
