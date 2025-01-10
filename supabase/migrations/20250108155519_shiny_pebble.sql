/*
  # Reorganize Categories Structure

  1. Changes
    - Create main category groups: Location and Activity
    - Move existing categories under Activity group
    - Ensure proper hierarchy for better organization

  2. New Structure
    - Location (cities)
      - Tokyo, Osaka, etc.
    - Activity
      - Food (eat)
      - Shopping (buy)
      - Entertainment (fun)
*/

-- Create main category groups
INSERT INTO categories (name, name_cn, slug, description, description_cn)
VALUES
  (
    'Activity',
    '活动类型',
    'activity',
    'Activity categories including food, shopping, and entertainment',
    '包括美食、购物和娱乐的活动类别'
  );

-- Get IDs for reorganization
WITH activity_category AS (
  SELECT id FROM categories WHERE slug = 'activity'
),
location_category AS (
  SELECT id FROM categories WHERE slug = 'location'
)

-- Update existing activity categories to be under Activity group
UPDATE categories
SET parent_id = (SELECT id FROM activity_category)
WHERE slug IN ('food', 'shopping', 'activities')
  AND parent_id IS NULL;

-- Rename 'activities' to 'entertainment' for clarity
UPDATE categories
SET 
  name = 'Entertainment',
  name_cn = '娱乐',
  slug = 'entertainment',
  description = 'Entertainment and leisure activities',
  description_cn = '娱乐和休闲活动'
WHERE slug = 'activities';