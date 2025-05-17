
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
    if (isMountedRef.current) return; // Only run once
    
    isMountedRef.current = true;
    
    // Signal mounting complete after a short delay
    const timer = setTimeout(() => {
      setMountingComplete(true);
    }, 100);

    return () => {
      clearTimeout(timer);
      isMountedRef.current = false;
    };
  }, []);

  return (
    <UserManagementProvider initialFilter={initialFilter} mountingComplete={mountingComplete}>
      <UserManagementLayout onResetFilter={onResetFilter} />
    </UserManagementProvider>
  );
};

// Component is already wrapped in memo
export const UserManagement = memo(UserManagementComponent);
