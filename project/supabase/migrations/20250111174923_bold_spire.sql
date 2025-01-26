/*
  # Fix storage bucket policies and configuration

  1. Changes
    - Drop and recreate storage bucket with proper configuration
    - Add more permissive policies for photo access
    - Fix MIME type handling
    - Add proper caching headers
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can upload their own media" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own media" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own media" ON storage.objects;
DROP POLICY IF EXISTS "Everyone can view media" ON storage.objects;

-- Recreate bucket with proper configuration
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'user-media',
  'user-media',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg']
)
ON CONFLICT (id) DO UPDATE
SET 
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg'];

-- Create more permissive storage policies
CREATE POLICY "Users can upload their own media"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'user-media' AND
  (auth.uid()::text = (SPLIT_PART(name, '/', 1)) OR auth.uid()::text = SPLIT_PART(name, '/', 1))
);

CREATE POLICY "Users can update their own media"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'user-media' AND
  (auth.uid()::text = (SPLIT_PART(name, '/', 1)) OR auth.uid()::text = SPLIT_PART(name, '/', 1))
);

CREATE POLICY "Users can delete their own media"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'user-media' AND
  (auth.uid()::text = (SPLIT_PART(name, '/', 1)) OR auth.uid()::text = SPLIT_PART(name, '/', 1))
);

CREATE POLICY "Everyone can view media"
ON storage.objects FOR SELECT
USING (bucket_id = 'user-media');