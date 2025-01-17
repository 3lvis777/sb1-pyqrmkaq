/*
  # Add article tags handling

  1. Changes
    - Drop existing trigger and function
    - Add temporary tag_ids column
    - Add function to sync article tags
    - Add trigger for article tag management

  2. Details
    - Creates infrastructure to manage article tags through a temporary column
    - Automatically syncs tags in the junction table
*/

-- Drop existing objects
DROP TRIGGER IF EXISTS handle_article_tags ON articles;
DROP FUNCTION IF EXISTS sync_article_tags();

-- Add temporary tag_ids column if it doesn't exist
ALTER TABLE articles
ADD COLUMN IF NOT EXISTS tag_ids uuid[] NULL;

-- Create function to sync article tags
CREATE OR REPLACE FUNCTION sync_article_tags()
RETURNS trigger AS $$
BEGIN
  -- Delete existing tags for this article
  DELETE FROM article_tags WHERE article_id = NEW.id;
  
  -- Insert new tags if tag_ids is not null
  IF NEW.tag_ids IS NOT NULL THEN
    INSERT INTO article_tags (article_id, tag_id)
    SELECT NEW.id, unnest(NEW.tag_ids);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for article tags
CREATE TRIGGER handle_article_tags
  AFTER INSERT OR UPDATE ON articles
  FOR EACH ROW
  EXECUTE FUNCTION sync_article_tags();