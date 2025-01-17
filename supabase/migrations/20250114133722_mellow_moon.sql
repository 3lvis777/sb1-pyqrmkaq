/*
  # Add Article Gallery Support

  1. New Tables
    - `article_gallery_images`
      - `id` (uuid, primary key)
      - `article_id` (uuid, references articles)
      - `media_id` (uuid, references media)
      - `caption` (text)
      - `caption_cn` (text)
      - `sort_order` (integer)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on new table
    - Add policies for public read access
    - Add policies for admin write access
*/

-- Create article gallery images table
CREATE TABLE article_gallery_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id uuid REFERENCES articles(id) ON DELETE CASCADE,
  media_id uuid REFERENCES media(id) ON DELETE CASCADE,
  caption text,
  caption_cn text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE article_gallery_images ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public can read article gallery images"
  ON article_gallery_images FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins can manage article gallery images"
  ON article_gallery_images FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.is_admin = true
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.is_admin = true
  ));

-- Create indexes
CREATE INDEX idx_article_gallery_images_article ON article_gallery_images(article_id);
CREATE INDEX idx_article_gallery_images_sort ON article_gallery_images(article_id, sort_order);