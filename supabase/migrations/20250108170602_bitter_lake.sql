/*
  # Add article status field

  1. Changes
    - Drop existing policy that depends on published column
    - Add status field to articles table
    - Update existing articles to have proper status
    - Add new policy using status field
*/

-- Drop the existing policy first
DROP POLICY IF EXISTS "Public can read published articles" ON articles;

-- Add status field
ALTER TABLE articles
ADD COLUMN status text CHECK (status IN ('draft', 'published')) DEFAULT 'draft';

-- Update existing articles
UPDATE articles
SET status = CASE
  WHEN published = true THEN 'published'
  ELSE 'draft'
END;

-- Make status required
ALTER TABLE articles
ALTER COLUMN status SET NOT NULL;

-- Drop old published column
ALTER TABLE articles
DROP COLUMN published;

-- Create new policy using status field
CREATE POLICY "Public can read published articles"
  ON articles FOR SELECT
  TO public
  USING (status = 'published');