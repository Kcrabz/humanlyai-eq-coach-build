
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";

export interface UserData {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  subscription_tier: string;
  eq_archetype: string;
  onboarded: string;
  created_at: string;
  total_tokens_used: number;
}

export interface DataError {
  message: string;
  details?: string;
  status: number;
}

export async function getUsersData(supabaseAdmin: SupabaseClient) {
  try {
    console.log("Attempting to fetch users with admin client");
    
    const { data: authUsers, error: authUsersError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (authUsersError) {
      console.error("Error fetching users:", authUsersError);
      return { 
        data: null, 
        error: {
          message: 'Failed to fetch users',
          details: authUsersError.message,
          status: 500
        }
      };
    }
    
    if (!authUsers || !authUsers.users || authUsers.users.length === 0) {
      console.error("No users found or empty users array");
      return { 
        data: null,
        error: {
          message: 'No users found in the system',
          status: 404
        }
      };
    }
    
    console.log(`Found ${authUsers.users.length} users`);
    
    // Get all profiles from profiles table
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('*');
    
    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
      return { 
        data: null,
        error: {
          message: 'Failed to fetch user profiles',
          details: profilesError.message,
          status: 500
        }
      };
    }
    
    console.log(`Found ${profiles?.length || 0} profiles`);
    
    // Get usage data from usage_logs table, aggregated by user
    const { data: usageLogs, error: usageError } = await supabaseAdmin
      .from('usage_logs')
      .select('user_id, token_count');
    
    if (usageError) {
      console.error("Error fetching usage logs:", usageError);
      return { 
        data: null,
        error: {
          message: 'Failed to fetch usage data',
          details: usageError.message,
          status: 500
        }
      };
    }
    
    console.log(`Found ${usageLogs?.length || 0} usage logs`);
    
    // Calculate total token usage per user
    const userUsage = (usageLogs || []).reduce((acc, log) => {
      if (!acc[log.user_id]) {
        acc[log.user_id] = 0;
      }
      acc[log.user_id] += log.token_count;
      return acc;
    }, {} as Record<string, number>);
    
    // Combine the data
    const combinedData = authUsers.users.map(authUser => {
      const profile = profiles?.find(p => p.id === authUser.id) || {};
      const totalTokens = userUsage[authUser.id] || 0;
      
      return {
        id: authUser.id,
        email: authUser.email,
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        subscription_tier: profile.subscription_tier || 'free',
        eq_archetype: profile.eq_archetype || 'Not set',
        onboarded: profile.onboarded ? 'Yes' : 'No',
        created_at: authUser.created_at,
        total_tokens_used: totalTokens
      };
    });
    
    return { data: combinedData, error: null };
  } catch (err: any) {
    console.error("Error in data processing:", err);
    return { 
      data: null,
      error: {
        message: 'Error processing data',
        details: err.message,
        status: 500
      }
    };
  }
}
