
import { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { isOnAuthPage } from "@/utils/navigationUtils";
import { toast } from "sonner";
import { wasLoginSuccessful, clearLoginSuccess } from "@/utils/loginRedirectUtils";

/**
 * Improved authentication guard with better protection against redirect loops
 */
export const AuthenticationGuard = () => {
  const { user, isLoading, authEvent } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;
  const redirectedRef = useRef(false);
  const redirectAttemptCount = useRef(0);
  const lastPathRef = useRef(pathname);
  const loginToastShownRef = useRef(false);
  const justLoggedInRef = useRef(wasLoginSuccessful());
  
  // Reset redirect tracking when path changes
  useEffect(() => {
    if (lastPathRef.current !== pathname) {
      console.log(`Path changed from ${lastPathRef.current} to ${pathname}`);
      redirectAttemptCount.current = 0;
      redirectedRef.current = false;
      lastPathRef.current = pathname;
      
      // Clear toast flag when changing paths
      loginToastShownRef.current = false;
    }
  }, [pathname]);
  
  // Show welcome toast on successful login
  useEffect(() => {
    if (user && (authEvent === 'SIGN_IN_COMPLETE') && !loginToastShownRef.current) {
      const firstName = user?.name ? user.name.split(" ")[0] : '';
      toast.success(`Welcome back${firstName ? `, ${firstName}` : ''}!`);
      loginToastShownRef.current = true;
    }
  }, [user, authEvent]);
  
  // Main auth redirection effect - improved for reliability
  useEffect(() => {
    // Skip if still loading auth state or we've already redirected on this path
    if (isLoading || redirectedRef.current) return;
    
    // Safety limit for redirect attempts (increased from 10 to 15)
    redirectAttemptCount.current += 1;
    if (redirectAttemptCount.current > 15) {
      console.warn("Too many redirect attempts, breaking the loop", {
        path: pathname,
        hasUser: !!user,
        attempts: redirectAttemptCount.current
      });
      return;
    }
    
    console.log("AuthGuard checking state:", { 
      isLoading, 
      hasUser: !!user, 
      path: pathname, 
      authEvent,
      onboarded: user?.onboarded,
      attempts: redirectAttemptCount.current,
      justLoggedIn: justLoggedInRef.current
    });
    
    // Skip navigation for password reset pages
    if (pathname === "/reset-password" || pathname === "/update-password") return;
    
    const isCurrentlyOnAuth = isOnAuthPage(pathname);
    
    // If user just logged in via login form, let the form handle navigation
    // Skip first redirection check in AuthGuard to avoid race conditions
    if (justLoggedInRef.current && isCurrentlyOnAuth) {
      console.log("User just logged in via login form, skipping AuthGuard redirection");
      // Clear the login success flag after checking it once
      justLoggedInRef.current = false;
      clearLoginSuccess();
      return;
    }
    
    if (user) {
      // Priority path: Redirect to onboarding if not onboarded
      if (!user.onboarded && pathname !== "/onboarding") {
        console.log("Redirecting to onboarding");
        redirectedRef.current = true;
        navigate("/onboarding", { replace: true });
        return;
      } 
      
      // Redirect authenticated users on auth pages to dashboard
      if (user.onboarded && isCurrentlyOnAuth) {
        console.log("Authenticated user on auth page, redirecting to dashboard");
        redirectedRef.current = true;
        navigate("/dashboard", { replace: true });
        return;
      }

      // Redirect authenticated users on root to dashboard
      if (user.onboarded && pathname === "/") {
        console.log("Authenticated user on root page, redirecting to dashboard");
        redirectedRef.current = true;
        navigate("/dashboard", { replace: true });
        return;
      }
    } 
    // Redirect unauthenticated users from protected routes to login
    else if (!user && pathname !== "/" && !isCurrentlyOnAuth) {
      console.log("Unauthenticated user on protected route, redirecting to login");
      redirectedRef.current = true;
      navigate("/login", { replace: true });
    }
  }, [user, isLoading, pathname, navigate, authEvent]);

  return null;
};
