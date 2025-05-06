
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";
import { corsHeaders } from "./cors.ts";

export interface AuthError {
  message: string;
  status: number;
}

export async function verifyAdmin(supabaseAdmin: SupabaseClient) {
  try {
    // Verify the request is from an authenticated user
    console.log("Verifying user authentication");
    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser();
    
    if (authError) {
      console.error("Authentication error:", authError);
      return { 
        user: null,
        error: {
          message: `Authentication failed: ${authError.message}`,
          status: 401
        }
      };
    }
    
    if (!user) {
      console.error("No user found in session");
      return { 
        user: null,
        error: {
          message: 'User not authenticated',
          status: 401
        }
      };
    }
    
    // Check if the user has admin access using the is_admin function
    console.log("Checking admin privileges for user:", user.email);
    const { data: isAdmin, error: adminCheckError } = await supabaseAdmin.rpc('is_admin');
    
    if (adminCheckError) {
      console.error("Admin check error:", adminCheckError);
      return { 
        user: null, 
        error: {
          message: `Error checking admin status: ${adminCheckError.message}`,
          status: 500
        }
      };
    }
    
    if (!isAdmin) {
      console.error("User is not an admin:", user.email);
      return { 
        user: null,
        error: {
          message: 'Forbidden: Admin access required',
          status: 403
        }
      };
    }
    
    console.log("User is admin, proceeding with data gathering");
    return { user, error: null };
  } catch (err: any) {
    console.error("Unexpected error in auth verification:", err);
    return { 
      user: null,
      error: {
        message: `Error in authentication: ${err.message}`,
        status: 500
      }
    };
  }
}
