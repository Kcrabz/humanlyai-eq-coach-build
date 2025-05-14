
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { SessionsList } from "./SessionsList";
import { SessionInfo } from "./types";

export interface SessionsListProps {
  sessions: SessionInfo[];
  terminatingSession: string | null;
  onTerminateSession: (sessionId: string) => void;
  loading: boolean;
}

export const SessionManagement = () => {
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [terminatingSession, setTerminatingSession] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const fetchSessions = async () => {
      setLoading(true);
      try {
        // Fetch sessions from a custom RPC or function that returns proper session data
        const { data, error } = await supabase.rpc('get_user_sessions');
        
        if (error) {
          console.error('Error fetching sessions:', error);
          return;
        }
        
        if (data) {
          // The data should already be in the correct format for SessionInfo
          setSessions(data as SessionInfo[]);
        }
      } catch (err) {
        console.error('Failed to fetch sessions:', err);
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
      // Call an RPC function to terminate the session
      const { error } = await supabase.rpc('terminate_user_session', { 
        session_id: sessionId 
      });
      
      if (error) {
        console.error('Error terminating session:', error);
        return;
      }
      
      // Remove the terminated session from the list
      setSessions(prevSessions => prevSessions.filter(session => session.id !== sessionId));
    } catch (err) {
      console.error('Failed to terminate session:', err);
    } finally {
      setTerminatingSession(null);
    }
  };

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
    </div>
  );
};
