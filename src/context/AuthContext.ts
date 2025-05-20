
/**
 * This file re-exports the auth context and related hooks from the auth subfolder
 * for backward compatibility with existing imports throughout the application.
 */

import { AuthProvider, useAuth } from "./auth/AuthProvider";
import AuthContext from "./auth/AuthContext";

export { AuthProvider, useAuth, AuthContext };

// Default export for convenience
export default AuthContext;

// Enable HMR for this module with proper error handling
if (import.meta.hot) {
  import.meta.hot.accept((err) => {
    if (err) {
      console.error("Error during AuthContext re-export HMR update:", err);
    } else {
      console.log("AuthContext re-export successfully hot-updated");
    }
  });
}
