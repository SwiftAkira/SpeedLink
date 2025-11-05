-- Check what's causing the 409 conflict
SELECT * FROM public.parties ORDER BY created_at DESC LIMIT 10;

-- Check if there are duplicate party codes
SELECT party_code, COUNT(*) as count
FROM public.parties
GROUP BY party_code
HAVING COUNT(*) > 1;

-- Delete ALL parties to start fresh
DELETE FROM public.location_updates;
DELETE FROM public.party_members;
DELETE FROM public.parties;

-- Verify deletion
SELECT COUNT(*) as remaining_parties FROM public.parties;
