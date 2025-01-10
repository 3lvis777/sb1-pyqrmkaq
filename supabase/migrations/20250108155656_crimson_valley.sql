/*
  # Add Location Field to Articles

  1. Changes
    - Add location_id field to articles table
    - Add foreign key constraint to categories table
    - Update existing articles with location data

  2. Purpose
    - Allow articles to be associated with specific locations
    - Separate location categorization from activity categorization
*/

-- Add location_id to articles
ALTER TABLE articles
ADD COLUMN location_id uuid REFERENCES categories(id);

-- Add index for better query performance
CREATE INDEX idx_articles_location_id ON articles(location_id);

-- Update existing articles with location data
WITH location_categories AS (
  SELECT id, slug 
  FROM categories 
  WHERE parent_id = (SELECT id FROM categories WHERE slug = 'location')
)
UPDATE articles
SET location_id = (
  SELECT id 
  FROM location_categories 
  WHERE slug = 'hokkaido'
)
WHERE title LIKE '%Sapporo%' OR title LIKE '%Hokkaido%';