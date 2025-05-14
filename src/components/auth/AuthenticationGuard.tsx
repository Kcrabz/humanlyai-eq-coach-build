
import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { 
  isPwaMode, 
  isMobileDevice, 
  getAuthFlowState, 
  AuthFlowState,
  clearAuthFlowState
} from "@/services/authFlowService";
import { 
  isOnAuthPage, 
  isOnOnboardingPage, 
  isOnChatPage, 
  isOnDashboardPage,
  isRetakingAssessment,
  isPublicPage
} from "@/services/authNavigationService";

/**
 * AuthenticationGuard - Simplified and more reliable version
 * that works with the centralized auth flow service
 */
export const AuthenticationGuard = () => {
  const { 
    user, 
    isLoading, 
    authEvent, 
    profileLoaded
  } = useAuth();
  
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;
  const searchParams = location.search;
  const [isInitialized, setIsInitialized] = useState(false);
  const lastNavigationTimeRef = useRef(0);
  const navigationLockRef = useRef(false);
  
  // Check if in special mode (PWA or mobile)
  const isSpecialMode = isPwaMode() || isMobileDevice();
  
  // Initialize the component
  useEffect(() => {
    if (!isInitialized && !isLoading) {
      console.log("AuthGuard: Initialized", { 
        isPwaMode: isPwaMode(), 
        isMobileDevice: isMobileDevice(),
        currentPath: pathname,
        user: user ? { id: user.id, onboarded: user.onboarded } : 'none',
        authEvent
      });
      
      setIsInitialized(true);
    }
  }, [isLoading, isInitialized, pathname, user, authEvent]);

  // EMERGENCY CASE: Handle stuck login screens
  useEffect(() => {
    // If we're on login page but have successful auth flags
    if (pathname === "/login") {
      const authState = getAuthFlowState();
      const isLoginSuccess = 
        sessionStorage.getItem('login_success') === 'true' || 
        authState?.state === AuthFlowState.SUCCESS;
      
      if (isLoginSuccess && user) {
        console.log("AuthGuard: Detected stuck login screen with auth success");
        
        // Force navigation to appropriate page
        setTimeout(() => {
          if (user.onboarded) {
            console.log("AuthGuard: Emergency redirect to dashboard");
            toast.success("Redirecting to dashboard...");
            navigate("/dashboard", { replace: true });
          } else {
            console.log("AuthGuard: Emergency redirect to onboarding");
            toast.success("Redirecting to onboarding...");
            navigate("/onboarding", { replace: true });
          }
          
          // Clear any stale auth flow state
          clearAuthFlowState();
        }, 500);
      }
    }
  }, [pathname, user, navigate]);
  
  // Special handling for redirections on auth events
  useEffect(() => {
    if (authEvent === "SIGNED_IN" && user && !isLoading) {
      console.log("AuthGuard: Auth event SIGNED_IN detected");
      
      // Only redirect from auth pages
      if (isOnAuthPage(pathname)) {
        // Add small delay to ensure user data is fully loaded
        setTimeout(() => {
          if (user.onboarded) {
            console.log("AuthGuard: Auth event redirect to dashboard");
            navigate("/dashboard", { replace: true });
          } else {
            console.log("AuthGuard: Auth event redirect to onboarding");
            navigate("/onboarding", { replace: true });
          }
          clearAuthFlowState();
        }, 300);
      }
    }
  }, [authEvent, user, isLoading, pathname, navigate]);

  // Prevent navigation loops with debouncing
  const shouldSkipNavigation = (): boolean => {
    // If navigation is locked, skip
    if (navigationLockRef.current) {
      return true;
    }
    
    // Check debounce period
    const now = Date.now();
    const debounceTime = isSpecialMode ? 1500 : 500;
    if (now - lastNavigationTimeRef.current < debounceTime) {
      return true;
    }
    return false;
  };
  
  // Record navigation
  const recordNavigation = (to: string): void => {
    lastNavigationTimeRef.current = Date.now();
    console.log(`AuthGuard: Navigating to ${to}`, {
      from: pathname,
      isPwa: isPwaMode(),
      isMobile: isMobileDevice(),
      user: user ? { id: user.id, onboarded: user.onboarded } : 'none',
      timestamp: new Date().toISOString()
    });
  };

  // MAIN NAVIGATION LOGIC - Simplified for reliability
  useEffect(() => {
    // Skip if still loading auth state or not initialized
    if (isLoading || !isInitialized) {
      return;
    }
    
    // Skip special auth paths
    if (pathname === "/reset-password" || pathname === "/update-password") {
      return;
    }
    
    // Skip debounced navigations
    if (shouldSkipNavigation()) {
      return;
    }
    
    // Wait for profile data to be loaded before making navigation decisions
    if (user && !profileLoaded) {
      return;
    }
    
    // CASE 1: Not authenticated users
    if (!user) {
      // If on a public page, allow access
      if (isPublicPage(pathname)) {
        return;
      }
      
      // Redirect to login from protected pages
      recordNavigation('/login');
      navigate("/login", { replace: true });
      return;
    }
    
    // CASE 2: Authenticated but not onboarded
    if (user && !user.onboarded) {
      // Already on onboarding page
      if (isOnOnboardingPage(pathname)) {
        return;
      }
      
      // Direct to onboarding
      recordNavigation('/onboarding');
      navigate("/onboarding", { replace: true });
      return;
    }
    
    // CASE 3: Authenticated and onboarded
    if (user && user.onboarded) {
      // Redirect from auth pages to dashboard
      if (isOnAuthPage(pathname)) {
        console.log("AuthGuard: Authenticated user on auth page, redirecting to dashboard");
        recordNavigation('/dashboard');
        navigate("/dashboard", { replace: true });
        return;
      }
      
      // Redirect from onboarding unless retaking assessment
      if (isOnOnboardingPage(pathname) && !isRetakingAssessment(searchParams)) {
        recordNavigation('/dashboard');
        navigate("/dashboard", { replace: true });
        return;
      }
    }
  }, [user, isLoading, pathname, navigate, searchParams, profileLoaded, isInitialized]);
  
  // We don't render anything - this is purely for navigation control
  return null;
};
