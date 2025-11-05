-- =============================================
-- NUCLEAR OPTION: Complete Database Reset for Party System
-- WARNING: This will delete ALL party data
-- Run this in Supabase SQL Editor if nothing else works
-- =============================================

-- 1. DELETE ALL DATA
-- =============================================
DELETE FROM public.location_updates;
DELETE FROM public.party_members;
DELETE FROM public.parties;

-- 2. DISABLE RLS TEMPORARILY
-- =============================================
ALTER TABLE public.parties DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.party_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.location_updates DISABLE ROW LEVEL SECURITY;

-- 3. DROP ALL POLICIES
-- =============================================
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (
        SELECT policyname, tablename 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename IN ('parties', 'party_members', 'location_updates')
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.policyname, r.tablename);
    END LOOP;
END $$;

-- 4. RECREATE POLICIES (SIMPLIFIED)
-- =============================================

-- PARTIES
CREATE POLICY "select_parties" ON public.parties FOR SELECT USING (true);
CREATE POLICY "insert_parties" ON public.parties FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "update_parties" ON public.parties FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "delete_parties" ON public.parties FOR DELETE USING (auth.uid() = created_by);

-- PARTY_MEMBERS
CREATE POLICY "select_members" ON public.party_members FOR SELECT USING (true);
CREATE POLICY "insert_members" ON public.party_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_members" ON public.party_members FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "delete_members" ON public.party_members FOR DELETE USING (auth.uid() = user_id);

-- LOCATION_UPDATES
CREATE POLICY "select_locations" ON public.location_updates FOR SELECT USING (true);
CREATE POLICY "insert_locations" ON public.location_updates FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_locations" ON public.location_updates FOR UPDATE USING (auth.uid() = user_id);

-- 5. RE-ENABLE RLS
-- =============================================
ALTER TABLE public.parties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.party_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.location_updates ENABLE ROW LEVEL SECURITY;

-- 6. VERIFY
-- =============================================
SELECT 'Policies' as type, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('parties', 'party_members', 'location_updates')
ORDER BY tablename;

SELECT 'Data' as type, 'parties' as table_name, COUNT(*) as count FROM public.parties
UNION ALL
SELECT 'Data', 'party_members', COUNT(*) FROM public.party_members
UNION ALL
SELECT 'Data', 'location_updates', COUNT(*) FROM public.location_updates;
