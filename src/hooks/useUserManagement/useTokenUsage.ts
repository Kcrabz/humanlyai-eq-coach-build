
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
      
      // Now get the users' subscription tiers to determine their limits
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, subscription_tier')
        .in('id', userIds);
      
      if (profilesError) {
        console.error("Error fetching profile tiers:", profilesError);
      } else if (profiles) {
        // Set limits based on subscription tier
        profiles.forEach(profile => {
          if (!usageMap[profile.id]) {
            usageMap[profile.id] = { usage: 0, limit: 0 };
          }
          
          // Set limit based on subscription tier
          switch(profile.subscription_tier) {
            case 'premium':
              usageMap[profile.id].limit = 100000; // 100k tokens for premium
              break;
            case 'basic':
              usageMap[profile.id].limit = 50000;  // 50k tokens for basic
              break;
            default: // free or trial
              usageMap[profile.id].limit = 25000;  // 25k tokens for free/trial
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
