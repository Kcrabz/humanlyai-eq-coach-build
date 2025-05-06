
-- Function to get user streak data
CREATE OR REPLACE FUNCTION get_user_streak(user_id_param UUID)
RETURNS TABLE (
  current_streak INTEGER,
  longest_streak INTEGER,
  last_active_date DATE,
  total_active_days INTEGER
) LANGUAGE plpgsql SECURITY DEFINER AS
$$
BEGIN
  RETURN QUERY
  SELECT 
    user_streaks.current_streak,
    user_streaks.longest_streak,
    user_streaks.last_active_date,
    user_streaks.total_active_days
  FROM public.user_streaks
  WHERE user_id = user_id_param;
END;
$$;

-- Function to get user achievements with details
CREATE OR REPLACE FUNCTION get_user_achievements(user_id_param UUID)
RETURNS TABLE (
  achievement_id UUID,
  title TEXT,
  description TEXT,
  type TEXT,
  icon TEXT,
  achieved BOOLEAN,
  achieved_at TIMESTAMPTZ
) LANGUAGE plpgsql SECURITY DEFINER AS
$$
BEGIN
  RETURN QUERY
  SELECT 
    a.id as achievement_id,
    a.title,
    a.description,
    a.type,
    a.icon,
    ua.achieved,
    ua.achieved_at
  FROM public.achievements a
  JOIN public.user_achievements ua ON a.id = ua.achievement_id
  WHERE ua.user_id = user_id_param;
END;
$$;
