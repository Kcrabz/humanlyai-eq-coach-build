
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useTokenUsage = () => {
  const [tokenUsageData, setTokenUsageData] = useState<Record<string, { usage: number; limit: number }>>({});
  
  // Fetch token usage data with better error handling and timezone awareness
  const fetchTokenUsageData = async (userIds: string[]) => {
    if (!userIds.length) return {};
    
    const usageMap: Record<string, { usage: number; limit: number }> = {};
    
    try {
      // Get the current month in YYYY-MM format for filtering
      const currentDate = new Date();
      const currentMonthYear = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
      
      console.log(`Fetching token usage for month: ${currentMonthYear}`);
      
      // Initialize all users with zero usage to ensure everyone has a record
      userIds.forEach(id => {
        usageMap[id] = { usage: 0, limit: 0 };
      });
      
      // Fetch token usage for the current month
      const { data: usageData, error: usageError } = await supabase
        .from('usage_logs')
        .select('user_id, token_count')
        .eq('month_year', currentMonthYear)
        .in('user_id', userIds);
      
      if (usageError) {
        console.error("Error fetching token usage:", usageError);
      } else if (usageData) {
        // Calculate total usage per user
        usageData.forEach(log => {
          if (!usageMap[log.user_id]) {
            usageMap[log.user_id] = { usage: 0, limit: 0 };
          }
          usageMap[log.user_id].usage += log.token_count || 0;
        });
        
        console.log(`Found token usage records for ${usageData.length} entries`);
      }
      
      // Now get the users' subscription tiers and account creation dates to determine limits and trial status
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, subscription_tier, created_at')
        .in('id', userIds);
      
      if (profilesError) {
        console.error("Error fetching profile tiers:", profilesError);
      } else if (profiles) {
        // Set limits based on subscription tier
        profiles.forEach(profile => {
          if (!usageMap[profile.id]) {
            usageMap[profile.id] = { usage: 0, limit: 0 };
          }
          
          // Check if user is in trial period (first 24 hours)
          let isInTrial = false;
          if (profile.created_at) {
            const createdDate = new Date(profile.created_at);
            const now = new Date();
            const hoursSinceCreation = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60);
            isInTrial = hoursSinceCreation <= 24;
          }
          
          // Set effective subscription tier
          const effectiveTier = isInTrial ? 'trial' : profile.subscription_tier;
          
          // Set limit based on subscription tier
          switch(effectiveTier) {
            case 'trial':
              usageMap[profile.id].limit = 50000; // High limit for trial users
              break;
            case 'premium':
              usageMap[profile.id].limit = 25000; // 25k tokens for premium
              break;
            case 'basic':
              usageMap[profile.id].limit = 10000; // 10k tokens for basic
              break;
            default: // free
              usageMap[profile.id].limit = 500;  // 500 tokens for free
          }
        });
      }
      
      setTokenUsageData(usageMap); // Update state with fetched data
      return usageMap;
    } catch (err) {
      console.error("Error processing token usage data:", err);
      return usageMap; // Return whatever we have on error
    }
  };

  return {
    tokenUsageData,
    fetchTokenUsageData
  };
};
