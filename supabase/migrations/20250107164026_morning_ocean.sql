/*
  # Add images bucket and policies

  1. New Storage Bucket
    - Create 'images' bucket for storing city and location images
    - Set bucket as public for read access
  
  2. Storage Policies
    - Allow public read access to all images
    - Allow authenticated admins to manage images
*/

-- Create images bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true);

-- Create storage policies for images bucket
CREATE POLICY "Images are publicly accessible"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'images');

CREATE POLICY "Only admins can insert images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'images' AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "Only admins can update images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'images' AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );