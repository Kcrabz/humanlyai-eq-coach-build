import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { SessionsList } from "./SessionsList";
import { SessionActions } from "./SessionActions";
import { SessionInfo } from "./types";
import { toast } from "sonner";

export const SessionManagement = () => {
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [terminatingSession, setTerminatingSession] = useState<string | null>(null);
  const [terminatingAll, setTerminatingAll] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const fetchSessions = async () => {
      setLoading(true);
      try {
        // Use a direct query instead of RPC
        const { data, error } = await supabase
          .from('user_login_history')
          .select('id, created_at, user_agent')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error('Error fetching sessions:', error);
          toast.error("Failed to load sessions");
          return;
        }
        
        if (data) {
          // Transform the data to match SessionInfo structure
          const sessionData: SessionInfo[] = data.map(session => ({
            id: session.id,
            user_agent: session.user_agent || 'Unknown Device',
            created_at: session.created_at,
            is_current: false // We'll set this below
          }));

          // Try to identify current session (simplified approach)
          const currentSession = sessionData[0];
          if (currentSession) {
            currentSession.is_current = true;
          }

          setSessions(sessionData);
        }
      } catch (err) {
        console.error('Failed to fetch sessions:', err);
        toast.error("Failed to load sessions");
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [user]);

  const handleTerminateSession = async (sessionId: string) => {
    if (!user) return;
    
    setTerminatingSession(sessionId);
    try {
      // Delete the session entry directly rather than using RPC
      const { error } = await supabase
        .from('user_login_history')
        .delete()
        .eq('id', sessionId)
        .eq('user_id', user.id); // Safety check
      
      if (error) {
        console.error('Error terminating session:', error);
        toast.error("Failed to terminate session");
        return;
      }
      
      // Remove the terminated session from the list
      setSessions(prevSessions => prevSessions.filter(session => session.id !== sessionId));
      toast.success("Session terminated successfully");
    } catch (err) {
      console.error('Failed to terminate session:', err);
      toast.error("Failed to terminate session");
    } finally {
      setTerminatingSession(null);
    }
  };

  const handleTerminateAllOtherSessions = async () => {
    if (!user) return;

    setTerminatingAll(true);
    try {
      // Delete all sessions except current one
      const currentSessionId = sessions.find(s => s.is_current)?.id;
      
      if (!currentSessionId) {
        toast.error("Could not identify current session");
        return;
      }
      
      const { error } = await supabase
        .from('user_login_history')
        .delete()
        .eq('user_id', user.id)
        .neq('id', currentSessionId);
      
      if (error) {
        console.error('Error terminating sessions:', error);
        toast.error("Failed to terminate other sessions");
        return;
      }
      
      // Keep only the current session
      setSessions(prevSessions => prevSessions.filter(session => session.is_current));
      toast.success("All other sessions terminated");
    } catch (err) {
      console.error('Failed to terminate all sessions:', err);
      toast.error("Failed to terminate other sessions");
    } finally {
      setTerminatingAll(false);
    }
  };

  // Check if there are other sessions besides the current one
  const hasOtherSessions = sessions.some(session => !session.is_current);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-medium">Active Sessions</h3>
        <p className="text-muted-foreground">
          Manage your active login sessions across devices
        </p>
      </div>
      <SessionsList 
        sessions={sessions} 
        loading={loading}
        terminatingSession={terminatingSession}
        onTerminateSession={handleTerminateSession}
      />
      <SessionActions 
        onTerminateAll={handleTerminateAllOtherSessions} 
        isTerminating={terminatingAll}
        hasOtherSessions={hasOtherSessions}
      />
    </div>
  );
};
