-- =============================================
-- Enable Supabase Realtime for Tables
-- Run this in Supabase SQL Editor
-- =============================================

-- Enable realtime for all party-related tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.parties;
ALTER PUBLICATION supabase_realtime ADD TABLE public.party_members;
ALTER PUBLICATION supabase_realtime ADD TABLE public.location_updates;

-- Verify realtime is enabled
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime'
AND schemaname = 'public';
