import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.33.1";

// Define CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get auth token from request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), 
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Create Supabase admin client with the service role key
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") as string,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string
    );

    // Verify the token belongs to an admin user
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), 
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Check if the user is an admin
    const { data: adminCheck, error: adminError } = await supabaseAdmin
      .from('admin_users')
      .select('*')
      .eq('email', user.email)
      .single();

    if (adminError || !adminCheck) {
      return new Response(JSON.stringify({ error: 'Not an admin user' }), 
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Parse request
    let params;
    try {
      params = await req.json();
    } catch (e) {
      params = {};
    }

    const { userIds } = params;
    
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return new Response(JSON.stringify({ error: 'Invalid or missing userIds parameter' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Get user subscription tiers for context
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('id, subscription_tier')
      .in('id', userIds);
    
    if (profilesError) {
      console.error('Error fetching user profiles:', profilesError);
    }
    
    // Create a map of user subscription tiers
    const subscriptionTiers = new Map();
    if (profiles) {
      profiles.forEach(profile => {
        subscriptionTiers.set(profile.id, profile.subscription_tier);
      });
    }

    // Fetch login history data for each user
    const { data: loginHistory, error: loginError } = await supabaseAdmin
      .from('user_login_history')
      .select('user_id, created_at')
      .in('user_id', userIds)
      .order('created_at', { ascending: false });

    if (loginError) {
      console.error('Error fetching login history:', loginError);
    }

    // Get auth.users creation dates for comparison
    const userCreationDates = new Map();
    try {
      // This requires the service role since we're querying auth.users
      for (const userId of userIds) {
        // Get user creation time from Supabase Auth API
        const { data, error } = await supabaseAdmin.auth.admin.getUserById(userId);
        if (!error && data?.user) {
          userCreationDates.set(userId, new Date(data.user.created_at));
        } else {
          console.error(`Error fetching user ${userId} creation date:`, error);
        }
      }
    } catch (error) {
      console.error('Error fetching user creation dates:', error);
    }
    
    // Process login data to get last login for each user
    const lastLoginMap = new Map();

    // First populate with account creation dates (as fallback)
    userIds.forEach(userId => {
      const creationDate = userCreationDates.get(userId);
      if (creationDate) {
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - creationDate.getTime()) / (1000 * 60 * 60 * 24));
        
        let formatted = '';
        if (diffDays === 0) {
          formatted = 'Created today';
        } else if (diffDays === 1) {
          formatted = 'Created yesterday';
        } else if (diffDays < 7) {
          formatted = `Created ${diffDays} days ago`;
        } else {
          formatted = `Created on ${creationDate.toLocaleDateString()}`;
        }
        
        lastLoginMap.set(userId, formatted);
      } else {
        lastLoginMap.set(userId, 'Unknown');
      }
    });

    // Then override with actual login data if it exists
    if (loginHistory && loginHistory.length > 0) {
      // Group login events by user and get the most recent one
      const latestLoginByUser = new Map();
      
      loginHistory.forEach(record => {
        const userId = record.user_id;
        const loginTime = new Date(record.created_at);
        
        if (!latestLoginByUser.has(userId) || loginTime > latestLoginByUser.get(userId).time) {
          latestLoginByUser.set(userId, {
            time: loginTime,
            timestamp: record.created_at
          });
        }
      });
      
      // Format the timestamps for display
      latestLoginByUser.forEach((login, userId) => {
        // Store full timestamp for detailed display
        const lastLogin = login.time;
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24));
        
        let formatted = '';
        // Short human-readable format
        if (diffDays === 0) {
          formatted = 'Today';
        } else if (diffDays === 1) {
          formatted = 'Yesterday';
        } else if (diffDays < 7) {
          formatted = `${diffDays} days ago`;
        } else if (diffDays < 30) {
          const weeks = Math.floor(diffDays / 7);
          formatted = `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
        } else {
          formatted = lastLogin.toLocaleDateString();
        }
        
        // Use both relative time and full timestamp
        lastLoginMap.set(userId, {
          relative: formatted,
          timestamp: login.timestamp // Store ISO timestamp for detailed view
        });
      });
    }

    // Fetch chat activity data - try chat_messages first, then fall back to chat_logs if needed
    let chatData = [];
    const { data: messagesData, error: messagesError } = await supabaseAdmin
      .from('chat_messages')
      .select('user_id, created_at')
      .in('user_id', userIds);
      
    if (messagesError) {
      console.error('Error fetching chat message data:', messagesError);
      
      // Fall back to chat_logs
      const { data: logsData, error: logsError } = await supabaseAdmin
        .from('chat_logs')
        .select('user_id, created_at')
        .in('user_id', userIds);
        
      if (logsError) {
        console.error('Error fetching chat logs data:', logsError);
      } else {
        chatData = logsData || [];
      }
    } else {
      chatData = messagesData || [];
    }

    // Process chat data to calculate activity metrics
    const chatActivityMap = new Map();
    
    if (chatData && chatData.length > 0) {
      // Group messages by user
      const messagesByUser = {};
      chatData.forEach(message => {
        const userId = message.user_id;
        if (!messagesByUser[userId]) {
          messagesByUser[userId] = [];
        }
        messagesByUser[userId].push(new Date(message.created_at));
      });

      // Calculate chat metrics for each user
      Object.entries(messagesByUser).forEach(([userId, timestamps]) => {
        // Sort timestamps chronologically
        timestamps.sort((a: Date, b: Date) => a.getTime() - b.getTime());
        
        const messageCount = timestamps.length;
        
        // Calculate time spent (using time between messages where reasonable)
        let totalMinutes = 0;
        if (messageCount > 1) {
          for (let i = 1; i < timestamps.length; i++) {
            const timeDiff = timestamps[i].getTime() - timestamps[i-1].getTime();
            // Only count gaps less than 30 minutes (1,800,000 ms) to avoid counting breaks
            if (timeDiff < 1800000) {
              totalMinutes += timeDiff / 60000; // Convert ms to minutes
            } else {
              // Add a minimum time for each message that doesn't have a reasonable previous message
              totalMinutes += 0.5; // 30 seconds per message
            }
          }
          // Add min time for first message
          totalMinutes += 0.5;
        } else if (messageCount === 1) {
          // If just one message, count as 30 seconds
          totalMinutes = 0.5;
        }
        
        // Format the chat time in a human-readable way
        let chatTimeDisplay = '';
        if (totalMinutes < 1) {
          chatTimeDisplay = '< 1 min';
        } else if (totalMinutes < 60) {
          chatTimeDisplay = `${Math.round(totalMinutes)} min`;
        } else {
          const hours = Math.floor(totalMinutes / 60);
          const mins = Math.round(totalMinutes % 60);
          chatTimeDisplay = `${hours}h${mins > 0 ? ` ${mins}m` : ''}`;
        }
        
        chatActivityMap.set(userId, {
          count: messageCount,
          chatTime: chatTimeDisplay
        });
      });
    }
    
    // Fill in empty data for users with no chat activity
    userIds.forEach(userId => {
      if (!chatActivityMap.has(userId)) {
        const tier = subscriptionTiers.get(userId);
        chatActivityMap.set(userId, {
          count: 0,
          chatTime: tier === 'free' ? 'No data (free tier)' : 'No activity'
        });
      }
    }

    return new Response(
      JSON.stringify({ 
        lastLogins: Object.fromEntries(lastLoginMap),
        chatActivity: Object.fromEntries(chatActivityMap),
        subscriptionTiers: Object.fromEntries(subscriptionTiers)
      }),
      { 
        status: 200, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Server error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal Server Error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
