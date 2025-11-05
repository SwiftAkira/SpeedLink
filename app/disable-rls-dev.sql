-- =============================================
-- TEMPORARY FIX: Disable RLS for Development
-- This allows you to develop without RLS blocking everything
-- WARNING: Only use in development, not production!
-- =============================================

-- Disable RLS on all tables
ALTER TABLE public.parties DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.party_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.location_updates DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Clean up all data
DELETE FROM public.location_updates;
DELETE FROM public.party_members;
DELETE FROM public.parties;

-- Verify
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('parties', 'party_members', 'location_updates', 'profiles');
