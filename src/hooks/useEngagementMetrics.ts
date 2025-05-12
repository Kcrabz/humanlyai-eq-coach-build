
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface EngagementMetrics {
  registrationDate: string;
  lastLogin: string | null;
  loginCount: number;
  chatMessageCount: number;
  challengeCompletionCount: number;
  currentStreak: number;
  engagementPhase: string;
  engagementScore: number;
  lastCalculatedAt: string;
}

export function useEngagementMetrics() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<EngagementMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load user engagement metrics
  useEffect(() => {
    async function loadMetrics() {
      if (!user?.id) return;

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('user_engagement_metrics')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Error loading engagement metrics:', error);
          setError('Failed to load engagement data');
          return;
        }

        setMetrics({
          registrationDate: data.registration_date,
          lastLogin: data.last_login,
          loginCount: data.login_count,
          chatMessageCount: data.chat_message_count,
          challengeCompletionCount: data.challenge_completion_count,
          currentStreak: data.current_streak,
          engagementPhase: data.engagement_phase,
          engagementScore: data.engagement_score,
          lastCalculatedAt: data.last_calculated_at,
        });
      } catch (err) {
        console.error('Error in loadMetrics:', err);
        setError('Unexpected error loading engagement data');
      } finally {
        setLoading(false);
      }
    }

    loadMetrics();
  }, [user?.id]);

  // Get days since registration
  const daysSinceRegistration = metrics?.registrationDate
    ? Math.floor((Date.now() - new Date(metrics.registrationDate).getTime()) / (1000 * 60 * 60 * 24))
    : null;

  // Get days since last login
  const daysSinceLastLogin = metrics?.lastLogin
    ? Math.floor((Date.now() - new Date(metrics.lastLogin).getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return {
    metrics,
    loading,
    error,
    daysSinceRegistration,
    daysSinceLastLogin,
  };
}
