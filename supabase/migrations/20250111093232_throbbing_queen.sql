/*
  # Add new locations and popularity sorting

  1. New Features
    - Add popularity column to categories table
    - Add new location categories
    - Set initial popularity values
    
  2. Changes
    - Add popularity field for sorting
    - Add 20 new locations
    - Update existing locations with popularity values
*/

-- Add popularity column
ALTER TABLE categories
ADD COLUMN IF NOT EXISTS popularity integer DEFAULT 0;

-- Get location category ID
DO $$
DECLARE
  location_id uuid;
BEGIN
  SELECT id INTO location_id FROM categories WHERE slug = 'location';

  -- Insert new locations
  INSERT INTO categories (
    parent_id,
    name,
    name_cn,
    slug,
    description,
    description_cn,
    hero_image_url,
    introduction,
    introduction_cn,
    popularity
  ) VALUES
    (location_id, 'Mount Fuji Area', '富士山地区', 'mount-fuji', 'Discover Japan''s iconic mountain', '探索日本的标志性山峰', 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?auto=format&fit=crop&w=2000', 'Experience the majesty of Mount Fuji', '体验富士山的壮丽', 100),
    (location_id, 'Nara', '奈良', 'nara', 'Ancient capital with friendly deer', '与鹿共舞的千年古都', 'https://images.unsplash.com/photo-1624601573012-efb68931cc8f?auto=format&fit=crop&w=2000', 'Walk through Japan''s first permanent capital', '漫步日本第一个永久性都城', 95),
    (location_id, 'Kobe', '神户', 'kobe', 'Port city famous for beef', '以神户牛闻名的港口城市', 'https://images.unsplash.com/photo-1590077428593-a55bb07c4665?auto=format&fit=crop&w=2000', 'Experience the blend of East and West', '体验东西方文化的交融', 90),
    (location_id, 'Nagano', '长野', 'nagano', 'Winter sports and temple town', '冬季运动与寺庙之城', 'https://images.unsplash.com/photo-1542931670-7eacae6536ad?auto=format&fit=crop&w=2000', 'Home to the famous Snow Monkeys', '著名雪猴的故乡', 85),
    (location_id, 'Hiroshima', '广岛', 'hiroshima', 'City of peace and hope', '和平与希望之城', 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?auto=format&fit=crop&w=2000', 'A symbol of peace and resilience', '和平与坚韧的象征', 80),
    (location_id, 'Kagoshima', '鹿儿岛', 'kagoshima', 'Gateway to Southern Japan', '日本南部的门户', 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=2000', 'Experience the active volcano Sakurajima', '体验活火山樱岛', 75),
    (location_id, 'Kanazawa', '金泽', 'kanazawa', 'Traditional arts and gardens', '传统艺术与庭园之城', 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=2000', 'Preserved Edo Period districts', '保存完好的江户时代街区', 70),
    (location_id, 'Kagawa', '高松和香川地区', 'kagawa', 'Famous for Udon noodles', '以讚岐乌冬面闻名', 'https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=2000', 'Art islands and famous noodles', '艺术之岛与美味乌冬面', 65),
    (location_id, 'Sendai', '仙台', 'sendai', 'City of Trees', '树之城市', 'https://images.unsplash.com/photo-1542931287-023b922fa89b?auto=format&fit=crop&w=2000', 'Gateway to Tohoku region', '东北地区的门户', 60),
    (location_id, 'Shizuoka', '静冈', 'shizuoka', 'Tea fields and ocean views', '茶田与海景', 'https://images.unsplash.com/photo-1578271887552-5ac3a72752bc?auto=format&fit=crop&w=2000', 'Green tea and Mount Fuji views', '绿茶与富士山景', 55),
    (location_id, 'Yokohama', '横滨', 'yokohama', 'Modern port city', '现代港口城市', 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=2000', 'Japan''s second largest city', '日本第二大城市', 50),
    (location_id, 'Takayama', '高山和飞驒地区', 'takayama', 'Traditional mountain town', '传统山城', 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?auto=format&fit=crop&w=2000', 'Old town in the Japanese Alps', '日本阿尔卑斯山中的古城', 45),
    (location_id, 'Nagoya', '名古屋', 'nagoya', 'Industrial and cultural hub', '工业与文化中心', 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=2000', 'Castle town and manufacturing center', '城堡之城与制造业中心', 40),
    (location_id, 'Kumamoto', '熊本', 'kumamoto', 'Famous castle town', '著名城堡之城', 'https://images.unsplash.com/photo-1480796927426-f609979314bd?auto=format&fit=crop&w=2000', 'Home to one of Japan''s finest castles', '日本最优美城堡之一的所在地', 35),
    (location_id, 'Matsuyama', '松山', 'matsuyama', 'Oldest hot spring in Japan', '日本最古老的温泉', 'https://images.unsplash.com/photo-1623341214825-9f4f963727da?auto=format&fit=crop&w=2000', 'Historic castle and hot springs', '历史古城与温泉', 30),
    (location_id, 'Wakayama', '和歌山', 'wakayama', 'Spiritual trails and temples', '灵性古道与寺庙', 'https://images.unsplash.com/photo-1590559899731-a382839e5549?auto=format&fit=crop&w=2000', 'Starting point of pilgrimage routes', '朝圣路线的起点', 25),
    (location_id, 'Ishikawa', '石川', 'ishikawa', 'Traditional crafts and cuisine', '传统工艺与美食', 'https://images.unsplash.com/photo-1522383225653-ed111181a951?auto=format&fit=crop&w=2000', 'Home to traditional arts and seafood', '传统艺术与海鲜的故乡', 20),
    (location_id, 'Aomori', '青森', 'aomori', 'Northern culture and festivals', '北方文化与节日', 'https://images.unsplash.com/photo-1519098901909-b1553a1190af?auto=format&fit=crop&w=2000', 'Famous for its Nebuta Festival', '以睡魔祭闻名', 15),
    (location_id, 'Akita', '秋田', 'akita', 'Rice fields and hot springs', '稻田与温泉', 'https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?auto=format&fit=crop&w=2000', 'Known for its rice and sake', '以大米与清酒闻名', 10);

  -- Update existing locations with popularity values
  UPDATE categories
  SET popularity = CASE slug
    WHEN 'tokyo' THEN 1000
    WHEN 'kyoto' THEN 950
    WHEN 'osaka' THEN 900
    WHEN 'hokkaido' THEN 850
    WHEN 'fukuoka' THEN 800
    WHEN 'okinawa' THEN 750
    ELSE popularity
  END
  WHERE parent_id = location_id;

END $$;