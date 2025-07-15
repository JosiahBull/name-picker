-- Add is_user_uploaded column to names table
ALTER TABLE names ADD COLUMN is_user_uploaded BOOLEAN DEFAULT FALSE;

-- Add uploaded_by column to track who uploaded the name
ALTER TABLE names ADD COLUMN uploaded_by UUID REFERENCES auth.users(id);

-- Update existing names to mark them as seeded (not user uploaded)
UPDATE names SET is_user_uploaded = FALSE WHERE is_user_uploaded IS NULL;

-- Drop and recreate the get_next_unseen_name function to prioritize user-uploaded names
DROP FUNCTION IF EXISTS get_next_unseen_name(UUID);

CREATE OR REPLACE FUNCTION get_next_unseen_name(user_id UUID)
RETURNS TABLE (
  id UUID,
  name TEXT,
  origin TEXT,
  meaning TEXT,
  popularity INTEGER,
  gender TEXT,
  is_user_uploaded BOOLEAN,
  uploaded_by UUID
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    n.id,
    n.name,
    n.origin,
    n.meaning,
    n.popularity,
    n.gender,
    n.is_user_uploaded,
    n.uploaded_by
  FROM names n
  WHERE n.id NOT IN (
    SELECT s.name_id 
    FROM swipes s 
    WHERE s.user_id = get_next_unseen_name.user_id
  )
  ORDER BY 
    n.is_user_uploaded DESC,  -- Prioritize user-uploaded names first
    n.popularity DESC NULLS LAST
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add a new name (user uploaded)
CREATE OR REPLACE FUNCTION add_user_name(
  name_text TEXT,
  user_id UUID,
  origin_text TEXT DEFAULT NULL,
  meaning_text TEXT DEFAULT NULL,
  gender_text TEXT DEFAULT 'neutral'
)
RETURNS UUID AS $$
DECLARE
  new_name_id UUID;
BEGIN
  -- Check if name already exists
  SELECT id INTO new_name_id FROM names WHERE LOWER(name) = LOWER(name_text);
  
  IF new_name_id IS NOT NULL THEN
    -- Name already exists, just return the existing ID
    RETURN new_name_id;
  END IF;
  
  -- Insert new name
  INSERT INTO names (name, origin, meaning, gender, is_user_uploaded, uploaded_by, popularity)
  VALUES (name_text, origin_text, meaning_text, gender_text, TRUE, user_id, 100) -- Give user names high priority
  RETURNING id INTO new_name_id;
  
  RETURN new_name_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION add_user_name(TEXT, UUID, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION add_user_name(TEXT, UUID, TEXT, TEXT, TEXT) TO anon;