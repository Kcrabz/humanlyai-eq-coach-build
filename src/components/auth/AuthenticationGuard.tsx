
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { 
  isOnAuthPage, isOnOnboardingPage, isOnChatPage, isOnDashboardPage, isRetakingAssessment 
} from "@/services/authNavigationService";

/**
 * Enhanced authentication guard with improved navigation control
 * This component is the single source of truth for auth-based navigation
 */
export const AuthenticationGuard = () => {
  const { user, isLoading, authEvent } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;
  const searchParams = location.search;
  
  // Main navigation logic - consolidated and simplified
  useEffect(() => {
    // Skip if still loading auth state
    if (isLoading) return;
    
    // Skip certain paths that have special handling
    if (pathname === "/reset-password" || pathname === "/update-password") {
      return;
    }
    
    // Check if navigation is currently being handled by another process
    if (sessionStorage.getItem('auth_navigation_in_progress')) {
      console.log("Navigation already in progress, skipping guard checks");
      return;
    }
    
    console.log("AuthGuard evaluating navigation:", { 
      pathname, 
      isAuthenticated: !!user, 
      onboarded: user?.onboarded,
      isRetaking: isRetakingAssessment(searchParams)
    });
    
    // CASE 1: Not authenticated users
    if (!user) {
      // Allow access to public pages
      if (isOnAuthPage(pathname) || pathname === "/") {
        return;
      }
      
      // Redirect to login from protected pages
      console.log("User not authenticated, redirecting to login");
      sessionStorage.setItem('auth_navigation_in_progress', 'to_login');
      navigate("/login", { replace: true });
      
      setTimeout(() => {
        sessionStorage.removeItem('auth_navigation_in_progress');
      }, 500);
      return;
    }
    
    // CASE 2: Authenticated but not onboarded
    if (user && !user.onboarded) {
      // Already on onboarding page
      if (isOnOnboardingPage(pathname)) {
        return;
      }
      
      // Special case - user is already on auth page
      if (isOnAuthPage(pathname)) {
        console.log("Non-onboarded user on auth page, redirecting to onboarding");
        sessionStorage.setItem('auth_navigation_in_progress', 'to_onboarding');
        navigate("/onboarding", { replace: true });
        
        setTimeout(() => {
          sessionStorage.removeItem('auth_navigation_in_progress');
        }, 500);
        return;
      }
      
      // All other pages redirect to onboarding
      console.log("User needs onboarding, redirecting from", pathname);
      sessionStorage.setItem('auth_navigation_in_progress', 'to_onboarding');
      navigate("/onboarding", { replace: true });
      
      setTimeout(() => {
        sessionStorage.removeItem('auth_navigation_in_progress');
      }, 500);
      return;
    }
    
    // CASE 3: Authenticated and onboarded
    if (user && user.onboarded) {
      // Redirect from auth pages to dashboard
      if (isOnAuthPage(pathname)) {
        console.log("Authenticated user on auth page, redirecting to dashboard");
        sessionStorage.setItem('auth_navigation_in_progress', 'to_dashboard');
        navigate("/dashboard", { replace: true });
        
        setTimeout(() => {
          sessionStorage.removeItem('auth_navigation_in_progress');
        }, 500);
        return;
      }
      
      // Redirect from onboarding to dashboard unless explicitly retaking assessment
      if (isOnOnboardingPage(pathname) && !isRetakingAssessment(searchParams)) {
        console.log("Onboarded user on onboarding page, redirecting to dashboard");
        sessionStorage.setItem('auth_navigation_in_progress', 'to_dashboard');
        navigate("/dashboard", { replace: true });
        
        setTimeout(() => {
          sessionStorage.removeItem('auth_navigation_in_progress');
        }, 500);
        return;
      }
      
      // FIX: Don't auto-navigate from dashboard to chat - let users navigate manually
      // This prevents the dashboard from being skipped
    }
  }, [user, isLoading, pathname, navigate, location.search]);
  
  return null;
};
