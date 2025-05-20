
import { createContext } from "react";
import { AuthContextType } from "@/types/auth";

/**
 * Create the auth context with default values
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export default AuthContext;

// Enable proper Hot Module Replacement with more robust error handling
if (import.meta.hot) {
  import.meta.hot.accept((err) => {
    if (err) {
      console.error("Error during AuthContext HMR update:", err);
    } else {
      console.log("AuthContext successfully hot-updated");
    }
  });
}
