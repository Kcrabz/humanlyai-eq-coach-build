import React, { useState, useEffect } from 'react';
import { SessionsList } from './SessionsList';
import { SessionActions } from './SessionActions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { SessionInfo } from './types';
import { toast } from 'sonner';

export const SessionManagement = () => {
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [terminatingSession, setTerminatingSession] = useState<string | null>(null);
  const [terminatingAll, setTerminatingAll] = useState(false);

  // Fetch active sessions
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          setLoading(false);
          return;
        }
        
        const { data: sessions, error } = await supabase
          .from('user_sessions')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false });
        
        if (error) {
          throw error;
        }
        
        // Mark current session
        const processedSessions = sessions.map(s => ({
          ...s,
          is_current: s.id === session.user.session.id
        }));
        
        setSessions(processedSessions);
      } catch (error) {
        console.error('Error fetching sessions:', error);
        toast.error('Failed to load sessions');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSessions();
  }, []);

  // Handle session termination
  const handleTerminateSession = async (sessionId: string) => {
    try {
      setTerminatingSession(sessionId);
      
      const { error } = await supabase.functions.invoke('terminate-session', {
        body: { session_id: sessionId }
      });
      
      if (error) {
        throw error;
      }
      
      // Update sessions list
      setSessions(prev => prev.filter(session => session.id !== sessionId));
      toast.success('Session terminated successfully');
    } catch (error) {
      console.error('Error terminating session:', error);
      toast.error('Failed to terminate session');
    } finally {
      setTerminatingSession(null);
    }
  };

  // Handle termination of all other sessions
  const handleTerminateAllOtherSessions = async () => {
    try {
      setTerminatingAll(true);
      
      // Get current session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No active session found');
      }
      
      const { error } = await supabase.functions.invoke('terminate-all-sessions', {
        body: { except_session_id: session.user.session.id }
      });
      
      if (error) {
        throw error;
      }
      
      // Update sessions list to keep only current session
      setSessions(prev => prev.filter(s => s.is_current));
      toast.success('All other sessions terminated successfully');
    } catch (error) {
      console.error('Error terminating all sessions:', error);
      toast.error('Failed to terminate other sessions');
    } finally {
      setTerminatingAll(false);
    }
  };

  // Check if there are other sessions besides the current one
  const hasOtherSessions = sessions.some(session => !session.is_current);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Session Management</CardTitle>
        <CardDescription>Manage your active sessions across devices</CardDescription>
      </CardHeader>
      <CardContent>
        <SessionsList 
          sessions={sessions}
          terminatingSession={terminatingSession}
          onTerminateSession={handleTerminateSession}
          loading={loading}
        />
        
        <SessionActions
          onTerminateAll={handleTerminateAllOtherSessions}
          isTerminating={terminatingAll}
          hasOtherSessions={hasOtherSessions}
        />
      </CardContent>
    </Card>
  );
};
