/*
  # Add geolocation support to profiles table

  1. Changes
    - Add latitude and longitude columns to profiles table
    - Add function for calculating distance between coordinates
    - Add index for location-based queries

  2. Notes
    - Uses built-in PostgreSQL functions for distance calculations
    - Maintains existing RLS policies
*/

-- Add geolocation columns
ALTER TABLE profiles
ADD COLUMN latitude double precision,
ADD COLUMN longitude double precision;

-- Create btree index for location columns
CREATE INDEX idx_profiles_location 
ON profiles (latitude, longitude)
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Create function for calculating distance between coordinates using the Haversine formula
CREATE OR REPLACE FUNCTION calculate_distance(
  lat1 double precision,
  lon1 double precision,
  lat2 double precision,
  lon2 double precision,
  OUT distance_in_meters double precision
) AS $$
DECLARE
  R constant double precision := 6371000; -- Earth's radius in meters
  φ1 double precision := radians(lat1);
  φ2 double precision := radians(lat2);
  Δφ double precision := radians(lat2 - lat1);
  Δλ double precision := radians(lon2 - lon1);
  a double precision;
BEGIN
  -- Haversine formula
  a := sin(Δφ/2) * sin(Δφ/2) +
       cos(φ1) * cos(φ2) *
       sin(Δλ/2) * sin(Δλ/2);
  
  distance_in_meters := R * 2 * asin(sqrt(a));
END;
$$ LANGUAGE plpgsql IMMUTABLE;