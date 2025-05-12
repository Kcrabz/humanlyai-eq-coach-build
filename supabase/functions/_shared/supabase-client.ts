
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

export function supabaseClient(req: Request) {
  // Get the authorization header from the request
  const authHeader = req.headers.get('Authorization');
  
  if (!authHeader) {
    throw new Error('Missing Authorization header');
  }
  
  // The header should be in the format "Bearer TOKEN"
  const jwt = authHeader.replace('Bearer ', '');
  
  // Create a Supabase client with the user's JWT
  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing Supabase URL or service role key");
  }
  
  // Create the client with the service role key
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
    },
    global: {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    },
  });
}
