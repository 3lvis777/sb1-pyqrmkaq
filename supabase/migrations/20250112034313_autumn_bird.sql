/*
  # Media Library System

  1. New Tables
    - `media` - Stores media file metadata and references
    - `media_tags` - Stores tags for media files
    - `media_usage` - Tracks where media files are used

  2. Security
    - Enable RLS on all tables
    - Add policies for admin access
*/

-- Create media table
CREATE TABLE media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  original_name text NOT NULL,
  url text NOT NULL,
  size bigint NOT NULL,
  mime_type text NOT NULL,
  alt_text text,
  tags text[] DEFAULT '{}',
  usage_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create media_tags table
CREATE TABLE media_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);

-- Create media_usage table
CREATE TABLE media_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  media_id uuid REFERENCES media(id) ON DELETE CASCADE,
  entity_type text NOT NULL, -- e.g., 'article', 'category'
  entity_id uuid NOT NULL,
  field_name text NOT NULL, -- e.g., 'featured_image', 'content'
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_usage ENABLE ROW LEVEL SECURITY;

-- Create policies for media table
CREATE POLICY "Public can view media"
  ON media FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins can manage media"
  ON media FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.is_admin = true
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.is_admin = true
  ));

-- Create policies for media_tags table
CREATE POLICY "Public can view media tags"
  ON media_tags FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins can manage media tags"
  ON media_tags FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.is_admin = true
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.is_admin = true
  ));

-- Create policies for media_usage table
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

-- Create indexes for better performance
CREATE INDEX idx_media_tags ON media USING gin(tags);
CREATE INDEX idx_media_name ON media(name);
CREATE INDEX idx_media_created_at ON media(created_at);
CREATE INDEX idx_media_usage_media_id ON media_usage(media_id);
CREATE INDEX idx_media_usage_entity ON media_usage(entity_type, entity_id);

-- Create function to update media usage count
CREATE OR REPLACE FUNCTION update_media_usage_count()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE media
    SET usage_count = usage_count + 1
    WHERE id = NEW.media_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE media
    SET usage_count = usage_count - 1
    WHERE id = OLD.media_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for media usage count
CREATE TRIGGER media_usage_count_trigger
AFTER INSERT OR DELETE ON media_usage
FOR EACH ROW
EXECUTE FUNCTION update_media_usage_count();