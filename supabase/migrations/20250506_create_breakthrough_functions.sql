
-- Function to get user breakthroughs
CREATE OR REPLACE FUNCTION get_user_breakthroughs(user_id_param UUID, limit_param INTEGER DEFAULT 10)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  message TEXT,
  insight TEXT,
  detected_at TIMESTAMPTZ,
  category TEXT
) LANGUAGE plpgsql SECURITY DEFINER AS
$$
BEGIN
  RETURN QUERY
  SELECT 
    eq_breakthroughs.id,
    eq_breakthroughs.user_id,
    eq_breakthroughs.message,
    eq_breakthroughs.insight,
    eq_breakthroughs.detected_at,
    eq_breakthroughs.category
  FROM public.eq_breakthroughs
  WHERE user_id = user_id_param
  ORDER BY detected_at DESC
  LIMIT limit_param;
END;
$$;

-- Function to get breakthrough category counts
CREATE OR REPLACE FUNCTION get_breakthrough_category_counts(user_id_param UUID)
RETURNS TABLE (
  category TEXT,
  count BIGINT
) LANGUAGE plpgsql SECURITY DEFINER AS
$$
BEGIN
  RETURN QUERY
  SELECT 
    eq_breakthroughs.category,
    COUNT(*) as count
  FROM public.eq_breakthroughs
  WHERE user_id = user_id_param
  GROUP BY category;
END;
$$;
