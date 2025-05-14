
import { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { 
  AuthNavigationService, 
  NavigationState,
  isOnAuthPage, 
  isOnOnboardingPage, 
  isOnChatPage, 
  isOnDashboardPage,
  isRetakingAssessment,
  isPublicPage
} from "@/services/authNavigationService";

/**
 * Centralized authentication guard that controls all navigation in the app
 * This is the ONLY component that should make redirect decisions
 */
export const AuthenticationGuard = () => {
  const { user, isLoading, authEvent } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;
  const searchParams = location.search;
  const navigatingRef = useRef(false);
  
  // Cleanup navigation state on unmount
  useEffect(() => {
    return () => {
      if (navigatingRef.current) {
        AuthNavigationService.clearState();
        navigatingRef.current = false;
      }
    };
  }, []);
  
  // Main navigation logic - consolidated and centralized
  useEffect(() => {
    // Skip if still loading auth state
    if (isLoading) {
      console.log("AuthGuard: Still loading auth state, skipping navigation check");
      return;
    }
    
    // Skip certain paths that have special handling
    if (pathname === "/reset-password" || pathname === "/update-password") {
      console.log("AuthGuard: On special auth path, skipping navigation");
      return;
    }
    
    // Don't interrupt an ongoing navigation
    const currentNavState = AuthNavigationService.getState();
    if (currentNavState && Date.now() - currentNavState.timestamp < 1000) {
      console.log(`AuthGuard: Navigation already in progress (${currentNavState.state}), skipping guard checks`);
      return;
    }
    
    console.log("AuthGuard: Evaluating navigation:", { 
      pathname, 
      isAuthenticated: !!user, 
      onboarded: user?.onboarded,
      isRetaking: isRetakingAssessment(searchParams)
    });
    
    // Reset navigation reference
    navigatingRef.current = false;
    
    // CASE 1: Not authenticated users
    if (!user) {
      // If on an auth or public page, allow access
      if (isPublicPage(pathname)) {
        console.log("AuthGuard: Unauthenticated user on public page, allowing access");
        return;
      }
      
      // Redirect to login from protected pages
      console.log("AuthGuard: User not authenticated, redirecting to login");
      AuthNavigationService.setState(NavigationState.INITIAL);
      navigate("/login", { replace: true });
      navigatingRef.current = true;
      return;
    }
    
    // CASE 2: Authenticated but not onboarded
    if (user && !user.onboarded) {
      // Already on onboarding page
      if (isOnOnboardingPage(pathname)) {
        console.log("AuthGuard: Non-onboarded user on onboarding page, allowing access");
        return;
      }
      
      // If on auth page, redirect to onboarding
      if (isOnAuthPage(pathname)) {
        console.log("AuthGuard: Non-onboarded user on auth page, redirecting to onboarding");
        AuthNavigationService.setState(NavigationState.ONBOARDING, { userId: user.id });
        navigate("/onboarding", { replace: true });
        navigatingRef.current = true;
        return;
      }
      
      // All other pages redirect to onboarding
      console.log("AuthGuard: User needs onboarding, redirecting from", pathname);
      AuthNavigationService.setState(NavigationState.ONBOARDING, { userId: user.id });
      navigate("/onboarding", { replace: true });
      navigatingRef.current = true;
      return;
    }
    
    // CASE 3: Authenticated and onboarded
    if (user && user.onboarded) {
      // Redirect from auth pages to dashboard
      if (isOnAuthPage(pathname)) {
        console.log("AuthGuard: Authenticated user on auth page, redirecting to dashboard");
        AuthNavigationService.setState(NavigationState.DASHBOARD_READY, { userId: user.id });
        navigate("/dashboard", { replace: true });
        navigatingRef.current = true;
        return;
      }
      
      // Redirect from onboarding to dashboard unless explicitly retaking assessment
      if (isOnOnboardingPage(pathname) && !isRetakingAssessment(searchParams)) {
        console.log("AuthGuard: Onboarded user on onboarding page, redirecting to dashboard");
        AuthNavigationService.setState(NavigationState.DASHBOARD_READY, { userId: user.id });
        navigate("/dashboard", { replace: true });
        navigatingRef.current = true;
        return;
      }
      
      // If just authenticated and on chat page WITHOUT intentional navigation, redirect to dashboard
      if (isOnChatPage(pathname) && 
          AuthNavigationService.isFromAuthentication() && 
          !AuthNavigationService.wasIntentionalNavigationToChat()) {
        console.log("AuthGuard: Preventing unintentional navigation to chat - redirecting to dashboard");
        AuthNavigationService.setState(NavigationState.DASHBOARD_READY, { userId: user.id });
        navigate("/dashboard", { replace: true });
        navigatingRef.current = true;
        return;
      }
    }
  }, [user, isLoading, pathname, navigate, location.search, authEvent]);
  
  // We don't render anything - this is purely for navigation control
  return null;
};
