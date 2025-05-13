import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Clock } from "lucide-react";
import { SessionsList } from "./SessionsList";
import { SessionActions } from "./SessionActions";
import { SessionInfo } from "./types";

export const SessionManagement: React.FC = () => {
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [terminatingSession, setTerminatingSession] = useState<string | null>(null);
  
  useEffect(() => {
    loadSessions();
  }, []);
  
  const loadSessions = async () => {
    try {
      setLoading(true);
      
      // Get current session
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      
      // Get login history from user_login_history table
      const { data: loginHistory, error } = await supabase
        .from("user_login_history")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);
        
      if (error) throw error;
      
      // Transform and mark current session
      const formattedSessions: SessionInfo[] = loginHistory?.map(session => ({
        id: session.id,
        user_agent: session.user_agent || "Unknown device",
        created_at: session.created_at,
        is_current: currentSession?.user?.id === session.user_id
      })) || [];
      
      setSessions(formattedSessions);
    } catch (error) {
      console.error("Error loading sessions:", error);
      toast("Error", {
        description: "Failed to load sessions",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleTerminateSession = async (sessionId: string) => {
    setTerminatingSession(sessionId);
    try {
      // In a real implementation, this would call an API to terminate the session
      // For now, we'll just simulate it
      
      await new Promise(r => setTimeout(r, 1000)); // Simulate API call
      
      // Remove from the list
      setSessions(sessions.filter(s => s.id !== sessionId));
      
      toast("Success", {
        description: "Session terminated successfully"
      });
    } catch (error) {
      console.error("Error terminating session:", error);
      toast("Error", {
        description: "Failed to terminate session",
        variant: "destructive"
      });
    } finally {
      setTerminatingSession(null);
    }
  };
  
  const handleTerminateAllSessions = async () => {
    setTerminatingSession("all");
    try {
      // Sign out from all sessions
      const { error } = await supabase.auth.signOut({ scope: "others" });
      
      if (error) throw error;
      
      // Keep only current session in the list
      setSessions(sessions.filter(s => s.is_current));
      
      toast("Success", {
        description: "All other sessions terminated successfully"
      });
    } catch (error) {
      console.error("Error terminating all sessions:", error);
      toast("Error", {
        description: "Failed to terminate sessions",
        variant: "destructive"
      });
    } finally {
      setTerminatingSession(null);
    }
  };

  const hasOtherSessions = sessions.filter(s => !s.is_current).length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-humanly-teal" />
          Active Sessions
        </CardTitle>
        <CardDescription>
          Manage your active sessions across devices
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <SessionsList
          sessions={sessions}
          terminatingSession={terminatingSession}
          onTerminateSession={handleTerminateSession}
          loading={loading}
        />
        
        <SessionActions
          onTerminateAll={handleTerminateAllSessions}
          isTerminating={terminatingSession === "all"}
          hasOtherSessions={hasOtherSessions}
        />
      </CardContent>
    </Card>
  );
};
