
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";
import { corsHeaders } from "./utils.ts";

// AI categories for EQ breakthroughs
const EQ_CATEGORIES = [
  "self-awareness",
  "emotion-regulation",
  "empathy",
  "social-skills",
  "resilience",
  "conflict-resolution",
  "mindfulness"
];

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }
  
  try {
    // Parse request body
    let reqBody;
    try {
      reqBody = await req.json();
    } catch (error) {
      return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      });
    }
    
    // Get and validate required params
    const { message, userId, messageId } = reqBody;
    
    if (!message || !userId) {
      return new Response(JSON.stringify({ error: 'Missing required parameters' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      });
    }
    
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    );
    
    // Check if user is premium
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('subscription_tier')
      .eq('id', userId)
      .single();
      
    if (profileError || !profile) {
      return new Response(JSON.stringify({ error: 'User not found', premium: false }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404
      });
    }
    
    if (profile.subscription_tier !== 'premium') {
      return new Response(JSON.stringify({ 
        detected: false, 
        premium: false,
        message: "Premium subscription required for breakthrough detection"
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      });
    }
    
    // For demo purposes, we'll use a simple algorithm to detect breakthroughs
    // In production, you would use a more sophisticated NLP approach or OpenAI
    
    // Simple algorithm: Check for emotional insights and learning moments in the text
    const insightKeywords = [
      "realize", "understand", "learned", "discovered", "breakthrough", 
      "insight", "epiphany", "clarity", "aware", "perspective"
    ];
    
    const emotionKeywords = [
      "feel", "emotion", "angry", "sad", "happy", "anxious", "fear",
      "joy", "frustration", "overwhelmed", "calm", "peace"
    ];
    
    const messageLower = message.toLowerCase();
    
    // Check if the message contains insight keywords and emotion keywords
    const hasInsight = insightKeywords.some(keyword => messageLower.includes(keyword));
    const hasEmotion = emotionKeywords.some(keyword => messageLower.includes(keyword));
    
    // Determine if this is a breakthrough
    const isBreakthrough = hasInsight && hasEmotion;
    
    // If it's a breakthrough, determine the category and save it
    if (isBreakthrough) {
      // Simple category determination - in production use LLM for better analysis
      let category = EQ_CATEGORIES[0]; // Default to self-awareness
      
      // Check for keywords related to each category
      if (messageLower.includes("regulate") || messageLower.includes("control") || messageLower.includes("manage")) {
        category = "emotion-regulation";
      } else if (messageLower.includes("understand") || messageLower.includes("perspective") || messageLower.includes("others")) {
        category = "empathy";
      } else if (messageLower.includes("communicate") || messageLower.includes("interact")) {
        category = "social-skills";
      } else if (messageLower.includes("overcome") || messageLower.includes("bounce back")) {
        category = "resilience";
      } else if (messageLower.includes("conflict") || messageLower.includes("resolve")) {
        category = "conflict-resolution";
      } else if (messageLower.includes("present") || messageLower.includes("aware") || messageLower.includes("moment")) {
        category = "mindfulness";
      }
      
      // Extract a short insight from the message
      let insight = message.substring(0, 120) + "...";
      
      // Store the breakthrough in the database
      const { data: breakthrough, error: breakthroughError } = await supabaseClient
        .from('eq_breakthroughs')
        .insert({
          user_id: userId,
          message_id: messageId,
          insight,
          category,
          message: messageLower.substring(0, 500) // Store truncated message 
        })
        .select('id')
        .single();
        
      if (breakthroughError) {
        console.error("Error storing breakthrough:", breakthroughError);
      }
      
      // Update user streak
      await updateUserStreak(supabaseClient, userId);
      
      // Check for achievements
      await checkForAchievements(supabaseClient, userId, category);
      
      return new Response(JSON.stringify({
        detected: true,
        breakthrough: true,
        category,
        insight,
        premium: true,
        breakthroughId: breakthrough?.id
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      });
    }
    
    // No breakthrough detected  
    return new Response(JSON.stringify({
      detected: true,
      breakthrough: false,
      premium: true
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });
    
  } catch (error) {
    console.error("Error in detect-eq-breakthrough:", error);
    
    return new Response(JSON.stringify({ 
      error: "Internal server error", 
      details: error.message || "Unknown error"
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});

// Function to update user streak
async function updateUserStreak(supabase: any, userId: string) {
  const today = new Date().toISOString().split('T')[0];
  
  // Get current streak data
  const { data: streakData, error: streakError } = await supabase
    .from('user_streaks')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
    
  if (streakError) {
    console.error("Error fetching streak data:", streakError);
    return;
  }
  
  if (!streakData) {
    // Create new streak record
    await supabase.from('user_streaks').insert({
      user_id: userId,
      current_streak: 1,
      longest_streak: 1,
      last_active_date: today,
      total_active_days: 1
    });
    return;
  }
  
  // Skip if already updated today
  if (streakData.last_active_date === today) {
    return;
  }
  
  const lastActiveDate = new Date(streakData.last_active_date);
  const currentDate = new Date();
  
  // Calculate days difference
  const diffTime = currentDate.getTime() - lastActiveDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  let currentStreak = streakData.current_streak;
  let longestStreak = streakData.longest_streak;
  let totalActiveDays = streakData.total_active_days + 1;
  
  // Update streak based on days difference
  if (diffDays === 1) {
    // Consecutive day, increase streak
    currentStreak += 1;
    if (currentStreak > longestStreak) {
      longestStreak = currentStreak;
    }
  } else if (diffDays > 1) {
    // Streak broken, reset to 1
    currentStreak = 1;
  }
  
  await supabase
    .from('user_streaks')
    .update({
      current_streak: currentStreak,
      longest_streak: longestStreak,
      last_active_date: today,
      total_active_days: totalActiveDays
    })
    .eq('user_id', userId);
}

// Function to check for achievements
async function checkForAchievements(supabase: any, userId: string, category: string) {
  try {
    // Get all achievements
    const { data: achievements, error: achievementsError } = await supabase
      .from('achievements')
      .select('*');
      
    if (achievementsError) throw achievementsError;
    
    // Get user's breakthrough count by category
    const { data: breakthroughCounts, error: countError } = await supabase
      .from('eq_breakthroughs')
      .select('category, count')
      .eq('user_id', userId)
      .group_by('category');
      
    if (countError) throw countError;
    
    // Get user's streak data
    const { data: streakData, error: streakError } = await supabase
      .from('user_streaks')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
      
    if (streakError) throw streakError;
    
    // Get user's existing achievements
    const { data: userAchievements, error: userAchievementsError } = await supabase
      .from('user_achievements')
      .select('achievement_id')
      .eq('user_id', userId);
      
    if (userAchievementsError) throw userAchievementsError;
    
    const existingAchievementIds = userAchievements.map(a => a.achievement_id);
    
    // Find achievements to award
    const countsByCategory = {};
    breakthroughCounts.forEach(item => {
      countsByCategory[item.category] = parseInt(item.count);
    });
    
    for (const achievement of achievements) {
      // Skip if already achieved
      if (existingAchievementIds.includes(achievement.id)) continue;
      
      let shouldAward = false;
      
      switch (achievement.type) {
        case 'streak':
          if (streakData && streakData.current_streak >= achievement.threshold) {
            shouldAward = true;
          }
          break;
        case 'breakthrough':
          const categoryCount = countsByCategory[category] || 0;
          if (categoryCount >= achievement.threshold && achievement.category === category) {
            shouldAward = true;
          }
          break;
        case 'milestone':
          if (streakData && streakData.total_active_days >= achievement.threshold) {
            shouldAward = true;
          }
          break;
        case 'challenge':
          // Challenges are awarded manually or via special conditions
          break;
      }
      
      if (shouldAward) {
        // Award achievement
        await supabase
          .from('user_achievements')
          .insert({
            user_id: userId,
            achievement_id: achievement.id,
            achieved: true,
            achieved_at: new Date().toISOString()
          });
      }
    }
  } catch (error) {
    console.error("Error checking achievements:", error);
  }
}
