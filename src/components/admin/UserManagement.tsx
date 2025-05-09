
import { useState, memo, useEffect, useRef } from "react";
import { UserManagementLayout } from "./user-management/UserManagementLayout";
import { UserManagementProvider } from "./user-management/UserManagementContext";

interface UserManagementProps {
  initialFilter?: { type: string; value: string };
  onResetFilter?: () => void;
}

const UserManagementComponent = ({ initialFilter, onResetFilter }: UserManagementProps) => {
  const isMountedRef = useRef(false);
  const [mountingComplete, setMountingComplete] = useState(false);

  // One-time mounting effect
  useEffect(() => {
    console.log("UserManagement - Component mounted");
    isMountedRef.current = true;
    
    // Signal mounting complete after a short delay
    const timer = setTimeout(() => {
      if (isMountedRef.current) {
        console.log("UserManagement - Marking mounting as complete");
        setMountingComplete(true);
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      isMountedRef.current = false;
      console.log("UserManagement - Component unmounted");
    };
  }, []);

  return (
    <UserManagementProvider initialFilter={initialFilter} mountingComplete={mountingComplete}>
      <UserManagementLayout onResetFilter={onResetFilter} />
    </UserManagementProvider>
  );
};

export const UserManagement = memo(UserManagementComponent);
