/*
  # Fix storage bucket configuration

  1. Changes
    - Drop existing storage bucket policies
    - Recreate storage bucket with proper configuration
    - Add correct RLS policies for user media access
*/

-- Drop existing bucket if it exists
DROP POLICY IF EXISTS "Users can upload their own media" ON storage.objects;
DROP POLICY IF EXISTS "Users can view media" ON storage.objects;

-- Ensure bucket exists with proper configuration
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-media', 'user-media', true)
ON CONFLICT (id) DO UPDATE
SET public = true;

-- Create storage policies
CREATE POLICY "Users can upload their own media"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'user-media' AND
  auth.uid()::text = (SPLIT_PART(name, '/', 1))
);

CREATE POLICY "Users can update their own media"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'user-media' AND
  auth.uid()::text = (SPLIT_PART(name, '/', 1))
);

CREATE POLICY "Users can delete their own media"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'user-media' AND
  auth.uid()::text = (SPLIT_PART(name, '/', 1))
);

CREATE POLICY "Everyone can view media"
ON storage.objects FOR SELECT
USING (bucket_id = 'user-media');

-- Update bucket configuration
UPDATE storage.buckets
SET public = true,
    file_size_limit = 5242880, -- 5MB
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
WHERE id = 'user-media';