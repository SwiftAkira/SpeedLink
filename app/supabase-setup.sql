-- SpeedLink Database Setup
-- Run these commands in Supabase SQL Editor

-- =============================================
-- 1. Create profiles table
-- =============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  avatar_url TEXT,
  
  -- Privacy settings
  location_sharing_enabled BOOLEAN DEFAULT true,
  visible_to_party BOOLEAN DEFAULT true,
  ghost_mode BOOLEAN DEFAULT false,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 2. Enable Row Level Security
-- =============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 3. RLS Policies
-- =============================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Users can view profiles of party members (will implement party logic later)
CREATE POLICY "Users can view other profiles"
  ON public.profiles
  FOR SELECT
  USING (true); -- For now, allow viewing all profiles; restrict later based on party membership

-- =============================================
-- 4. Auto-create profile on signup
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', SPLIT_PART(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- 5. Update timestamp trigger
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_profile_updated ON public.profiles;
CREATE TRIGGER on_profile_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- =============================================
-- 6. Create indexes for performance
-- =============================================
CREATE INDEX IF NOT EXISTS profiles_email_idx ON public.profiles(email);
CREATE INDEX IF NOT EXISTS profiles_display_name_idx ON public.profiles(display_name);

-- =============================================
-- 7. Grant permissions
-- =============================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;

-- =============================================
-- 8. Create parties table (Epic 3)
-- =============================================
CREATE TABLE IF NOT EXISTS public.parties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  party_code TEXT UNIQUE NOT NULL,
  name TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 9. Create party_members table (Epic 3)
-- =============================================
CREATE TABLE IF NOT EXISTS public.party_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  party_id UUID REFERENCES public.parties(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),
  is_online BOOLEAN DEFAULT true,
  UNIQUE(party_id, user_id)
);

-- =============================================
-- 10. Create location_updates table (Epic 3)
-- =============================================
CREATE TABLE IF NOT EXISTS public.location_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  party_id UUID REFERENCES public.parties(id) ON DELETE CASCADE,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  speed DOUBLE PRECISION DEFAULT 0,
  heading DOUBLE PRECISION DEFAULT 0,
  accuracy DOUBLE PRECISION,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 11. Enable RLS on party tables
-- =============================================
ALTER TABLE public.parties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.party_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.location_updates ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 12. RLS Policies for parties
-- =============================================

-- Anyone can view active parties (needed for join by code)
CREATE POLICY "Anyone can view active parties"
  ON public.parties
  FOR SELECT
  USING (is_active = true);

-- Authenticated users can create parties
CREATE POLICY "Authenticated users can create parties"
  ON public.parties
  FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- Party creator can update their party
CREATE POLICY "Party creator can update party"
  ON public.parties
  FOR UPDATE
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- Party creator can delete their party
CREATE POLICY "Party creator can delete party"
  ON public.parties
  FOR DELETE
  USING (auth.uid() = created_by);

-- =============================================
-- 13. RLS Policies for party_members
-- =============================================

-- Party members can view other members in same party
CREATE POLICY "Party members can view members in same party"
  ON public.party_members
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.party_members pm
      WHERE pm.party_id = party_members.party_id
      AND pm.user_id = auth.uid()
    )
  );

-- Authenticated users can join parties
CREATE POLICY "Authenticated users can join parties"
  ON public.party_members
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own party membership
CREATE POLICY "Users can update own party membership"
  ON public.party_members
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can leave parties (delete their membership)
CREATE POLICY "Users can leave parties"
  ON public.party_members
  FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================
-- 14. RLS Policies for location_updates
-- =============================================

-- Party members can view locations of members in same party
CREATE POLICY "Party members can view locations in same party"
  ON public.location_updates
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.party_members pm
      WHERE pm.party_id = location_updates.party_id
      AND pm.user_id = auth.uid()
    )
  );

-- Users can insert their own location updates
CREATE POLICY "Users can insert own location updates"
  ON public.location_updates
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- =============================================
-- 15. Create indexes for party tables
-- =============================================
CREATE INDEX IF NOT EXISTS parties_code_idx ON public.parties(party_code);
CREATE INDEX IF NOT EXISTS parties_created_by_idx ON public.parties(created_by);
CREATE INDEX IF NOT EXISTS parties_is_active_idx ON public.parties(is_active);

CREATE INDEX IF NOT EXISTS party_members_party_id_idx ON public.party_members(party_id);
CREATE INDEX IF NOT EXISTS party_members_user_id_idx ON public.party_members(user_id);
CREATE INDEX IF NOT EXISTS party_members_is_online_idx ON public.party_members(is_online);

CREATE INDEX IF NOT EXISTS location_updates_user_id_idx ON public.location_updates(user_id);
CREATE INDEX IF NOT EXISTS location_updates_party_id_idx ON public.location_updates(party_id);
CREATE INDEX IF NOT EXISTS location_updates_created_at_idx ON public.location_updates(created_at DESC);

-- =============================================
-- 16. Add update timestamp trigger to party tables
-- =============================================
DROP TRIGGER IF EXISTS on_party_updated ON public.parties;
CREATE TRIGGER on_party_updated
  BEFORE UPDATE ON public.parties
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- =============================================
-- 17. Function to generate unique 6-digit party code
-- =============================================
CREATE OR REPLACE FUNCTION public.generate_party_code()
RETURNS TEXT AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate 6-digit code (100000-999999)
    new_code := LPAD((FLOOR(RANDOM() * 900000) + 100000)::TEXT, 6, '0');
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM public.parties WHERE party_code = new_code) INTO code_exists;
    
    -- If code doesn't exist, return it
    IF NOT code_exists THEN
      RETURN new_code;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 18. Function to update party member last_seen
-- =============================================
CREATE OR REPLACE FUNCTION public.update_party_member_last_seen()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.party_members
  SET last_seen_at = NOW(), is_online = true
  WHERE user_id = NEW.user_id AND party_id = NEW.party_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_location_update ON public.location_updates;
CREATE TRIGGER on_location_update
  AFTER INSERT ON public.location_updates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_party_member_last_seen();

-- =============================================
-- 19. Grant permissions on party tables
-- =============================================
GRANT ALL ON public.parties TO authenticated;
GRANT SELECT ON public.parties TO anon;

GRANT ALL ON public.party_members TO authenticated;
GRANT SELECT ON public.party_members TO anon;

GRANT ALL ON public.location_updates TO authenticated;
GRANT SELECT ON public.location_updates TO anon;
