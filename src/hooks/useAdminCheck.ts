
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

export const useAdminCheck = () => {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isChecked, setIsChecked] = useState<boolean>(false);
  const { user, isAuthenticated } = useAuth();

  // Store the admin status in sessionStorage to persist across page navigations
  const cacheAdminStatus = useCallback((status: boolean) => {
    try {
      sessionStorage.setItem('user_is_admin', status ? 'true' : 'false');
    } catch (e) {
      console.error("Failed to cache admin status:", e);
    }
  }, []);

  // Get cached admin status
  const getCachedAdminStatus = useCallback((): boolean | null => {
    try {
      const cachedValue = sessionStorage.getItem('user_is_admin');
      if (cachedValue === 'true') return true;
      if (cachedValue === 'false') return false;
      return null; // No cached value
    } catch (e) {
      console.error("Failed to get cached admin status:", e);
      return null;
    }
  }, []);

  // Clear the cached admin status (used when logging out)
  const clearCachedAdminStatus = useCallback(() => {
    try {
      sessionStorage.removeItem('user_is_admin');
    } catch (e) {
      console.error("Failed to clear cached admin status:", e);
    }
  }, []);

  // Force a refresh of the admin status
  const refreshAdminStatus = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setIsAdmin(false);
      setIsLoading(false);
      cacheAdminStatus(false);
      return;
    }

    setIsLoading(true);
    try {
      console.log("useAdminCheck - Force refreshing admin status for:", user.email);
      const { data, error } = await supabase.rpc('is_admin');
      
      if (error) {
        console.error("Error checking admin status:", error);
        setIsAdmin(false);
        cacheAdminStatus(false);
      } else {
        console.log("useAdminCheck - Refreshed admin status result:", data);
        setIsAdmin(data || false);
        cacheAdminStatus(data || false);
      }
    } catch (error) {
      console.error("Unexpected error checking admin status:", error);
      setIsAdmin(false);
      cacheAdminStatus(false);
    } finally {
      setIsLoading(false);
      setIsChecked(true);
    }
  }, [isAuthenticated, user, cacheAdminStatus]);

  useEffect(() => {
    const checkIsAdmin = async () => {
      console.log("useAdminCheck - Starting admin check:", {
        isAuthenticated,
        user: user?.email,
        userId: user?.id
      });
      
      if (!isAuthenticated || !user) {
        console.log("useAdminCheck - User not authenticated or missing");
        setIsAdmin(false);
        setIsLoading(false);
        setIsChecked(true);
        clearCachedAdminStatus();
        return;
      }

      // First check if we have a cached value
      const cachedStatus = getCachedAdminStatus();
      if (cachedStatus !== null) {
        console.log("useAdminCheck - Using cached admin status:", cachedStatus);
        setIsAdmin(cachedStatus);
        setIsLoading(false);
        setIsChecked(true);
        return;
      }

      try {
        console.log("useAdminCheck - Calling is_admin RPC function");
        // Call the is_admin database function
        const { data, error } = await supabase.rpc('is_admin');
        
        if (error) {
          console.error("Error checking admin status:", error);
          setIsAdmin(false);
          cacheAdminStatus(false);
        } else {
          console.log("useAdminCheck - is_admin result:", data);
          setIsAdmin(data || false);
          cacheAdminStatus(data || false);
        }
      } catch (error) {
        console.error("Unexpected error checking admin status:", error);
        setIsAdmin(false);
        cacheAdminStatus(false);
      } finally {
        setIsLoading(false);
        setIsChecked(true);
      }
    };

    if (isAuthenticated && !isChecked) {
      checkIsAdmin();
    } else if (!isAuthenticated) {
      setIsLoading(false);
      setIsChecked(false);
      clearCachedAdminStatus();
    }
  }, [user, isAuthenticated, isChecked, clearCachedAdminStatus, getCachedAdminStatus, cacheAdminStatus]);

  return { 
    isAdmin, 
    isLoading, 
    refreshAdminStatus 
  };
};
