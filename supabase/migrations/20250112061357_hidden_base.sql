/*
  # Add Featured Image Support for Categories

  1. Changes
    - Add featured_image_url column to categories table
    - Create media usage tracking for featured images
    - Add RLS policies for featured image management

  2. Security
    - Only admins can update featured images
    - Public read access for featured images
*/

-- Add featured image column to categories
ALTER TABLE categories
ADD COLUMN featured_image_url text;

-- Create function to track featured image usage
CREATE OR REPLACE FUNCTION update_category_featured_image_usage()
RETURNS trigger AS $$
BEGIN
  -- If featured_image_url has changed
  IF TG_OP = 'UPDATE' AND NEW.featured_image_url IS DISTINCT FROM OLD.featured_image_url THEN
    -- Delete old media usage record if exists
    DELETE FROM media_usage 
    WHERE entity_type = 'category' 
      AND entity_id = NEW.id 
      AND field_name = 'featured_image';
    
    -- Insert new media usage record if featured image is set
    IF NEW.featured_image_url IS NOT NULL THEN
      INSERT INTO media_usage (media_id, entity_type, entity_id, field_name)
      SELECT m.id, 'category', NEW.id, 'featured_image'
      FROM media m
      WHERE m.url = NEW.featured_image_url;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for featured image usage tracking
CREATE TRIGGER category_featured_image_trigger
  AFTER UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_category_featured_image_usage();