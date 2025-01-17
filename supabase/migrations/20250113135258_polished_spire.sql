-- Update location categories to use Traditional Chinese
UPDATE categories
SET name_cn = CASE slug
  WHEN 'tokyo' THEN '東京'
  WHEN 'osaka' THEN '大阪'
  WHEN 'kyoto' THEN '京都'
  WHEN 'hokkaido' THEN '北海道'
  WHEN 'fukuoka' THEN '福岡'
  WHEN 'okinawa' THEN '沖繩'
  WHEN 'mount-fuji' THEN '富士山地區'
  WHEN 'nara' THEN '奈良'
  WHEN 'kobe' THEN '神戶'
  WHEN 'nagano' THEN '長野'
  WHEN 'hiroshima' THEN '廣島'
  WHEN 'kagoshima' THEN '鹿兒島'
  WHEN 'kanazawa' THEN '金澤'
  WHEN 'kagawa' THEN '高松和香川地區'
  WHEN 'sendai' THEN '仙台'
  WHEN 'shizuoka' THEN '靜岡'
  WHEN 'yokohama' THEN '橫濱'
  WHEN 'takayama' THEN '高山和飛驒地區'
  WHEN 'nagoya' THEN '名古屋'
  WHEN 'kumamoto' THEN '熊本'
  WHEN 'matsuyama' THEN '松山'
  WHEN 'wakayama' THEN '和歌山'
  WHEN 'ishikawa' THEN '石川'
  WHEN 'aomori' THEN '青森'
  WHEN 'akita' THEN '秋田'
  ELSE name_cn
END
WHERE parent_id = (SELECT id FROM categories WHERE slug = 'location');

-- Update location descriptions to use Traditional Chinese
UPDATE categories
SET description_cn = CASE slug
  WHEN 'tokyo' THEN '傳統與創新的交匯之地'
  WHEN 'osaka' THEN '日本的廚房與娛樂之都'
  WHEN 'kyoto' THEN '傳統日本的心臟'
  WHEN 'hokkaido' THEN '四季皆宜的自然樂園'
  WHEN 'fukuoka' THEN '九州之門'
  WHEN 'okinawa' THEN '日本的熱帶天堂'
  WHEN 'mount-fuji' THEN '探索日本的標誌性山峰'
  WHEN 'nara' THEN '與鹿共舞的千年古都'
  WHEN 'kobe' THEN '以神戶牛聞名的港口城市'
  WHEN 'nagano' THEN '冬季運動與寺廟之城'
  WHEN 'hiroshima' THEN '和平與希望之城'
  WHEN 'kagoshima' THEN '日本南部的門戶'
  WHEN 'kanazawa' THEN '傳統藝術與庭園之城'
  WHEN 'kagawa' THEN '以讚岐烏冬麵聞名'
  WHEN 'sendai' THEN '樹之城市'
  WHEN 'shizuoka' THEN '茶田與海景'
  WHEN 'yokohama' THEN '現代港口城市'
  WHEN 'takayama' THEN '傳統山城'
  WHEN 'nagoya' THEN '工業與文化中心'
  WHEN 'kumamoto' THEN '著名城堡之城'
  WHEN 'matsuyama' THEN '日本最古老的溫泉'
  WHEN 'wakayama' THEN '靈性古道與寺廟'
  WHEN 'ishikawa' THEN '傳統工藝與美食'
  WHEN 'aomori' THEN '北方文化與節日'
  WHEN 'akita' THEN '稻田與溫泉'
  ELSE description_cn
END
WHERE parent_id = (SELECT id FROM categories WHERE slug = 'location');

-- Update location introductions to use Traditional Chinese
UPDATE categories
SET introduction_cn = CASE slug
  WHEN 'tokyo' THEN '東京，傳統與創新的交匯之地'
  WHEN 'osaka' THEN '大阪，日本的廚房與娛樂之都'
  WHEN 'kyoto' THEN '京都，傳統日本的心臟'
  WHEN 'hokkaido' THEN '北海道，四季皆宜的自然樂園'
  WHEN 'fukuoka' THEN '福岡，九州之門'
  WHEN 'okinawa' THEN '沖繩，日本的熱帶天堂'
  WHEN 'mount-fuji' THEN '體驗富士山的壯麗'
  WHEN 'nara' THEN '漫步日本第一個永久性都城'
  WHEN 'kobe' THEN '體驗東西方文化的交融'
  WHEN 'nagano' THEN '著名雪猴的故鄉'
  WHEN 'hiroshima' THEN '和平與堅韌的象徵'
  WHEN 'kagoshima' THEN '體驗活火山櫻島'
  WHEN 'kanazawa' THEN '保存完好的江戶時代街區'
  WHEN 'kagawa' THEN '藝術之島與美味烏冬麵'
  WHEN 'sendai' THEN '東北地區的門戶'
  WHEN 'shizuoka' THEN '綠茶與富士山景'
  WHEN 'yokohama' THEN '日本第二大城市'
  WHEN 'takayama' THEN '日本阿爾卑斯山中的古城'
  WHEN 'nagoya' THEN '城堡之城與製造業中心'
  WHEN 'kumamoto' THEN '日本最優美城堡之一的所在地'
  WHEN 'matsuyama' THEN '歷史古城與溫泉'
  WHEN 'wakayama' THEN '朝聖路線的起點'
  WHEN 'ishikawa' THEN '傳統藝術與海鮮的故鄉'
  WHEN 'aomori' THEN '以睡魔祭聞名'
  WHEN 'akita' THEN '以大米與清酒聞名'
  ELSE introduction_cn
END
WHERE parent_id = (SELECT id FROM categories WHERE slug = 'location');