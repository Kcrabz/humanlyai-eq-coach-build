
export interface SessionInfo {
  id: string;
  user_agent: string;
  created_at: string;
  is_current: boolean;
}

export interface SessionCardProps {
  session: SessionInfo;
  onTerminate: (sessionId: string) => void;
  isTerminating: boolean;
}

export interface SessionsListProps {
  sessions: SessionInfo[];
  terminatingSession: string | null;
  onTerminateSession: (sessionId: string) => void;
  loading: boolean;
}

export interface SessionActionsProps {
  onTerminateAll: () => void;
  isTerminating: boolean;
  hasOtherSessions: boolean;
}
