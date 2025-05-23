
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { EQBreakthrough } from '@/types/auth';
import { toast } from 'sonner';

export interface EQProgressStats {
  totalBreakthroughs: number;
  breakthroughsByCategory: Record<string, number>;
  recentBreakthroughs: EQBreakthrough[];
  loading: boolean;
}

export const useEQProgress = () => {
  const { user, isPremiumMember } = useAuth();
  const [stats, setStats] = useState<EQProgressStats>({
    totalBreakthroughs: 0,
    breakthroughsByCategory: {},
    recentBreakthroughs: [],
    loading: false
  });

  // Fetch EQ progress data
  const fetchEQProgress = useCallback(async () => {
    if (!user?.id || !isPremiumMember) return;
    
    setStats(prev => ({ ...prev, loading: true }));
    
    try {
      // Direct query instead of RPC for breakthroughs
      const { data: breakthroughs, error: breakthroughsError } = await supabase
        .from('eq_breakthroughs')
        .select('*')
        .eq('user_id', user.id)
        .order('detected_at', { ascending: false })
        .limit(10);
        
      if (breakthroughsError) throw breakthroughsError;
      
      // Get category counts with a different approach - fetch all first, then count client-side
      const { data: allBreakthroughs, error: categoryError } = await supabase
        .from('eq_breakthroughs')
        .select('category')
        .eq('user_id', user.id);
        
      if (categoryError) throw categoryError;
      
      // Format data
      const breakthroughsByCategory: Record<string, number> = {};
      let totalBreakthroughs = 0;
      
      // If we got data back and it's an array as expected
      if (Array.isArray(allBreakthroughs)) {
        // Count categories
        allBreakthroughs.forEach(item => {
          if (!breakthroughsByCategory[item.category]) {
            breakthroughsByCategory[item.category] = 0;
          }
          breakthroughsByCategory[item.category]++;
          totalBreakthroughs++;
        });
      }
      
      // Transform breakthroughs to match interface
      const formattedBreakthroughs: EQBreakthrough[] = Array.isArray(breakthroughs) ? 
        breakthroughs.map(item => ({
          id: item.id,
          userId: item.user_id,
          message: item.message,
          insight: item.insight,
          detectedAt: item.detected_at,
          category: item.category
        })) : [];
      
      setStats({
        totalBreakthroughs,
        breakthroughsByCategory,
        recentBreakthroughs: formattedBreakthroughs,
        loading: false
      });
      
    } catch (error) {
      console.error('Error fetching EQ progress:', error);
      toast.error('Failed to load EQ progress data');
      setStats(prev => ({ ...prev, loading: false }));
    }
  }, [user?.id, isPremiumMember]);
  
  // Check if a message contains an EQ breakthrough
  const checkForBreakthrough = useCallback(async (message: string, messageId: string): Promise<boolean> => {
    if (!user?.id || !isPremiumMember || !message) return false;
    
    try {
      const response = await supabase.functions.invoke('detect-eq-breakthrough', {
        body: { message, userId: user.id, messageId }
      });
      
      if (response.error) {
        console.error('Error detecting breakthrough:', response.error);
        return false;
      }
      
      if (response.data?.breakthrough) {
        // Refresh stats if a breakthrough was detected
        await fetchEQProgress();
        
        // Show toast notification for the breakthrough
        toast.success('EQ Breakthrough Detected!', {
          description: `You've made progress in ${response.data.category}`,
          duration: 5000
        });
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error checking for breakthrough:', error);
      return false;
    }
  }, [user?.id, isPremiumMember, fetchEQProgress]);
  
  // Load initial data
  useEffect(() => {
    if (user?.id && isPremiumMember) {
      fetchEQProgress();
    }
  }, [user?.id, isPremiumMember, fetchEQProgress]);
  
  return {
    ...stats,
    fetchEQProgress,
    checkForBreakthrough,
    isPremium: isPremiumMember
  };
};
