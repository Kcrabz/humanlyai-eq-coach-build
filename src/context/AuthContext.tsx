
import { useContext } from "react";
import AuthContext from "./auth/AuthContext";
import { AuthProvider } from "./auth/AuthProvider";
import { toast } from "sonner";

// Re-export the provider
export { AuthProvider };

// Export the hook for consuming the context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    console.error("useAuth must be used within an AuthProvider");
    toast.error("Authentication error", { 
      description: "Auth context not available" 
    });
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
