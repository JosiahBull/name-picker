-- Function to get the next unseen name for a user
CREATE OR REPLACE FUNCTION get_next_unseen_name(user_id UUID)
RETURNS TABLE (
  id UUID,
  name TEXT,
  origin TEXT,
  meaning TEXT,
  popularity INTEGER,
  gender TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    n.id,
    n.name,
    n.origin,
    n.meaning,
    n.popularity,
    n.gender
  FROM names n
  WHERE n.id NOT IN (
    SELECT s.name_id 
    FROM swipes s 
    WHERE s.user_id = get_next_unseen_name.user_id
  )
  ORDER BY n.popularity DESC NULLS LAST
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get matches for a user (fixed version)
CREATE OR REPLACE FUNCTION get_user_matches(user_id UUID)
RETURNS TABLE (
  id UUID,
  name_id UUID,
  name TEXT,
  user1_id UUID,
  user2_id UUID,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id,
    m.name_id,
    n.name,
    m.user1_id,
    m.user2_id,
    m.created_at
  FROM matches m
  JOIN names n ON m.name_id = n.id
  WHERE m.user1_id = get_user_matches.user_id 
     OR m.user2_id = get_user_matches.user_id
  ORDER BY m.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION get_next_unseen_name(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_matches(UUID) TO authenticated;

-- Grant execute permissions to anon role for demo purposes  
GRANT EXECUTE ON FUNCTION get_next_unseen_name(UUID) TO anon;
GRANT EXECUTE ON FUNCTION get_user_matches(UUID) TO anon;