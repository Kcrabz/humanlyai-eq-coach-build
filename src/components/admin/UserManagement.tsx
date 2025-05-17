
import { useState, memo, useEffect, useRef } from "react";
import { UserManagementLayout } from "./user-management/UserManagementLayout";
import { UserManagementProvider } from "./user-management/UserManagementContext";

interface UserManagementProps {
  initialFilter?: { type: string; value: string };
  onResetFilter?: () => void;
}

const UserManagementComponent = ({ initialFilter, onResetFilter }: UserManagementProps) => {
  const hasMounted = useRef(false);
  const [mountingComplete, setMountingComplete] = useState(false);

  // One-time mounting logic - only runs once, no matter what
  useEffect(() => {
    // Only run this once
    if (!hasMounted.current) {
      hasMounted.current = true;
      
      // Signal mounting complete after a short delay to allow for initial rendering
      const timer = setTimeout(() => {
        setMountingComplete(true);
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <UserManagementProvider 
      initialFilter={initialFilter} 
      mountingComplete={mountingComplete}
      key="user-management-provider" // Use stable key to prevent remounting
    >
      <UserManagementLayout onResetFilter={onResetFilter} />
    </UserManagementProvider>
  );
};

// Use memo with careful equality check to prevent unnecessary re-renders
export const UserManagement = memo(UserManagementComponent, (prevProps, nextProps) => {
  // Only re-render if these props actually change
  return (
    prevProps.initialFilter?.type === nextProps.initialFilter?.type &&
    prevProps.initialFilter?.value === nextProps.initialFilter?.value
  );
});
