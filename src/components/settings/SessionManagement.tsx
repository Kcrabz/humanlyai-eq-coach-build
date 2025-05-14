
import { SessionManagement as ActualSessionManagement } from "./sessions/SessionManagement";

export const SessionManagement = () => {
  // Re-export the component from sessions directory
  return <ActualSessionManagement />;
};
