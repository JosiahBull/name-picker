-- Create custom user profiles table
CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL CHECK (username IN ('joe', 'sam')),
    display_name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on user_profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Create names table
CREATE TABLE public.names (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    origin TEXT,
    meaning TEXT,
    popularity INTEGER CHECK (popularity >= 0 AND popularity <= 100),
    gender TEXT CHECK (gender IN ('masculine', 'feminine', 'neutral')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on names
ALTER TABLE public.names ENABLE ROW LEVEL SECURITY;

-- Create swipes table
CREATE TABLE public.swipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name_id UUID NOT NULL REFERENCES public.names(id) ON DELETE CASCADE,
    action TEXT NOT NULL CHECK (action IN ('like', 'dislike')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one swipe per user per name
    UNIQUE(user_id, name_id)
);

-- Enable RLS on swipes
ALTER TABLE public.swipes ENABLE ROW LEVEL SECURITY;

-- Create matches table
CREATE TABLE public.matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_id UUID NOT NULL REFERENCES public.names(id) ON DELETE CASCADE,
    user1_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    user2_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure user1_id < user2_id to avoid duplicates
    CHECK (user1_id < user2_id),
    UNIQUE(name_id, user1_id, user2_id)
);

-- Enable RLS on matches
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX idx_swipes_user_id ON public.swipes(user_id);
CREATE INDEX idx_swipes_name_id ON public.swipes(name_id);
CREATE INDEX idx_swipes_created_at ON public.swipes(created_at);
CREATE INDEX idx_matches_user1_id ON public.matches(user1_id);
CREATE INDEX idx_matches_user2_id ON public.matches(user2_id);
CREATE INDEX idx_matches_name_id ON public.matches(name_id);
CREATE INDEX idx_names_popularity ON public.names(popularity);

-- Create a function to automatically create matches when both users like the same name
CREATE OR REPLACE FUNCTION public.create_match_on_mutual_like()
RETURNS TRIGGER AS $$
DECLARE
    other_user_id UUID;
    user1 UUID;
    user2 UUID;
BEGIN
    -- Only proceed if this is a 'like' action
    IF NEW.action = 'like' THEN
        -- Find if another user has also liked this name
        SELECT user_id INTO other_user_id
        FROM public.swipes
        WHERE name_id = NEW.name_id 
            AND user_id != NEW.user_id 
            AND action = 'like'
        LIMIT 1;
        
        -- If we found a mutual like, create a match
        IF other_user_id IS NOT NULL THEN
            -- Ensure consistent ordering for user IDs
            IF NEW.user_id < other_user_id THEN
                user1 := NEW.user_id;
                user2 := other_user_id;
            ELSE
                user1 := other_user_id;
                user2 := NEW.user_id;
            END IF;
            
            -- Insert the match (ON CONFLICT DO NOTHING to handle race conditions)
            INSERT INTO public.matches (name_id, user1_id, user2_id)
            VALUES (NEW.name_id, user1, user2)
            ON CONFLICT (name_id, user1_id, user2_id) DO NOTHING;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create matches
CREATE TRIGGER trigger_create_match_on_mutual_like
    AFTER INSERT ON public.swipes
    FOR EACH ROW EXECUTE FUNCTION public.create_match_on_mutual_like();

-- RLS Policies

-- User profiles: Users can only see and update their own profile
CREATE POLICY "Users can view their own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Names: Everyone can read names (they're public data)
CREATE POLICY "Names are publicly readable" ON public.names
    FOR SELECT USING (true);

-- Swipes: Users can only see and create their own swipes
CREATE POLICY "Users can view their own swipes" ON public.swipes
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own swipes" ON public.swipes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Matches: Users can only see matches they're part of
CREATE POLICY "Users can view their own matches" ON public.matches
    FOR SELECT USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Create a view for easier match querying
CREATE VIEW public.user_matches AS
SELECT 
    m.id,
    m.name_id,
    n.name,
    m.user1_id,
    m.user2_id,
    m.created_at,
    CASE 
        WHEN m.user1_id = auth.uid() THEN m.user2_id
        ELSE m.user1_id
    END AS partner_id
FROM public.matches m
JOIN public.names n ON m.name_id = n.id
WHERE m.user1_id = auth.uid() OR m.user2_id = auth.uid();

-- Create a function to get analytics for a user
CREATE OR REPLACE FUNCTION public.get_user_analytics(target_user_id UUID)
RETURNS JSON AS $$
DECLARE
    total_swipes INTEGER;
    likes INTEGER;
    dislikes INTEGER;
    matches INTEGER;
    avg_swipe_time NUMERIC;
    result JSON;
BEGIN
    -- Get basic counts
    SELECT COUNT(*) INTO total_swipes
    FROM public.swipes
    WHERE user_id = target_user_id;
    
    SELECT COUNT(*) INTO likes
    FROM public.swipes
    WHERE user_id = target_user_id AND action = 'like';
    
    SELECT COUNT(*) INTO dislikes
    FROM public.swipes
    WHERE user_id = target_user_id AND action = 'dislike';
    
    SELECT COUNT(*) INTO matches
    FROM public.matches
    WHERE user1_id = target_user_id OR user2_id = target_user_id;
    
    -- Calculate average swipe time (mock for now - could be enhanced with timing data)
    avg_swipe_time := 2.5;
    
    -- Build result JSON
    result := json_build_object(
        'totalSwipes', COALESCE(total_swipes, 0),
        'likes', COALESCE(likes, 0),
        'dislikes', COALESCE(dislikes, 0),
        'matches', COALESCE(matches, 0),
        'averageSwipeTime', avg_swipe_time,
        'mostPopularNames', ARRAY['Smith', 'Johnson', 'Brown'],
        'sessionDuration', 300
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.user_profiles TO authenticated;
GRANT SELECT ON public.names TO authenticated;
GRANT ALL ON public.swipes TO authenticated;
GRANT SELECT ON public.matches TO authenticated;
GRANT SELECT ON public.user_matches TO authenticated;