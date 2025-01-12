-- Get category IDs
WITH location_category AS (
  SELECT id FROM categories WHERE slug = 'location'
),
activity_category AS (
  SELECT id FROM categories WHERE slug = 'activity'
),
osaka_category AS (
  SELECT id FROM categories 
  WHERE parent_id = (SELECT id FROM location_category)
  AND slug = 'osaka'
),
entertainment_category AS (
  SELECT id FROM categories 
  WHERE parent_id = (SELECT id FROM activity_category)
  AND slug = 'entertainment'
)

-- Insert articles
INSERT INTO articles (
  title,
  title_cn,
  slug,
  content,
  content_cn,
  category_id,
  location_id,
  featured_image,
  status,
  created_at,
  updated_at
) VALUES
(
  'Osaka Castle: A Historic Landmark',
  '大阪城：历史地标',
  'osaka-castle-historic-landmark',
  '# Osaka Castle: A Historic Landmark

One of Japan''s most famous landmarks, Osaka Castle stands as a proud symbol of the city''s rich history and architectural beauty. The castle tower, standing at a height of 55 meters, offers breathtaking panoramic views of the modern city skyline.

## History and Architecture

Built in 1583 by Toyotomi Hideyoshi, the castle played a crucial role in the unification of Japan. The current structure, while a reconstruction from 1931, maintains the grandeur of the original design. The castle''s impressive stone walls, some reaching up to 20 meters in height, showcase the remarkable engineering capabilities of the time.

## Museum and Cultural Significance

Inside the castle, visitors can explore a comprehensive museum featuring:

* Historical artifacts and documents
* Interactive exhibits about the castle''s construction
* Displays of samurai armor and weapons
* Detailed models of the castle throughout history

## Visitor Information

* Opening Hours: 9:00 AM - 5:00 PM (last entry 4:30 PM)
* Admission: ¥600 for adults
* Access: 10-minute walk from Tanimachi 4-chome Station
* Best visited during cherry blossom season (late March to early April)',
  '# 大阪城：历史地标

大阪城是日本最著名的地标之一，是这座城市丰富历史和建筑之美的骄傲象征。城楼高55米，可以360度俯瞰现代都市天际线。

## 历史与建筑

大阪城由丰臣秀吉于1583年建造，在日本统一过程中发挥了重要作用。虽然现在的建筑是1931年重建的，但保持了原有设计的宏伟气势。城堡的石墙令人印象深刻，有些高达20米，展示了当时非凡的工程技术。

## 博物馆与文化意义

城内设有综合博物馆，游客可以参观：

* 历史文物和文献
* 关于城堡建造的互动展览
* 武士盔甲和武器展示
* 历史上不同时期城堡的详细模型

## 参观信息

* 开放时间：上午9:00至下午5:00（最后入场时间下午4:30）
* 门票：成人600日元
* 交通：谷町四丁目站步行10分钟
* 最佳参观时间：樱花季节（3月下旬至4月初）',
  (SELECT id FROM entertainment_category),
  (SELECT id FROM osaka_category),
  'https://images.unsplash.com/photo-1590559899731-a382839e5549?auto=format&fit=crop&w=1200',
  'published',
  now(),
  now()
),
(
  'Shitennoji Temple: Japan''s Oldest Buddhist Temple',
  '四天王寺：日本最古老的佛教寺院',
  'shitennoji-temple-oldest-buddhist-temple',
  '# Shitennoji Temple: Japan''s Oldest Buddhist Temple

Founded in 593 by Prince Shōtoku, Shitennoji stands as Japan''s oldest officially administered temple. This historic temple complex continues to be an active center of Buddhist worship and cultural preservation.

## Temple Architecture

The temple complex features several important structures:

* Five-story Pagoda
* Golden Pavilion
* Main Temple Hall
* Traditional Japanese Garden

## Cultural Significance

Shitennoji played a crucial role in the establishment of Buddhism in Japan. The temple''s design became a model for many other Japanese Buddhist temples, featuring the traditional "Shitennoji-style" layout.

## Visitor Experience

* Beautiful traditional gardens perfect for meditation
* Regular Buddhist ceremonies and rituals
* Monthly flea market on temple grounds
* Peaceful atmosphere in the heart of Osaka',
  '# 四天王寺：日本最古老的佛教寺院

四天王寺由圣德太子于593年创建，是日本最古老的官方管理寺院。这座历史悠久的寺院建筑群至今仍是佛教礼拜和文化保护的活跃中心。

## 寺院建筑

寺院建筑群包括几个重要建筑：

* 五层塔
* 金阁
* 主殿堂
* 传统日式庭园

## 文化意义

四天王寺在佛教传入日本的过程中发挥了重要作用。寺院的设计成为许多日本佛教寺院的典范，形成了传统的"四天王寺式"布局。

## 参观体验

* 适合冥想的优美传统庭园
* 定期举行的佛教仪式
* 寺院境内每月举办跳蚤市场
* 位于大阪市中心的宁静氛围',
  (SELECT id FROM entertainment_category),
  (SELECT id FROM osaka_category),
  'https://images.unsplash.com/photo-1624601573012-efb68931cc8f?auto=format&fit=crop&w=1200',
  'published',
  now(),
  now()
),
(
  'Kuromon Ichiba Market: Osaka''s Kitchen',
  '黑门市场：大阪厨房',
  'kuromon-ichiba-market',
  '# Kuromon Ichiba Market: Osaka''s Kitchen

Known as "Osaka''s Kitchen," Kuromon Ichiba Market has been serving both professional chefs and food enthusiasts for over 190 years. This vibrant market stretches for about 600 meters and features nearly 150 shops.

## Market Highlights

The market offers an incredible variety of fresh products:

* Fresh seafood and sashimi
* Local Osaka specialties
* Seasonal fruits and vegetables
* Traditional Japanese sweets
* Street food and ready-to-eat delicacies

## Shopping Experience

* Many shops offer samples and tasting opportunities
* Vendors are friendly and welcoming to tourists
* Most shops open from early morning until late afternoon
* English menus are available at many stores

## Best Times to Visit

* Early morning for the freshest seafood
* Lunch time for the best street food atmosphere
* Weekday mornings to avoid crowds',
  '# 黑门市场：大阪厨房

黑门市场被称为"大阪厨房"，190多年来一直服务于专业厨师和美食爱好者。这个充满活力的市场全长约600米，拥有近150家商铺。

## 市场亮点

市场提供各种新鲜产品：

* 新鲜海鲜和刺身
* 大阪当地特色美食
* 应季水果和蔬菜
* 传统日式点心
* 街边小吃和即食美食

## 购物体验

* 许多商店提供试吃机会
* 商贩对游客友好热情
* 大多数商店从清早营业到傍晚
* 许多商店提供英文菜单

## 最佳参观时间

* 清早可以买到最新鲜的海鲜
* 午餐时间能体验最好的街边小吃氛围
* 工作日上午可以避开人群',
  (SELECT id FROM entertainment_category),
  (SELECT id FROM osaka_category),
  'https://images.unsplash.com/photo-1590077428593-a55bb07c4665?auto=format&fit=crop&w=1200',
  'published',
  now(),
  now()
);

-- Insert media records
INSERT INTO media (
  name,
  original_name,
  url,
  size,
  mime_type,
  tags,
  created_at,
  updated_at
) VALUES
(
  'osaka-castle.jpg',
  'osaka-castle.jpg',
  'https://images.unsplash.com/photo-1590559899731-a382839e5549?auto=format&fit=crop&w=1200',
  0,
  'image/jpeg',
  ARRAY['osaka', 'sightseeing', 'places', 'castle'],
  now(),
  now()
),
(
  'shitennoji-temple.jpg',
  'shitennoji-temple.jpg',
  'https://images.unsplash.com/photo-1624601573012-efb68931cc8f?auto=format&fit=crop&w=1200',
  0,
  'image/jpeg',
  ARRAY['osaka', 'sightseeing', 'places', 'temple'],
  now(),
  now()
),
(
  'kuromon-market.jpg',
  'kuromon-market.jpg',
  'https://images.unsplash.com/photo-1590077428593-a55bb07c4665?auto=format&fit=crop&w=1200',
  0,
  'image/jpeg',
  ARRAY['osaka', 'sightseeing', 'places', 'market'],
  now(),
  now()
);