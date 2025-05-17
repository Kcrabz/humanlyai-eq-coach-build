
import { useContext } from "react";
import AuthContext from "./auth/AuthContext";
import { AuthProvider } from "./auth/AuthProvider";

// Re-export the provider component
export { AuthProvider };

// Export the hook for consuming the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  
  return context;
};
