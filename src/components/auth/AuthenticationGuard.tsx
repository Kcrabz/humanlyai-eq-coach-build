
import { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { isOnAuthPage } from "@/utils/navigationUtils";
import { toast } from "sonner";
import { 
  wasLoginSuccessful,
  isFirstLoginAfterLoad,
  markLoginSuccess,
  isRedirectInProgress,
  clearRedirectInProgress
} from "@/utils/loginRedirectUtils";

/**
 * Optimized authentication guard with reduced checks for faster performance
 */
export const AuthenticationGuard = () => {
  const { user, isLoading, authEvent } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;
  const redirectedRef = useRef(false);
  const redirectAttemptCount = useRef(0);
  const lastPathRef = useRef(pathname);
  
  // Debug redirect attempts
  useEffect(() => {
    // Reset redirect counter when path actually changes
    if (lastPathRef.current !== pathname) {
      console.log(`Path changed from ${lastPathRef.current} to ${pathname}`);
      redirectAttemptCount.current = 0;
      redirectedRef.current = false;
      lastPathRef.current = pathname;
    }
  }, [pathname]);
  
  // Cleanup function for the redirect in progress flag
  useEffect(() => {
    return () => {
      // If we navigate away while a redirect is in progress, clear the flag
      if (isRedirectInProgress()) {
        console.log("Clearing redirect in progress flag on AuthGuard unmount");
        clearRedirectInProgress();
      }
    };
  }, []);
  
  // Handle immediate welcome toast for better UX
  useEffect(() => {
    if (user && (authEvent === 'SIGN_IN_COMPLETE' || wasLoginSuccessful() || isFirstLoginAfterLoad())) {
      // Show welcome toast if not already shown in LoginForm
      if (!document.body.getAttribute('data-toast-shown')) {
        const firstName = user?.name ? user.name.split(" ")[0] : '';
        toast.success(`Welcome back${firstName ? `, ${firstName}` : ''}!`);
        document.body.setAttribute('data-toast-shown', 'true');
      }
      
      // Mark login as successful for redirects
      if (authEvent === 'SIGN_IN_COMPLETE') {
        markLoginSuccess();
      }
    }
    
    // Clear toast flag when leaving the page
    return () => {
      document.body.removeAttribute('data-toast-shown');
    };
  }, [user, authEvent]);
  
  // Main auth redirection effect - simplified for performance
  useEffect(() => {
    // Skip if still loading auth state or we've already redirected on this path
    if (isLoading || redirectedRef.current) return;
    
    // Increment redirect attempt counter
    redirectAttemptCount.current += 1;
    
    // Safety circuit breaker - if too many attempts, don't redirect
    if (redirectAttemptCount.current > 3) {
      console.warn("Too many redirect attempts, breaking the loop", {
        path: pathname,
        user: !!user,
        attempts: redirectAttemptCount.current
      });
      return;
    }
    
    console.log("AuthGuard checking state:", { 
      isLoading, 
      user: user?.id ? "Yes" : "No", 
      path: pathname, 
      authEvent,
      onboarded: user?.onboarded,
      attempts: redirectAttemptCount.current
    });
    
    // Skip navigation for password reset pages
    if (pathname === "/reset-password" || pathname === "/update-password") return;
    
    // Skip redirects if we're already on the right page
    const isCurrentlyOnAuth = isOnAuthPage(pathname);
    
    if (user) {
      console.log("User is authenticated on path:", pathname);
      
      // Priority path: Redirect to onboarding if not onboarded
      if (!user.onboarded && pathname !== "/onboarding") {
        console.log("Redirecting to onboarding");
        redirectedRef.current = true;
        navigate("/onboarding", { replace: true });
        return;
      } 
      
      // Handle authenticated users on auth pages - direct them to dashboard
      if (user.onboarded && isCurrentlyOnAuth) {
        console.log("Authenticated user on auth page, redirecting to dashboard");
        redirectedRef.current = true;
        navigate("/dashboard", { replace: true });
        return;
      }

      // Handle root path - redirect to dashboard for authenticated users
      if (user.onboarded && pathname === "/") {
        console.log("Authenticated user on root page, redirecting to dashboard");
        redirectedRef.current = true;
        navigate("/dashboard", { replace: true });
        return;
      }
    } 
    // Simple case: Unauthenticated users trying to access protected routes
    else if (!user && pathname !== "/" && !isCurrentlyOnAuth) {
      console.log("Unauthenticated user on protected route, redirecting to login");
      redirectedRef.current = true;
      navigate("/login", { replace: true });
    }
  }, [user, isLoading, pathname, navigate, authEvent]);

  return null;
};
