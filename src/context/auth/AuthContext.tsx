
import { createContext } from "react";
import { AuthContextType } from "@/types/auth";

/**
 * Create the auth context with default values
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export default AuthContext;

// Enable HMR for this module - using if statement instead of direct export
if (import.meta.hot) {
  import.meta.hot.accept();
}
