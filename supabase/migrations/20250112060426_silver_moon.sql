/*
  # Add media usage tracking for categories

  1. New Tables
    - `media_usage` tracks which media items are used where
  2. Changes
    - Add trigger to maintain media usage records
  3. Security
    - Enable RLS on new table
    - Add policies for public read and admin write access
*/

-- Create media usage table if it doesn't exist
CREATE TABLE IF NOT EXISTS media_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  media_id uuid REFERENCES media(id) ON DELETE CASCADE,
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  field_name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE media_usage ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public can view media usage"
  ON media_usage FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins can manage media usage"
  ON media_usage FOR ALL
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
CREATE INDEX idx_media_usage_entity ON media_usage(entity_type, entity_id);
CREATE INDEX idx_media_usage_media ON media_usage(media_id);

-- Create function to update media usage
CREATE OR REPLACE FUNCTION update_category_media_usage()
RETURNS trigger AS $$
BEGIN
  -- If hero_image_url has changed
  IF TG_OP = 'UPDATE' AND NEW.hero_image_url IS DISTINCT FROM OLD.hero_image_url THEN
    -- Delete old media usage record if exists
    DELETE FROM media_usage 
    WHERE entity_type = 'category' 
      AND entity_id = NEW.id 
      AND field_name = 'hero_image';
    
    -- Insert new media usage record
    IF NEW.hero_image_url IS NOT NULL THEN
      INSERT INTO media_usage (media_id, entity_type, entity_id, field_name)
      SELECT m.id, 'category', NEW.id, 'hero_image'
      FROM media m
      WHERE m.url = NEW.hero_image_url;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS category_media_usage_trigger ON categories;
CREATE TRIGGER category_media_usage_trigger
  AFTER UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_category_media_usage();