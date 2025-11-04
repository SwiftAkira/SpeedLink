-- =============================================
-- SpeedLink Party Features Migration (Epic 3)
-- Run this in Supabase SQL Editor
-- =============================================

-- 1. Create parties table
CREATE TABLE IF NOT EXISTS public.parties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  party_code TEXT UNIQUE NOT NULL,
  name TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create party_members table
CREATE TABLE IF NOT EXISTS public.party_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  party_id UUID REFERENCES public.parties(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),
  is_online BOOLEAN DEFAULT true,
  UNIQUE(party_id, user_id)
);

-- 3. Create location_updates table
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

-- 4. Enable RLS
ALTER TABLE public.parties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.party_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.location_updates ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for parties
CREATE POLICY "Anyone can view active parties"
  ON public.parties FOR SELECT
  USING (is_active = true);

CREATE POLICY "Authenticated users can create parties"
  ON public.parties FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Party creator can update party"
  ON public.parties FOR UPDATE
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Party creator can delete party"
  ON public.parties FOR DELETE
  USING (auth.uid() = created_by);

-- 6. RLS Policies for party_members
CREATE POLICY "Party members can view members in same party"
  ON public.party_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.party_members pm
      WHERE pm.party_id = party_members.party_id
      AND pm.user_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can join parties"
  ON public.party_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own party membership"
  ON public.party_members FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave parties"
  ON public.party_members FOR DELETE
  USING (auth.uid() = user_id);

-- 7. RLS Policies for location_updates
CREATE POLICY "Party members can view locations in same party"
  ON public.location_updates FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.party_members pm
      WHERE pm.party_id = location_updates.party_id
      AND pm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own location updates"
  ON public.location_updates FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 8. Create indexes
CREATE INDEX IF NOT EXISTS parties_code_idx ON public.parties(party_code);
CREATE INDEX IF NOT EXISTS parties_created_by_idx ON public.parties(created_by);
CREATE INDEX IF NOT EXISTS parties_is_active_idx ON public.parties(is_active);

CREATE INDEX IF NOT EXISTS party_members_party_id_idx ON public.party_members(party_id);
CREATE INDEX IF NOT EXISTS party_members_user_id_idx ON public.party_members(user_id);
CREATE INDEX IF NOT EXISTS party_members_is_online_idx ON public.party_members(is_online);

CREATE INDEX IF NOT EXISTS location_updates_user_id_idx ON public.location_updates(user_id);
CREATE INDEX IF NOT EXISTS location_updates_party_id_idx ON public.location_updates(party_id);
CREATE INDEX IF NOT EXISTS location_updates_created_at_idx ON public.location_updates(created_at DESC);

-- 9. Update timestamp trigger
DROP TRIGGER IF EXISTS on_party_updated ON public.parties;
CREATE TRIGGER on_party_updated
  BEFORE UPDATE ON public.parties
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 10. Generate unique 6-digit party code function
CREATE OR REPLACE FUNCTION public.generate_party_code()
RETURNS TEXT AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    new_code := LPAD((FLOOR(RANDOM() * 900000) + 100000)::TEXT, 6, '0');
    SELECT EXISTS(SELECT 1 FROM public.parties WHERE party_code = new_code) INTO code_exists;
    IF NOT code_exists THEN
      RETURN new_code;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. Update party member last_seen on location update
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

-- 12. Grant permissions
GRANT ALL ON public.parties TO authenticated;
GRANT SELECT ON public.parties TO anon;
GRANT ALL ON public.party_members TO authenticated;
GRANT SELECT ON public.party_members TO anon;
GRANT ALL ON public.location_updates TO authenticated;
GRANT SELECT ON public.location_updates TO anon;
