
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

// Increased for mobile devices which need more time
const NAVIGATION_DEBOUNCE_MS = 500;

// PWA/mobile-specific timeouts
const MOBILE_NAVIGATION_TIMEOUT = 1500;

/**
 * Centralized authentication guard that controls all navigation in the app
 * Enhanced with special handling for PWA/mobile environments
 */
export const AuthenticationGuard = () => {
  const { user, isLoading, authEvent, profileLoaded, isPwaMode, isMobileDevice } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;
  const searchParams = location.search;
  const navigatingRef = useRef(false);
  const lastNavigationTimeRef = useRef(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const navigationLockRef = useRef(false);
  
  // Check if in special mode (PWA or mobile)
  const isSpecialMode = isPwaMode || isMobileDevice;
  
  // Initialize the component
  useEffect(() => {
    if (!isInitialized && !isLoading) {
      console.log("AuthGuard: Initialized", { isPwaMode, isMobileDevice });
      setIsInitialized(true);
      
      // Check for special login states
      if (isSpecialMode && pathname === "/login") {
        console.log("AuthGuard: Special mode detected on login page. Checking states:", {
          pwaLogin: sessionStorage.getItem('pwa_login_complete'),
          mobileLogin: sessionStorage.getItem('mobile_login_complete'),
          justLoggedIn: sessionStorage.getItem('just_logged_in'),
          loginRedirect: sessionStorage.getItem('login_redirect_pending')
        });
      }
    }
  }, [isLoading, isInitialized, pathname, isPwaMode, isMobileDevice, isSpecialMode]);

  // Cleanup navigation state on unmount
  useEffect(() => {
    return () => {
      if (navigatingRef.current) {
        AuthNavigationService.clearState();
        navigatingRef.current = false;
      }
    };
  }, []);
  
  // Mobile/PWA-specific effects for login page
  useEffect(() => {
    if (isSpecialMode && pathname === '/login' && user && authEvent === "SIGN_IN_COMPLETE") {
      console.log("AuthGuard: Special mode login detected with user:", { id: user.id, onboarded: user.onboarded });
      
      // Add a timeout to ensure we properly redirect after login
      const navigationTimeoutMs = isPwaMode ? 2000 : (isMobileDevice ? 1500 : 1000);
      const navigationTimeout = setTimeout(() => {
        if (user.onboarded) {
          console.log("AuthGuard: Mobile/PWA redirect to dashboard after login timeout");
          if (!navigationLockRef.current) {
            navigationLockRef.current = true;
            recordNavigation('/dashboard');
            navigate('/dashboard', { replace: true });
            
            // Reset navigation lock after navigation completes
            setTimeout(() => {
              navigationLockRef.current = false;
              
              // Clean up special flags to prevent duplicate navigation
              sessionStorage.removeItem('pwa_login_complete');
              sessionStorage.removeItem('mobile_login_complete');
              sessionStorage.removeItem('just_logged_in');
              sessionStorage.removeItem('login_redirect_pending');
            }, 2000);
          }
        } else {
          console.log("AuthGuard: Mobile/PWA redirect to onboarding after login timeout");
          if (!navigationLockRef.current) {
            navigationLockRef.current = true;
            recordNavigation('/onboarding');
            navigate('/onboarding', { replace: true });
            
            // Reset navigation lock after navigation completes
            setTimeout(() => {
              navigationLockRef.current = false;
              
              // Clean up special flags to prevent duplicate navigation
              sessionStorage.removeItem('pwa_login_complete');
              sessionStorage.removeItem('mobile_login_complete');
              sessionStorage.removeItem('just_logged_in');
              sessionStorage.removeItem('login_redirect_pending');
            }, 2000);
          }
        }
      }, navigationTimeoutMs);
      
      return () => clearTimeout(navigationTimeout);
    }
  }, [user, isSpecialMode, pathname, authEvent, navigate, isPwaMode, isMobileDevice]);
  
  // Prevent navigation loops with debouncing
  const shouldSkipNavigation = () => {
    // If navigation is locked, skip
    if (navigationLockRef.current) {
      console.log("AuthGuard: Skipping navigation - navigation lock active");
      return true;
    }
    
    // Check debounce period
    const now = Date.now();
    const debounceTime = isSpecialMode ? MOBILE_NAVIGATION_TIMEOUT : NAVIGATION_DEBOUNCE_MS;
    if (now - lastNavigationTimeRef.current < debounceTime) {
      console.log("AuthGuard: Skipping navigation - debounce period active");
      return true;
    }
    return false;
  };
  
  // Record navigation
  const recordNavigation = (to: string) => {
    lastNavigationTimeRef.current = Date.now();
    navigatingRef.current = true;
    console.log(`AuthGuard: Navigating to ${to}${isPwaMode ? " (PWA mode)" : isMobileDevice ? " (Mobile device)" : ""}`);
  };

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
    const debounceTime = isSpecialMode ? 2500 : 1000;
    if (currentNavState && Date.now() - currentNavState.timestamp < debounceTime) {
      console.log(`AuthGuard: Navigation already in progress (${currentNavState.state}), skipping guard checks`);
      return;
    }
    
    // Special handling for mobile/PWA login
    if (isSpecialMode && pathname === "/login" && user && (
      sessionStorage.getItem('pwa_login_complete') === 'true' || 
      sessionStorage.getItem('mobile_login_complete') === 'true' ||
      sessionStorage.getItem('login_redirect_pending') === 'true'
    )) {
      console.log("AuthGuard: Special login completion detected, handling navigation");
      // The dedicated effect will handle this case
      return;
    }
    
    console.log("AuthGuard: Evaluating navigation:", { 
      pathname, 
      isAuthenticated: !!user, 
      onboarded: user?.onboarded,
      isRetaking: isRetakingAssessment(searchParams),
      profileLoaded,
      isPwaMode,
      isMobileDevice
    });
    
    // Reset navigation reference
    navigatingRef.current = false;
    
    // Wait for profile data to be loaded before making navigation decisions
    if (user && !profileLoaded) {
      console.log("AuthGuard: User exists but profile not fully loaded yet, waiting");
      return;
    }
    
    // Check for PWA-specific redirects first
    if (isSpecialMode && user && sessionStorage.getItem('pwa_desired_path')) {
      const desiredPath = sessionStorage.getItem('pwa_desired_path');
      console.log(`AuthGuard: Special mode has stored path: ${desiredPath}`);
      
      if (desiredPath && pathname === "/login") {
        console.log(`AuthGuard: Special mode redirecting to stored path: ${desiredPath}`);
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
        AuthNavigationService.setState(NavigationState.ONBOARDING, { 
          userId: user.id,
          isPwa: isPwaMode,
          isMobile: isMobileDevice
        });
        recordNavigation('/onboarding');
        navigate("/onboarding", { replace: true });
        return;
      }
      
      // All other pages redirect to onboarding
      console.log("AuthGuard: User needs onboarding, redirecting from", pathname);
      AuthNavigationService.setState(NavigationState.ONBOARDING, { 
        userId: user.id,
        isPwa: isPwaMode,
        isMobile: isMobileDevice
      });
      recordNavigation('/onboarding');
      navigate("/onboarding", { replace: true });
      return;
    }
    
    // CASE 3: Authenticated and onboarded
    if (user && user.onboarded) {
      // Redirect from auth pages to dashboard
      if (isOnAuthPage(pathname)) {
        console.log("AuthGuard: Authenticated user on auth page, redirecting to dashboard");
        AuthNavigationService.setState(NavigationState.DASHBOARD_READY, { 
          userId: user.id,
          isPwa: isPwaMode,
          isMobile: isMobileDevice
        });
        recordNavigation('/dashboard');
        navigate("/dashboard", { replace: true });
        return;
      }
      
      // Redirect from onboarding to dashboard unless explicitly retaking assessment
      if (isOnOnboardingPage(pathname) && !isRetakingAssessment(searchParams)) {
        console.log("AuthGuard: Onboarded user on onboarding page, redirecting to dashboard");
        AuthNavigationService.setState(NavigationState.DASHBOARD_READY, { 
          userId: user.id,
          isPwa: isPwaMode,
          isMobile: isMobileDevice
        });
        recordNavigation('/dashboard');
        navigate("/dashboard", { replace: true });
        return;
      }
      
      // If just authenticated and on chat page WITHOUT intentional navigation, redirect to dashboard
      if (isOnChatPage(pathname) && 
          AuthNavigationService.isFromAuthentication() && 
          !AuthNavigationService.wasIntentionalNavigationToChat()) {
        console.log("AuthGuard: Preventing unintentional navigation to chat - redirecting to dashboard");
        AuthNavigationService.setState(NavigationState.DASHBOARD_READY, { 
          userId: user.id,
          isPwa: isPwaMode,
          isMobile: isMobileDevice
        });
        recordNavigation('/dashboard');
        navigate("/dashboard", { replace: true });
        return;
      }
    }
  }, [user, isLoading, pathname, navigate, location.search, authEvent, profileLoaded, isInitialized, isPwaMode, isMobileDevice, isSpecialMode]);
  
  // We don't render anything - this is purely for navigation control
  return null;
};
