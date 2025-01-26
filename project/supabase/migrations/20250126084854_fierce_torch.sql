/*
  # Add email notifications and enhanced search features
  
  1. New Tables
    - email_preferences: Store user email notification settings
    - user_interests: Store user interests for better matching
    - user_preferences: Store detailed matching preferences
  
  2. Changes
    - Add new columns to profiles table for enhanced matching
    - Add functions for email notification handling
    
  3. Security
    - Enable RLS on new tables
    - Add appropriate policies
*/

-- Add email preferences table
CREATE TABLE email_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) NOT NULL,
  matches boolean DEFAULT true,
  messages boolean DEFAULT true,
  profile_views boolean DEFAULT true,
  likes boolean DEFAULT true,
  system_updates boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Add user interests table for better matching
CREATE TABLE user_interests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) NOT NULL,
  interest text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, interest)
);

-- Add user preferences table for detailed matching criteria
CREATE TABLE user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) NOT NULL,
  preferred_age_min integer DEFAULT 18,
  preferred_age_max integer DEFAULT 99,
  preferred_distance integer DEFAULT 50,
  preferred_height_min integer,
  preferred_height_max integer,
  education_level text[],
  relationship_type text[],
  deal_breakers text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Add new columns to profiles for enhanced matching
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS height integer;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS education text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS occupation text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS languages text[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS lifestyle_tags text[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS personality_tags text[];

-- Enable RLS
ALTER TABLE email_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own email preferences"
  ON email_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own email preferences"
  ON email_preferences FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own interests"
  ON user_interests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own interests"
  ON user_interests FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own preferences"
  ON user_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own preferences"
  ON user_preferences FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create function to send email notification
CREATE OR REPLACE FUNCTION notify_user()
RETURNS TRIGGER AS $$
BEGIN
  -- This is a placeholder for email notification logic
  -- In production, you would integrate with your email service here
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;