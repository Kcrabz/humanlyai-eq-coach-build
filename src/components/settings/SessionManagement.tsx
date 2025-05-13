
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { LogOut, Laptop, Smartphone, Clock, Loader2 } from "lucide-react";

// Rename the interface to avoid conflicts with Supabase's Session type
interface SessionInfo {
  id: string;
  user_agent: string;
  created_at: string;
  is_current: boolean;
}

export default function SessionManagement() {
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
      toast({
        title: "Error",
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
      
      toast({
        title: "Success",
        description: "Session terminated successfully"
      });
    } catch (error) {
      console.error("Error terminating session:", error);
      toast({
        title: "Error",
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
      
      toast({
        title: "Success",
        description: "All other sessions terminated successfully"
      });
    } catch (error) {
      console.error("Error terminating all sessions:", error);
      toast({
        title: "Error",
        description: "Failed to terminate sessions",
        variant: "destructive"
      });
    } finally {
      setTerminatingSession(null);
    }
  };
  
  const getDeviceIcon = (userAgent: string) => {
    const ua = userAgent.toLowerCase();
    
    if (ua.includes("mobile") || ua.includes("android") || ua.includes("iphone")) {
      return <Smartphone className="h-4 w-4" />;
    }
    
    return <Laptop className="h-4 w-4" />;
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

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
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {sessions.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  No active sessions found
                </p>
              ) : (
                sessions.map((session) => (
                  <div 
                    key={session.id} 
                    className={`flex items-center justify-between p-3 border rounded-lg ${
                      session.is_current ? "bg-primary/5" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {getDeviceIcon(session.user_agent)}
                      <div>
                        <p className="font-medium">
                          {session.is_current && (
                            <span className="text-humanly-teal mr-1">Current •</span>
                          )}
                          {session.user_agent.split(" ")[0]}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(session.created_at)}
                        </p>
                      </div>
                    </div>
                    
                    {!session.is_current && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTerminateSession(session.id)}
                        disabled={terminatingSession === session.id || terminatingSession === "all"}
                      >
                        {terminatingSession === session.id ? (
                          <Loader2 className="h-3 w-3 animate-spin mr-1" />
                        ) : (
                          <LogOut className="h-3 w-3 mr-1" />
                        )}
                        Terminate
                      </Button>
                    )}
                  </div>
                ))
              )}
            </div>
            
            {sessions.filter(s => !s.is_current).length > 0 && (
              <Button
                variant="outline"
                className="w-full mt-4"
                onClick={handleTerminateAllSessions}
                disabled={terminatingSession !== null}
              >
                {terminatingSession === "all" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Terminating...
                  </>
                ) : (
                  <>
                    <LogOut className="h-4 w-4 mr-2" />
                    Terminate All Other Sessions
                  </>
                )}
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
