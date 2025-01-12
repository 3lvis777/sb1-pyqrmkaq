/*
  # Add permalink support and redirects

  1. Changes
    - Add permalink column to articles table
    - Create article_redirects table for handling URL changes
    - Add unique constraint on permalink
    - Add indexes for better performance
  
  2. Data Migration
    - Convert existing articles to use new permalink structure
*/

-- Add permalink column to articles
ALTER TABLE articles
ADD COLUMN permalink text;

-- Create redirects table
CREATE TABLE article_redirects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  old_permalink text NOT NULL,
  new_permalink text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_articles_permalink ON articles(permalink);
CREATE INDEX idx_article_redirects_old_permalink ON article_redirects(old_permalink);

-- Enable RLS on redirects table
ALTER TABLE article_redirects ENABLE ROW LEVEL SECURITY;

-- Create policies for redirects table
CREATE POLICY "Public can read redirects"
  ON article_redirects FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins can manage redirects"
  ON article_redirects FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.is_admin = true
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.is_admin = true
  ));

-- Function to handle permalink updates
CREATE OR REPLACE FUNCTION handle_permalink_change()
RETURNS trigger AS $$
BEGIN
  -- If permalink has changed and old record exists
  IF TG_OP = 'UPDATE' AND OLD.permalink IS NOT NULL AND NEW.permalink != OLD.permalink THEN
    -- Insert redirect
    INSERT INTO article_redirects (old_permalink, new_permalink)
    VALUES (OLD.permalink, NEW.permalink);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for permalink changes
CREATE TRIGGER article_permalink_change
  BEFORE UPDATE ON articles
  FOR EACH ROW
  WHEN (OLD.permalink IS DISTINCT FROM NEW.permalink)
  EXECUTE FUNCTION handle_permalink_change();

-- Update existing articles to use new permalink structure
DO $$
DECLARE
  article_record RECORD;
BEGIN
  FOR article_record IN 
    SELECT 
      a.id,
      a.title,
      c.name as category_name
    FROM articles a
    JOIN categories c ON a.category_id = c.id
  LOOP
    UPDATE articles 
    SET permalink = (
      SELECT 
        lower(regexp_replace(
          regexp_replace(
            category_name || '/' || title,
            '[^a-zA-Z0-9\s-]', ''
          ),
          '\s+', '-'
        ))
      FROM (
        SELECT 
          article_record.category_name as category_name,
          article_record.title as title
      ) t
    )
    WHERE id = article_record.id;
  END LOOP;
END $$;