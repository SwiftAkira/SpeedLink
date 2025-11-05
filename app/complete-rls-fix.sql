-- =============================================
-- Complete RLS Policy Fix for SpeedLink
-- Run this entire script in Supabase SQL Editor
-- =============================================

-- 1. DROP ALL EXISTING POLICIES
-- =============================================

-- Drop parties policies
DROP POLICY IF EXISTS "Anyone can view active parties" ON public.parties;
DROP POLICY IF EXISTS "Authenticated users can create parties" ON public.parties;
DROP POLICY IF EXISTS "Party creator can update party" ON public.parties;
DROP POLICY IF EXISTS "Party creator can delete party" ON public.parties;

-- Drop party_members policies
DROP POLICY IF EXISTS "Party members can view members in same party" ON public.party_members;
DROP POLICY IF EXISTS "Authenticated users can join parties" ON public.party_members;
DROP POLICY IF EXISTS "Users can update own party membership" ON public.party_members;
DROP POLICY IF EXISTS "Users can leave parties" ON public.party_members;
DROP POLICY IF EXISTS "Users can view own memberships" ON public.party_members;
DROP POLICY IF EXISTS "Users can view party members of their parties" ON public.party_members;
DROP POLICY IF EXISTS "Allow viewing party members" ON public.party_members;
DROP POLICY IF EXISTS "View members of active parties" ON public.party_members;

-- Drop location_updates policies
DROP POLICY IF EXISTS "Party members can view locations in same party" ON public.location_updates;
DROP POLICY IF EXISTS "Users can insert own location updates" ON public.location_updates;
DROP POLICY IF EXISTS "Users can update own location updates" ON public.location_updates;

-- 2. CREATE NEW, NON-RECURSIVE POLICIES
-- =============================================

-- PARTIES TABLE POLICIES
-- =============================================

-- Allow viewing all active parties
CREATE POLICY "select_active_parties"
  ON public.parties FOR SELECT
  USING (is_active = true);

-- Allow authenticated users to create parties
CREATE POLICY "insert_own_party"
  ON public.parties FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Allow party creator to update their party
CREATE POLICY "update_own_party"
  ON public.parties FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- Allow party creator to delete their party
CREATE POLICY "delete_own_party"
  ON public.parties FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

-- PARTY_MEMBERS TABLE POLICIES
-- =============================================

-- Allow users to view all party members (simplified, no recursion)
-- We check authorization at the application level
CREATE POLICY "select_party_members"
  ON public.party_members FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to insert themselves as party members
CREATE POLICY "insert_own_membership"
  ON public.party_members FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own membership status
CREATE POLICY "update_own_membership"
  ON public.party_members FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own membership (leave party)
CREATE POLICY "delete_own_membership"
  ON public.party_members FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- LOCATION_UPDATES TABLE POLICIES
-- =============================================

-- Allow viewing all location updates (simplified)
-- Filter at application level based on party membership
CREATE POLICY "select_location_updates"
  ON public.location_updates FOR SELECT
  TO authenticated
  USING (true);

-- Allow users to insert their own location updates
CREATE POLICY "insert_own_location"
  ON public.location_updates FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own location updates (if needed)
CREATE POLICY "update_own_location"
  ON public.location_updates FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 3. VERIFY RLS IS ENABLED
-- =============================================
ALTER TABLE public.parties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.party_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.location_updates ENABLE ROW LEVEL SECURITY;

-- 4. CLEAN UP ANY DUPLICATE PARTY CODES (fixes 409 conflict)
-- =============================================
-- This removes any duplicate party codes, keeping only the most recent one
WITH duplicates AS (
  SELECT party_code, 
         array_agg(id ORDER BY created_at DESC) as ids
  FROM public.parties
  GROUP BY party_code
  HAVING COUNT(*) > 1
)
DELETE FROM public.parties
WHERE id IN (
  SELECT unnest(ids[2:]) 
  FROM duplicates
);

-- 5. VERIFY THE FIX
-- =============================================
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('parties', 'party_members', 'location_updates')
ORDER BY tablename, policyname;
