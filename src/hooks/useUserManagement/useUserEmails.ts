
import { supabase } from "@/integrations/supabase/client";
import { useCallback, useRef } from "react";

export const useUserEmails = () => {
  // Cache map to store previously fetched emails
  const emailCacheRef = useRef<Map<string, string>>(new Map());
  // Track in-flight requests to prevent duplicates
  const pendingRequestRef = useRef<Promise<Map<string, string>> | null>(null);
  
  // Fetch user emails from the admin edge function with caching and deduplication
  const fetchUserEmails = useCallback(async (userIds: string[]) => {
    if (!userIds.length) return new Map();
    
    try {
      // Filter out userIds that we already have in cache
      const uncachedUserIds = userIds.filter(id => !emailCacheRef.current.has(id));
      
      // If all emails are in cache, return the cached data immediately
      if (uncachedUserIds.length === 0) {
        console.log("All user emails found in cache, skipping fetch");
        return emailCacheRef.current;
      }
      
      // If there's already a request in flight, wait for it instead of making a new one
      if (pendingRequestRef.current) {
        console.log("Email fetch already in progress, waiting for it to complete");
        await pendingRequestRef.current;
        return emailCacheRef.current;
      }
      
      // Create a new promise for this request
      pendingRequestRef.current = (async () => {
        console.log(`Fetching emails for ${uncachedUserIds.length} users`);
        const { data, error } = await supabase.functions.invoke('admin-get-user-emails', {
          body: { userIds: uncachedUserIds },
        });

        if (error) {
          console.error("Error fetching user emails:", error);
          return emailCacheRef.current;
        }

        // Update the cache with new data
        if (data && Array.isArray(data)) {
          data.forEach((item: { id: string; email: string }) => {
            if (item && item.id && item.email) {
              emailCacheRef.current.set(item.id, item.email);
            }
          });
        }
        
        return emailCacheRef.current;
      })();
      
      // Wait for the request to complete
      const result = await pendingRequestRef.current;
      // Clear the pending request
      pendingRequestRef.current = null;
      return result;
    } catch (error) {
      console.error("Failed to fetch user emails:", error);
      pendingRequestRef.current = null;
      return emailCacheRef.current;
    }
  }, []);

  return { fetchUserEmails };
};
