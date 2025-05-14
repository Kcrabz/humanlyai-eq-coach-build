
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

// Navigation debounce time in milliseconds
const NAVIGATION_DEBOUNCE_MS = 500;
const MOBILE_NAVIGATION_TIMEOUT = 1500;
const MAX_RETRY_ATTEMPTS = 3;

/**
 * Centralized authentication guard that controls all navigation in the app
 */
export const AuthenticationGuard = () => {
  const { 
    user, 
    isLoading, 
    authEvent, 
    profileLoaded, 
    isPwaMode, 
    isMobileDevice,
    loginEvent 
  } = useAuth();
  
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;
  const searchParams = location.search;
  const navigatingRef = useRef(false);
  const lastNavigationTimeRef = useRef(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const navigationLockRef = useRef(false);
  const retryAttemptsRef = useRef(0);
  
  // Check if in special mode (PWA or mobile)
  const isSpecialMode = isPwaMode || isMobileDevice;
  
  // Initialize the component with better mobile debugging
  useEffect(() => {
    if (!isInitialized && !isLoading) {
      console.log("AuthGuard: Initialized", { 
        isPwaMode, 
        isMobileDevice,
        currentPath: pathname,
        user: user ? { id: user.id, onboarded: user.onboarded } : 'none',
        authEvent
      });
      
      setIsInitialized(true);
      
      // Special case: check for stuck login on mobile
      if (isSpecialMode && pathname === "/login" && retryAttemptsRef.current === 0) {
        const loginFlag = sessionStorage.getItem('login_redirect_pending');
        const justLoggedIn = sessionStorage.getItem('just_logged_in');
        
        console.log("AuthGuard: Mobile login page check", {
          loginPending: loginFlag,
          justLoggedIn,
          attempts: retryAttemptsRef.current
        });
        
        // If we detect that we're stuck on login, try to force recovery
        if (loginFlag === 'true' || justLoggedIn === 'true') {
          // Set a recovery timeout
          setTimeout(() => {
            if (pathname === '/login' && user) {
              console.log("AuthGuard: Attempting mobile login recovery");
              retryAttemptsRef.current++;
              
              if (user.onboarded) {
                toast.info("Redirecting to dashboard...");
                navigate('/dashboard', { replace: true });
              } else {
                toast.info("Redirecting to onboarding...");
                navigate('/onboarding', { replace: true });
              }
            }
          }, 2500); // Give more time for initial load
        }
      }
    }
  }, [isLoading, isInitialized, pathname, isPwaMode, isMobileDevice, isSpecialMode, user, authEvent, navigate]);

  // Clear navigation lock on unmount
  useEffect(() => {
    return () => {
      navigationLockRef.current = false;
      retryAttemptsRef.current = 0;
    };
  }, []);
  
  // Handle login events specifically for mobile
  useEffect(() => {
    if (loginEvent === 'LOGIN_COMPLETE' && isSpecialMode && pathname === '/login' && user) {
      console.log("AuthGuard: Login event detected on mobile, redirecting");
      
      // Wait a moment to ensure everything is ready
      setTimeout(() => {
        if (user.onboarded) {
          toast.success("Login successful! Redirecting to dashboard...");
          navigate('/dashboard', { replace: true });
        } else {
          toast.success("Login successful! Redirecting to onboarding...");
          navigate('/onboarding', { replace: true });
        }
        
        // Clean special flags
        sessionStorage.removeItem('login_redirect_pending');
        sessionStorage.removeItem('just_logged_in');
      }, 500);
    }
  }, [loginEvent, isSpecialMode, pathname, user, navigate]);
  
  // Special case for direct login on mobile
  useEffect(() => {
    if (isSpecialMode && pathname === '/login' && user && authEvent === "SIGN_IN_COMPLETE") {
      console.log("AuthGuard: Direct login detected on mobile");
      
      // Mark that login is successful for future checks
      sessionStorage.setItem('login_success_direct', 'true');
      
      // Provide visual feedback
      toast.success("Login successful!");
      
      // Add a delay to ensure UI state is updated
      setTimeout(() => {
        if (user.onboarded) {
          navigate('/dashboard', { replace: true });
        } else {
          navigate('/onboarding', { replace: true });
        }
      }, 1000);
    }
  }, [isSpecialMode, pathname, authEvent, user, navigate]);
  
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
  
  // Record navigation with better tracking
  const recordNavigation = (to: string) => {
    lastNavigationTimeRef.current = Date.now();
    navigatingRef.current = true;
    console.log(`AuthGuard: Navigating to ${to}`, {
      from: pathname,
      isPwa: isPwaMode,
      isMobile: isMobileDevice,
      user: user ? { id: user.id, onboarded: user.onboarded } : 'none',
      timestamp: new Date().toISOString()
    });
  };

  // Main navigation logic - simplified and more resilient
  useEffect(() => {
    // Skip if still loading auth state or not initialized
    if (isLoading || !isInitialized) {
      console.log("AuthGuard: Still loading auth state, skipping navigation check");
      return;
    }
    
    // Skip special auth paths
    if (pathname === "/reset-password" || pathname === "/update-password") {
      return;
    }
    
    // Skip if we're in a navigation debounce period
    if (shouldSkipNavigation()) {
      return;
    }
    
    // Don't interrupt an ongoing navigation 
    const currentNavState = AuthNavigationService.getState();
    const debounceTime = isSpecialMode ? 2000 : 800;
    if (currentNavState && Date.now() - currentNavState.timestamp < debounceTime) {
      console.log(`AuthGuard: Navigation already in progress (${currentNavState.state}), skipping guard checks`);
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
    
    // CASE 1: Not authenticated users
    if (!user) {
      // If on a public page, allow access
      if (isPublicPage(pathname)) {
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
    }
  }, [user, isLoading, pathname, navigate, searchParams, authEvent, profileLoaded, isInitialized, isPwaMode, isMobileDevice, isSpecialMode]);
  
  // We don't render anything - this is purely for navigation control
  return null;
};
