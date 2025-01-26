/*
  # Dating App Schema Setup

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key) - matches auth.users.id
      - `username` (text, unique)
      - `full_name` (text)
      - `bio` (text)
      - `gender` (text)
      - `looking_for` (text)
      - `birth_date` (date)
      - `location` (text)
      - `photos` (text array) - URLs to photos
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `matches`
      - `id` (uuid, primary key)
      - `user1_id` (uuid, references profiles)
      - `user2_id` (uuid, references profiles)
      - `matched_at` (timestamp)
      - `status` (text) - 'pending', 'matched', 'rejected'
    
    - `messages`
      - `id` (uuid, primary key)
      - `match_id` (uuid, references matches)
      - `sender_id` (uuid, references profiles)
      - `content` (text)
      - `sent_at` (timestamp)
      - `read_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Policies for profiles:
      - Users can read all profiles
      - Users can only update their own profile
      - Users can only insert their own profile
    - Policies for matches:
      - Users can only see their own matches
      - Users can only create matches they're part of
      - Users can only update matches they're part of
    - Policies for messages:
      - Users can only see messages from their matches
      - Users can only send messages to their matches
*/

-- Create profiles table
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  username text UNIQUE NOT NULL,
  full_name text,
  bio text,
  gender text,
  looking_for text,
  birth_date date,
  location text,
  photos text[] DEFAULT ARRAY[]::text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create matches table
CREATE TABLE matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id uuid REFERENCES profiles(id) NOT NULL,
  user2_id uuid REFERENCES profiles(id) NOT NULL,
  matched_at timestamptz DEFAULT now(),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'matched', 'rejected')),
  CONSTRAINT different_users CHECK (user1_id != user2_id),
  UNIQUE(user1_id, user2_id)
);

-- Create messages table
CREATE TABLE messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid REFERENCES matches(id) NOT NULL,
  sender_id uuid REFERENCES profiles(id) NOT NULL,
  content text NOT NULL,
  sent_at timestamptz DEFAULT now(),
  read_at timestamptz
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Matches policies
CREATE POLICY "Users can view their own matches"
  ON matches FOR SELECT
  USING (
    auth.uid() = user1_id OR 
    auth.uid() = user2_id
  );

CREATE POLICY "Users can create matches they're part of"
  ON matches FOR INSERT
  WITH CHECK (
    auth.uid() = user1_id
  );

CREATE POLICY "Users can update their matches"
  ON matches FOR UPDATE
  USING (
    auth.uid() IN (user1_id, user2_id)
  );

-- Messages policies
CREATE POLICY "Users can view messages from their matches"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM matches
      WHERE id = messages.match_id
      AND (user1_id = auth.uid() OR user2_id = auth.uid())
    )
  );

CREATE POLICY "Users can insert messages to their matches"
  ON messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM matches
      WHERE id = match_id
      AND (user1_id = auth.uid() OR user2_id = auth.uid())
      AND status = 'matched'
    )
  );

-- Function to update profile's updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();