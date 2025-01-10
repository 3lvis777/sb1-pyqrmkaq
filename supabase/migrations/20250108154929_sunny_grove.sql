/*
  # Add sample articles data

  1. New Data
    - Categories for articles (food, shopping, activities)
    - Tags for articles (sushi, shopping, skiing, etc.)
    - Sample articles from the CityPage component
  
  2. Changes
    - Insert initial categories
    - Insert initial tags
    - Insert sample articles with tags
*/

-- Insert categories
INSERT INTO categories (name, name_cn, slug, description) VALUES
('Food', '美食', 'food', 'Food and dining experiences'),
('Shopping', '购物', 'shopping', 'Shopping guides and recommendations'),
('Activities', '活动', 'activities', 'Things to do and experiences');

-- Insert tags
INSERT INTO tags (name, name_cn, slug) VALUES
('Sushi', '寿司', 'sushi'),
('Shopping', '购物', 'shopping'),
('Skiing', '滑雪', 'skiing'),
('Ramen', '拉面', 'ramen'),
('Hot Springs', '温泉', 'onsen');

-- Insert articles
WITH category_ids AS (
  SELECT id, slug FROM categories
),
tag_ids AS (
  SELECT id, slug FROM tags
)
INSERT INTO articles (
  category_id,
  title,
  title_cn,
  slug,
  content,
  content_cn,
  featured_image,
  published,
  published_at
)
SELECT
  c.id,
  CASE c.slug
    WHEN 'food' THEN '2025 Must-Try Sushi Restaurants'
    WHEN 'shopping' THEN 'Shopping in Sapporo'
    WHEN 'activities' THEN 'Best Ski Resorts'
    WHEN 'food' THEN 'Famous Ramen Shops'
    ELSE 'Hot Springs Guide'
  END,
  CASE c.slug
    WHEN 'food' THEN '2025必吃回转寿司5选'
    WHEN 'shopping' THEN '札幌购物攻略'
    WHEN 'activities' THEN '北海道滑雪场推荐'
    WHEN 'food' THEN '人气拉面店特集'
    ELSE '温泉攻略'
  END,
  CASE c.slug
    WHEN 'food' THEN '2025-must-try-sushi'
    WHEN 'shopping' THEN 'shopping-in-sapporo'
    WHEN 'activities' THEN 'best-ski-resorts'
    WHEN 'food' THEN 'famous-ramen-shops'
    ELSE 'hot-springs-guide'
  END,
  CASE c.slug
    WHEN 'food' THEN '「根室花丸」等名店推荐品项看这篇！'
    WHEN 'shopping' THEN '狸小路、大丸百货等商圈完全指南'
    WHEN 'activities' THEN 'ニセコ、留寿都等人气雪场攻略'
    WHEN 'food' THEN '札幌必吃拉面店完全指南'
    ELSE '登别、定山溪等温泉区详解'
  END,
  CASE c.slug
    WHEN 'food' THEN '「根室花丸」等名店推荐品项看这篇！'
    WHEN 'shopping' THEN '狸小路、大丸百货等商圈完全指南'
    WHEN 'activities' THEN 'ニセコ、留寿都等人气雪场攻略'
    WHEN 'food' THEN '札幌必吃拉面店完全指南'
    ELSE '登别、定山溪等温泉区详解'
  END,
  CASE c.slug
    WHEN 'food' THEN 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=800'
    WHEN 'shopping' THEN 'https://images.unsplash.com/photo-1542931670-7eacae6536ad?auto=format&fit=crop&w=800'
    WHEN 'activities' THEN 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?auto=format&fit=crop&w=800'
    WHEN 'food' THEN 'https://images.unsplash.com/photo-1623341214825-9f4f963727da?auto=format&fit=crop&w=800'
    ELSE 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?auto=format&fit=crop&w=800'
  END,
  true,
  now()
FROM category_ids c;

-- Link articles with tags
WITH article_data AS (
  SELECT a.id as article_id, t.id as tag_id
  FROM articles a
  CROSS JOIN tags t
  WHERE (a.title LIKE '%Sushi%' AND t.slug = 'sushi')
     OR (a.title LIKE '%Shopping%' AND t.slug = 'shopping')
     OR (a.title LIKE '%Ski%' AND t.slug = 'skiing')
     OR (a.title LIKE '%Ramen%' AND t.slug = 'ramen')
     OR (a.title LIKE '%Springs%' AND t.slug = 'onsen')
)
INSERT INTO article_tags (article_id, tag_id)
SELECT article_id, tag_id FROM article_data;