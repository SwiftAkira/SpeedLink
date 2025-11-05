-- =============================================
-- Re-enable RLS with Proper Policies
-- This enables security while avoiding infinite recursion
-- =============================================

-- 1. First, drop any existing problematic policies
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (
        SELECT policyname, tablename 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename IN ('parties', 'party_members', 'location_updates', 'profiles')
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.policyname, r.tablename);
    END LOOP;
END $$;

-- 2. Create clean, non-recursive policies
-- =============================================

-- PROFILES TABLE
-- =============================================
CREATE POLICY "profiles_select" 
  ON public.profiles FOR SELECT 
  USING (true); -- Allow viewing all profiles (filter at app level)

CREATE POLICY "profiles_insert" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- PARTIES TABLE
-- =============================================
CREATE POLICY "parties_select" 
  ON public.parties FOR SELECT 
  USING (is_active = true);

CREATE POLICY "parties_insert" 
  ON public.parties FOR INSERT 
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "parties_update" 
  ON public.parties FOR UPDATE 
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "parties_delete" 
  ON public.parties FOR DELETE 
  USING (auth.uid() = created_by);

-- PARTY_MEMBERS TABLE (NO RECURSION!)
-- =============================================
CREATE POLICY "party_members_select" 
  ON public.party_members FOR SELECT 
  USING (true); -- Simple: allow viewing all members

CREATE POLICY "party_members_insert" 
  ON public.party_members FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "party_members_update" 
  ON public.party_members FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "party_members_delete" 
  ON public.party_members FOR DELETE 
  USING (auth.uid() = user_id);

-- LOCATION_UPDATES TABLE
-- =============================================
CREATE POLICY "location_updates_select" 
  ON public.location_updates FOR SELECT 
  USING (true); -- Simple: allow viewing all locations

CREATE POLICY "location_updates_insert" 
  ON public.location_updates FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "location_updates_update" 
  ON public.location_updates FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 3. Enable RLS on all tables
-- =============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.party_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.location_updates ENABLE ROW LEVEL SECURITY;

-- 4. Verify RLS is enabled
-- =============================================
SELECT 
  tablename, 
  rowsecurity as "RLS Enabled"
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'parties', 'party_members', 'location_updates')
ORDER BY tablename;

-- 5. Verify policies are created
-- =============================================
SELECT 
  tablename, 
  policyname,
  cmd as "Command"
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'parties', 'party_members', 'location_updates')
ORDER BY tablename, policyname;
