-- Speed Camera Database Setup (Epic 5 - Story 5.1)
-- Run this in Supabase SQL Editor to create speed camera tables

-- =============================================
-- 1. Create speed_cameras table
-- =============================================
CREATE TABLE IF NOT EXISTS public.speed_cameras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Location data
  latitude NUMERIC(10, 7) NOT NULL,
  longitude NUMERIC(10, 7) NOT NULL,
  
  -- Camera details
  camera_type TEXT NOT NULL CHECK (camera_type IN ('fixed', 'mobile', 'red_light', 'average_speed', 'section')),
  speed_limit INTEGER NOT NULL, -- km/h
  direction TEXT, -- e.g., 'N', 'S', 'E', 'W', 'NE', 'bidirectional', or specific heading in degrees
  road_name TEXT,
  location_description TEXT,
  
  -- Metadata
  is_active BOOLEAN DEFAULT true,
  verified BOOLEAN DEFAULT false, -- Community verification status
  source TEXT DEFAULT 'official', -- 'official', 'community', 'import'
  reported_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  verified_at TIMESTAMPTZ
);

-- =============================================
-- 2. Create camera_alert_history table
-- =============================================
CREATE TABLE IF NOT EXISTS public.camera_alert_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- References
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  camera_id UUID NOT NULL REFERENCES public.speed_cameras(id) ON DELETE CASCADE,
  party_id UUID REFERENCES public.parties(id) ON DELETE SET NULL,
  
  -- Alert details
  distance_meters INTEGER NOT NULL, -- Distance when alert was triggered
  user_speed INTEGER, -- User's speed at time of alert (km/h)
  alerted_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- User interaction
  was_useful BOOLEAN, -- Did user find this alert helpful?
  feedback TEXT
);

-- =============================================
-- 3. Enable Row Level Security
-- =============================================
ALTER TABLE public.speed_cameras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.camera_alert_history ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 4. RLS Policies for speed_cameras
-- =============================================

-- Everyone can view active cameras (read-only for now)
CREATE POLICY "Anyone can view active speed cameras"
  ON public.speed_cameras
  FOR SELECT
  USING (is_active = true);

-- Authenticated users can report new cameras (community feature for later)
CREATE POLICY "Authenticated users can report cameras"
  ON public.speed_cameras
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL 
    AND reported_by = auth.uid()
  );

-- Users can update their own reported cameras
CREATE POLICY "Users can update own reported cameras"
  ON public.speed_cameras
  FOR UPDATE
  USING (reported_by = auth.uid())
  WITH CHECK (reported_by = auth.uid());

-- =============================================
-- 5. RLS Policies for camera_alert_history
-- =============================================

-- Users can view their own alert history
CREATE POLICY "Users can view own alert history"
  ON public.camera_alert_history
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own alert history
CREATE POLICY "Users can insert own alert history"
  ON public.camera_alert_history
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own alert history (feedback)
CREATE POLICY "Users can update own alert history"
  ON public.camera_alert_history
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =============================================
-- 6. Create indexes for performance
-- =============================================

-- Geospatial index for proximity queries (requires PostGIS extension)
CREATE INDEX IF NOT EXISTS speed_cameras_location_idx 
  ON public.speed_cameras (latitude, longitude);

-- Simple index for active cameras
CREATE INDEX IF NOT EXISTS speed_cameras_active_idx 
  ON public.speed_cameras (is_active) 
  WHERE is_active = true;

-- Index for camera type filtering
CREATE INDEX IF NOT EXISTS speed_cameras_type_idx 
  ON public.speed_cameras (camera_type);

-- Index for user alert history
CREATE INDEX IF NOT EXISTS camera_alert_history_user_idx 
  ON public.camera_alert_history (user_id, alerted_at DESC);

-- Index for camera alert analytics
CREATE INDEX IF NOT EXISTS camera_alert_history_camera_idx 
  ON public.camera_alert_history (camera_id, alerted_at DESC);

-- =============================================
-- 7. Update timestamp trigger
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_speed_camera_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_speed_camera_updated ON public.speed_cameras;
CREATE TRIGGER on_speed_camera_updated
  BEFORE UPDATE ON public.speed_cameras
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_speed_camera_updated_at();

-- =============================================
-- 8. Helper function: Find nearby cameras
-- =============================================
-- This function uses simple math for proximity calculation
-- For production, consider enabling PostGIS for advanced geospatial queries
CREATE OR REPLACE FUNCTION public.get_nearby_speed_cameras(
  user_lat NUMERIC,
  user_lng NUMERIC,
  radius_meters INTEGER DEFAULT 2000
)
RETURNS TABLE (
  id UUID,
  latitude NUMERIC,
  longitude NUMERIC,
  camera_type TEXT,
  speed_limit INTEGER,
  direction TEXT,
  road_name TEXT,
  location_description TEXT,
  distance_meters INTEGER
) AS $$
DECLARE
  lat_degree_km NUMERIC := 111.32; -- 1 degree latitude ≈ 111.32 km
  lng_degree_km NUMERIC;
BEGIN
  -- Calculate longitude degree distance at given latitude
  lng_degree_km := 111.32 * COS(RADIANS(user_lat));
  
  RETURN QUERY
  SELECT 
    c.id,
    c.latitude,
    c.longitude,
    c.camera_type,
    c.speed_limit,
    c.direction,
    c.road_name,
    c.location_description,
    -- Haversine-inspired distance calculation (simplified)
    CAST(
      SQRT(
        POW((c.latitude - user_lat) * lat_degree_km * 1000, 2) +
        POW((c.longitude - user_lng) * lng_degree_km * 1000, 2)
      ) AS INTEGER
    ) AS distance_meters
  FROM public.speed_cameras c
  WHERE c.is_active = true
    -- Quick rectangular bounding box filter (performance optimization)
    AND c.latitude BETWEEN (user_lat - radius_meters::NUMERIC / (lat_degree_km * 1000))
                       AND (user_lat + radius_meters::NUMERIC / (lat_degree_km * 1000))
    AND c.longitude BETWEEN (user_lng - radius_meters::NUMERIC / (lng_degree_km * 1000))
                        AND (user_lng + radius_meters::NUMERIC / (lng_degree_km * 1000))
  HAVING 
    SQRT(
      POW((c.latitude - user_lat) * lat_degree_km * 1000, 2) +
      POW((c.longitude - user_lng) * lng_degree_km * 1000, 2)
    ) <= radius_meters
  ORDER BY distance_meters ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 9. Seed data: Sample speed cameras for testing
-- =============================================
-- Replace these with real coordinates from your testing area
-- These are example locations (adjust for your region)

INSERT INTO public.speed_cameras (
  latitude, longitude, camera_type, speed_limit, direction, road_name, location_description, is_active, verified, source
) VALUES
  -- Example: Major highway cameras (replace with real data)
  (51.5074, -0.1278, 'fixed', 50, 'N', 'A40 Westway', 'Near Paddington', true, true, 'official'),
  (51.5155, -0.1426, 'fixed', 50, 'S', 'A40 Westway', 'Marylebone Flyover', true, true, 'official'),
  (51.5289, -0.1289, 'red_light', 30, 'bidirectional', 'A501 Marylebone Road', 'Baker Street Junction', true, true, 'official'),
  (51.5033, -0.1195, 'mobile', 30, 'bidirectional', 'Oxford Street', 'Near Tottenham Court Road', true, false, 'community'),
  (51.5145, -0.0885, 'average_speed', 50, 'bidirectional', 'A1 Euston Road', 'King''s Cross to Angel', true, true, 'official')
ON CONFLICT DO NOTHING;

-- =============================================
-- 10. Analytics view (optional)
-- =============================================
CREATE OR REPLACE VIEW public.speed_camera_stats AS
SELECT 
  c.id AS camera_id,
  c.latitude,
  c.longitude,
  c.camera_type,
  c.road_name,
  COUNT(h.id) AS total_alerts,
  COUNT(CASE WHEN h.was_useful = true THEN 1 END) AS helpful_count,
  COUNT(CASE WHEN h.was_useful = false THEN 1 END) AS unhelpful_count,
  AVG(h.distance_meters) AS avg_alert_distance,
  MAX(h.alerted_at) AS last_alert_at
FROM public.speed_cameras c
LEFT JOIN public.camera_alert_history h ON c.id = h.camera_id
GROUP BY c.id, c.latitude, c.longitude, c.camera_type, c.road_name;

-- =============================================
-- Setup Complete!
-- =============================================
-- Next steps:
-- 1. Run this migration in Supabase SQL Editor
-- 2. Update seed data with real camera locations for your area
-- 3. Implement speedCameraService.ts (Story 5.2)
-- 4. Build alert UI components (Story 5.3)
