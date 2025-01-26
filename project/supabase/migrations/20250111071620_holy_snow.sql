/*
  # Add advanced features for dating app

  1. New Tables
    - `storage.buckets`: For storing user media
    - `notifications`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `type` (text)
      - `content` (text)
      - `read` (boolean)
      - `created_at` (timestamp)
    - `reports`
      - `id` (uuid, primary key)
      - `reporter_id` (uuid, references profiles)
      - `reported_id` (uuid, references profiles)
      - `reason` (text)
      - `details` (text)
      - `status` (text)
      - `created_at` (timestamp)
    - `verifications`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `type` (text)
      - `status` (text)
      - `verified_at` (timestamp)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all new tables
    - Add policies for authenticated users
*/

-- Create notifications table
CREATE TABLE notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) NOT NULL,
  type text NOT NULL,
  content text NOT NULL,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create reports table
CREATE TABLE reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid REFERENCES profiles(id) NOT NULL,
  reported_id uuid REFERENCES profiles(id) NOT NULL,
  reason text NOT NULL,
  details text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'investigating', 'resolved', 'dismissed')),
  created_at timestamptz DEFAULT now(),
  CONSTRAINT different_users CHECK (reporter_id != reported_id)
);

-- Create verifications table
CREATE TABLE verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) NOT NULL,
  type text NOT NULL CHECK (type IN ('photo', 'email', 'phone')),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  verified_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE verifications ENABLE ROW LEVEL SECURITY;

-- Notifications policies
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- Reports policies
CREATE POLICY "Users can view reports they created"
  ON reports FOR SELECT
  USING (auth.uid() = reporter_id);

CREATE POLICY "Users can create reports"
  ON reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

-- Verifications policies
CREATE POLICY "Users can view their own verifications"
  ON verifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can request verification"
  ON verifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create storage bucket for media
INSERT INTO storage.buckets (id, name)
VALUES ('user-media', 'user-media')
ON CONFLICT DO NOTHING;

-- Storage bucket policy
CREATE POLICY "Users can upload their own media"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'user-media' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view media"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'user-media');

-- Function to create a notification
CREATE OR REPLACE FUNCTION create_notification(
  user_id uuid,
  type text,
  content text
) RETURNS void AS $$
BEGIN
  INSERT INTO notifications (user_id, type, content)
  VALUES (user_id, type, content);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;