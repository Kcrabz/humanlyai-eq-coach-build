
import { useEffect, useRef, useState } from "react";
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

// Increased for mobile devices which may need more time
const NAVIGATION_DEBOUNCE_MS = 500;

// PWA-specific timeouts
const PWA_NAVIGATION_TIMEOUT = 800;

/**
 * Centralized authentication guard that controls all navigation in the app
 * This is the ONLY component that should make redirect decisions
 */
export const AuthenticationGuard = () => {
  const { user, isLoading, authEvent, profileLoaded } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;
  const searchParams = location.search;
  const navigatingRef = useRef(false);
  const lastNavigationTimeRef = useRef(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const isPwaMode = typeof window !== 'undefined' ? window.isPwaMode() : false;
  
  // Initialize the component
  useEffect(() => {
    if (!isInitialized && !isLoading) {
      console.log("AuthGuard: Initialized", { isPwaMode });
      setIsInitialized(true);
    }
  }, [isLoading, isInitialized]);

  // Cleanup navigation state on unmount
  useEffect(() => {
    return () => {
      if (navigatingRef.current) {
        AuthNavigationService.clearState();
        navigatingRef.current = false;
      }
    };
  }, []);
  
  // Prevent navigation loops with debouncing
  const shouldSkipNavigation = () => {
    const now = Date.now();
    if (now - lastNavigationTimeRef.current < (isPwaMode ? PWA_NAVIGATION_TIMEOUT : NAVIGATION_DEBOUNCE_MS)) {
      console.log("AuthGuard: Skipping navigation - debounce period active");
      return true;
    }
    return false;
  };
  
  // Record navigation
  const recordNavigation = (to: string) => {
    lastNavigationTimeRef.current = Date.now();
    navigatingRef.current = true;
    console.log(`AuthGuard: Navigating to ${to}${isPwaMode ? " (PWA mode)" : ""}`);
  };

  // Handle PWA post-login navigation
  useEffect(() => {
    if (isPwaMode && user && pathname === "/login" && authEvent === "SIGN_IN_COMPLETE") {
      console.log("AuthGuard: PWA detected successful login, preparing navigation");
      
      // Use a longer timeout for PWA to ensure session is fully established
      setTimeout(() => {
        if (user.onboarded) {
          console.log("AuthGuard: PWA redirecting to dashboard after login");
          recordNavigation('/dashboard');
          navigate('/dashboard', { replace: true });
        } else {
          console.log("AuthGuard: PWA redirecting to onboarding after login");
          recordNavigation('/onboarding');
          navigate('/onboarding', { replace: true });
        }
      }, 300);
    }
  }, [user, isPwaMode, pathname, authEvent, navigate]);
  
  // Main navigation logic - consolidated and centralized
  useEffect(() => {
    // Skip if still loading auth state or not initialized
    if (isLoading || !isInitialized) {
      console.log("AuthGuard: Still loading auth state, skipping navigation check");
      return;
    }
    
    // Skip certain paths that have special handling
    if (pathname === "/reset-password" || pathname === "/update-password") {
      console.log("AuthGuard: On special auth path, skipping navigation");
      return;
    }
    
    // Skip if we're in a navigation debounce period
    if (shouldSkipNavigation()) {
      return;
    }
    
    // Don't interrupt an ongoing navigation
    const currentNavState = AuthNavigationService.getState();
    if (currentNavState && Date.now() - currentNavState.timestamp < (isPwaMode ? 1500 : 1000)) {
      console.log(`AuthGuard: Navigation already in progress (${currentNavState.state}), skipping guard checks`);
      return;
    }
    
    console.log("AuthGuard: Evaluating navigation:", { 
      pathname, 
      isAuthenticated: !!user, 
      onboarded: user?.onboarded,
      isRetaking: isRetakingAssessment(searchParams),
      profileLoaded,
      isPwaMode
    });
    
    // Reset navigation reference
    navigatingRef.current = false;
    
    // Wait for profile data to be loaded before making navigation decisions
    if (user && !profileLoaded) {
      console.log("AuthGuard: User exists but profile not fully loaded yet, waiting");
      return;
    }
    
    // Check for PWA-specific redirects first
    if (isPwaMode && user && sessionStorage.getItem('pwa_desired_path')) {
      const desiredPath = sessionStorage.getItem('pwa_desired_path');
      console.log(`AuthGuard: PWA has stored path: ${desiredPath}`);
      
      if (desiredPath && pathname === "/login") {
        console.log(`AuthGuard: PWA redirecting to stored path: ${desiredPath}`);
        sessionStorage.removeItem('pwa_desired_path');
        recordNavigation(desiredPath);
        navigate(desiredPath, { replace: true });
        return;
      }
    }
    
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
      recordNavigation('/login');
      navigate("/login", { replace: true });
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
        recordNavigation('/onboarding');
        navigate("/onboarding", { replace: true });
        return;
      }
      
      // All other pages redirect to onboarding
      console.log("AuthGuard: User needs onboarding, redirecting from", pathname);
      AuthNavigationService.setState(NavigationState.ONBOARDING, { userId: user.id });
      recordNavigation('/onboarding');
      navigate("/onboarding", { replace: true });
      return;
    }
    
    // CASE 3: Authenticated and onboarded
    if (user && user.onboarded) {
      // Redirect from auth pages to dashboard
      if (isOnAuthPage(pathname)) {
        console.log("AuthGuard: Authenticated user on auth page, redirecting to dashboard");
        AuthNavigationService.setState(NavigationState.DASHBOARD_READY, { userId: user.id });
        recordNavigation('/dashboard');
        navigate("/dashboard", { replace: true });
        return;
      }
      
      // Redirect from onboarding to dashboard unless explicitly retaking assessment
      if (isOnOnboardingPage(pathname) && !isRetakingAssessment(searchParams)) {
        console.log("AuthGuard: Onboarded user on onboarding page, redirecting to dashboard");
        AuthNavigationService.setState(NavigationState.DASHBOARD_READY, { userId: user.id });
        recordNavigation('/dashboard');
        navigate("/dashboard", { replace: true });
        return;
      }
      
      // If just authenticated and on chat page WITHOUT intentional navigation, redirect to dashboard
      if (isOnChatPage(pathname) && 
          AuthNavigationService.isFromAuthentication() && 
          !AuthNavigationService.wasIntentionalNavigationToChat()) {
        console.log("AuthGuard: Preventing unintentional navigation to chat - redirecting to dashboard");
        AuthNavigationService.setState(NavigationState.DASHBOARD_READY, { userId: user.id });
        recordNavigation('/dashboard');
        navigate("/dashboard", { replace: true });
        return;
      }
    }
  }, [user, isLoading, pathname, navigate, location.search, authEvent, profileLoaded, isInitialized, isPwaMode]);
  
  // We don't render anything - this is purely for navigation control
  return null;
};
