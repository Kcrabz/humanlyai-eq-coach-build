
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { SessionManagement as ActualSessionManagement } from "./sessions/SessionManagement";

export const SessionManagement = () => {
  // Re-export the component from sessions directory
  return <ActualSessionManagement />;
};
