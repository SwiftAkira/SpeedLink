-- =============================================
-- Create party_navigation_states Table
-- This was missing from the original migration
-- =============================================

CREATE TABLE IF NOT EXISTS public.party_navigation_states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  party_id UUID UNIQUE REFERENCES public.parties(id) ON DELETE CASCADE,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  destination_name TEXT NOT NULL,
  destination_address TEXT,
  destination_lat DOUBLE PRECISION NOT NULL,
  destination_lng DOUBLE PRECISION NOT NULL,
  distance_meters DOUBLE PRECISION NOT NULL,
  duration_seconds DOUBLE PRECISION NOT NULL,
  route_geojson JSONB NOT NULL,
  steps JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.party_navigation_states ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "navigation_states_select"
  ON public.party_navigation_states FOR SELECT
  USING (true);

CREATE POLICY "navigation_states_insert"
  ON public.party_navigation_states FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "navigation_states_update"
  ON public.party_navigation_states FOR UPDATE
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "navigation_states_delete"
  ON public.party_navigation_states FOR DELETE
  USING (auth.uid() = created_by);

-- Create indexes
CREATE INDEX IF NOT EXISTS party_navigation_states_party_id_idx ON public.party_navigation_states(party_id);
CREATE INDEX IF NOT EXISTS party_navigation_states_is_active_idx ON public.party_navigation_states(is_active);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.party_navigation_states;

-- Verify
SELECT 'party_navigation_states table created' as status;
