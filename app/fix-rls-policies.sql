-- Fix for infinite recursion in RLS policies
-- Run this in Supabase SQL Editor

-- Drop the problematic policy
DROP POLICY IF EXISTS "Party members can view members in same party" ON public.party_members;

-- Replace with a simpler policy that allows users to view:
-- 1. Their own membership records
-- 2. Members in parties they belong to (without circular reference)
CREATE POLICY "Users can view own memberships"
  ON public.party_members FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view party members of their parties"
  ON public.party_members FOR SELECT
  USING (
    party_id IN (
      SELECT party_id 
      FROM public.party_members 
      WHERE user_id = auth.uid()
    )
  );

-- Note: The above still has potential for recursion. Better approach:
-- Drop both and use a single, non-recursive policy

DROP POLICY IF EXISTS "Users can view own memberships" ON public.party_members;
DROP POLICY IF EXISTS "Users can view party members of their parties" ON public.party_members;

-- Single policy: Allow viewing all party members
-- (We'll filter at application level if needed)
CREATE POLICY "Allow viewing party members"
  ON public.party_members FOR SELECT
  USING (true);

-- OR if you want more security, only allow viewing members of active parties
CREATE POLICY "View members of active parties"
  ON public.party_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.parties p
      WHERE p.id = party_members.party_id
      AND p.is_active = true
    )
  );
