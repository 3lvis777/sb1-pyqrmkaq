/*
  # Fix City Data Structure

  1. Changes
    - Add city_details columns directly to categories table
    - Update existing city categories with hero images
    - Add indexes for better performance

  2. Data
    - Add hero images for major cities
*/

-- Add city details columns directly to categories
ALTER TABLE categories
ADD COLUMN IF NOT EXISTS hero_image_url text,
ADD COLUMN IF NOT EXISTS introduction text,
ADD COLUMN IF NOT EXISTS introduction_cn text;

-- Update existing city categories with hero images
WITH city_data (slug, hero_image_url, introduction, introduction_cn) AS (
  VALUES 
    ('tokyo', 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=2000', 'Tokyo, where tradition meets innovation', '东京，传统与创新的交汇之地'),
    ('osaka', 'https://images.unsplash.com/photo-1590559899731-a382839e5549?auto=format&fit=crop&w=2000', 'Osaka, Japan''s kitchen and entertainment hub', '大阪，日本的厨房与娱乐之都'),
    ('kyoto', 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=2000', 'Kyoto, the heart of traditional Japan', '京都，传统日本的心脏'),
    ('hokkaido', 'https://images.unsplash.com/photo-1578271887552-5ac3a72752bc?auto=format&fit=crop&w=2000', 'Hokkaido, a natural wonderland in all seasons', '北海道，四季皆宜的自然乐园'),
    ('fukuoka', 'https://images.unsplash.com/photo-1590077428593-a55bb07c4665?auto=format&fit=crop&w=2000', 'Fukuoka, gateway to Kyushu', '福冈，九州之门'),
    ('okinawa', 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=2000', 'Okinawa, tropical paradise of Japan', '冲绳，日本的热带天堂')
)
UPDATE categories c
SET 
  hero_image_url = cd.hero_image_url,
  introduction = cd.introduction,
  introduction_cn = cd.introduction_cn
FROM city_data cd
WHERE c.slug = cd.slug
  AND c.parent_id = (SELECT id FROM categories WHERE slug = 'location');

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_categories_parent_slug ON categories(parent_id, slug);