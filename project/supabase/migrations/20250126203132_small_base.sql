/*
  # Add Geolocation Search Functions

  1. New Functions
    - search_profiles_by_distance: Main search function that finds profiles within a given radius
    - calculate_match_score: Calculates compatibility score between profiles

  2. Indexes
    - Add GiST index for efficient geospatial queries
    - Add indexes for common search fields

  3. Changes
    - Add earth extension for geospatial calculations
*/

-- Enable PostGIS extension if not already enabled
CREATE EXTENSION IF NOT EXISTS cube;
CREATE EXTENSION IF NOT EXISTS earthdistance;

-- Function to search profiles by distance and criteria
CREATE OR REPLACE FUNCTION search_profiles_by_distance(
  p_user_id uuid,
  p_latitude double precision,
  p_longitude double precision,
  p_max_distance integer,  -- in kilometers
  p_min_age integer DEFAULT NULL,
  p_max_age integer DEFAULT NULL,
  p_gender text DEFAULT NULL,
  p_looking_for text DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  full_name text,
  username text,
  birth_date date,
  gender text,
  looking_for text,
  bio text,
  photos text[],
  distance double precision,
  match_score integer
) AS $$
BEGIN
  RETURN QUERY
  WITH user_prefs AS (
    SELECT 
      preferred_age_min,
      preferred_age_max,
      preferred_distance,
      education_level,
      relationship_type
    FROM user_preferences
    WHERE user_id = p_user_id
  ),
  filtered_profiles AS (
    SELECT 
      p.*,
      calculate_distance(p_latitude, p_longitude, p.latitude, p.longitude) / 1000 AS distance,
      EXTRACT(YEAR FROM age(p.birth_date)) AS age
    FROM profiles p
    WHERE p.id != p_user_id
      AND p.latitude IS NOT NULL 
      AND p.longitude IS NOT NULL
      AND (p_gender IS NULL OR p.gender = p_gender)
      AND (p_looking_for IS NULL OR p.looking_for = p_looking_for)
      AND (p_min_age IS NULL OR EXTRACT(YEAR FROM age(p.birth_date)) >= p_min_age)
      AND (p_max_age IS NULL OR EXTRACT(YEAR FROM age(p.birth_date)) <= p_max_age)
  )
  SELECT 
    fp.id,
    fp.full_name,
    fp.username,
    fp.birth_date,
    fp.gender,
    fp.looking_for,
    fp.bio,
    fp.photos,
    fp.distance,
    calculate_match_score(p_user_id, fp.id) AS match_score
  FROM filtered_profiles fp
  WHERE fp.distance <= COALESCE(p_max_distance, 100)
  ORDER BY fp.distance ASC, match_score DESC
  LIMIT 50;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate match score between two profiles
CREATE OR REPLACE FUNCTION calculate_match_score(
  profile1_id uuid,
  profile2_id uuid
)
RETURNS integer AS $$
DECLARE
  score integer := 50; -- Base score
  p1 profiles;
  p2 profiles;
  common_interests integer;
  age_diff integer;
BEGIN
  -- Get profile data
  SELECT * INTO p1 FROM profiles WHERE id = profile1_id;
  SELECT * INTO p2 FROM profiles WHERE id = profile2_id;
  
  -- Calculate age difference score (max 20 points)
  age_diff := ABS(
    EXTRACT(YEAR FROM age(p1.birth_date)) - 
    EXTRACT(YEAR FROM age(p2.birth_date))
  );
  score := score + LEAST(20, (20 - age_diff));
  
  -- Calculate common interests score (max 20 points)
  SELECT COUNT(*) INTO common_interests
  FROM user_interests ui1
  JOIN user_interests ui2 ON ui1.interest = ui2.interest
  WHERE ui1.user_id = profile1_id AND ui2.user_id = profile2_id;
  score := score + LEAST(20, common_interests * 5);
  
  -- Location proximity score (max 10 points)
  IF p1.latitude IS NOT NULL AND p2.latitude IS NOT NULL THEN
    score := score + LEAST(10, (
      10 - (calculate_distance(p1.latitude, p1.longitude, p2.latitude, p2.longitude) / 10000)::integer
    ));
  END IF;
  
  RETURN GREATEST(0, LEAST(100, score));
END;
$$ LANGUAGE plpgsql;

-- Create indexes for better search performance
CREATE INDEX IF NOT EXISTS idx_profiles_location ON profiles USING gist (
  ll_to_earth(latitude, longitude)
) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_age ON profiles (
  birth_date
) WHERE birth_date IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_gender ON profiles (
  gender
) WHERE gender IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_looking_for ON profiles (
  looking_for
) WHERE looking_for IS NOT NULL;