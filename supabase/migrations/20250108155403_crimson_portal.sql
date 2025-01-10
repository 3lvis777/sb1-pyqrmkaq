/*
  # Add Location Category

  1. New Categories
    - Add "Location" category for city-specific content
    - Add initial cities as subcategories

  2. Changes
    - Insert new location category
    - Insert city subcategories
*/

-- Insert location category
INSERT INTO categories (name, name_cn, slug, description, description_cn)
VALUES (
  'Location',
  '地区',
  'location',
  'City-specific guides and information',
  '城市特定指南和信息'
);

-- Insert city subcategories
WITH location_category AS (
  SELECT id FROM categories WHERE slug = 'location'
)
INSERT INTO categories (parent_id, name, name_cn, slug, description, description_cn)
VALUES
  ((SELECT id FROM location_category), 'Tokyo', '东京', 'tokyo', 'Tokyo guides and information', '东京指南和信息'),
  ((SELECT id FROM location_category), 'Osaka', '大阪', 'osaka', 'Osaka guides and information', '大阪指南和信息'),
  ((SELECT id FROM location_category), 'Kyoto', '京都', 'kyoto', 'Kyoto guides and information', '京都指南和信息'),
  ((SELECT id FROM location_category), 'Hokkaido', '北海道', 'hokkaido', 'Hokkaido guides and information', '北海道指南和信息'),
  ((SELECT id FROM location_category), 'Fukuoka', '福冈', 'fukuoka', 'Fukuoka guides and information', '福冈指南和信息'),
  ((SELECT id FROM location_category), 'Okinawa', '冲绳', 'okinawa', 'Okinawa guides and information', '冲绳指南和信息');