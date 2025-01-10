import React from 'react';
import CityCard from '../components/CityCard';

const regions = [
  {
    id: 'hokkaido',
    nameEn: 'Hokkaido',
    nameCn: '北海道',
    descriptionCn: '日本最北端，自然与温泉的天堂。',
    imageUrl: 'https://images.unsplash.com/photo-1578271887552-5ac3a72752bc?auto=format&fit=crop&w=1000',
  },
  {
    id: 'tohoku',
    nameEn: 'Tohoku',
    nameCn: '东北',
    descriptionCn: '传统文化与自然风光的完美结合。',
    imageUrl: 'https://images.unsplash.com/photo-1542931287-023b922fa89b?auto=format&fit=crop&w=1000',
  },
  {
    id: 'tokyo',
    nameEn: 'Tokyo',
    nameCn: '东京',
    descriptionCn: '现代与传统交织的大都会。',
    imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1000',
  },
  {
    id: 'hokuriku',
    nameEn: 'Hokuriku',
    nameCn: '北陆',
    descriptionCn: '传统工艺与温泉胜地。',
    imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1000',
  },
  {
    id: 'chubu',
    nameEn: 'Chubu',
    nameCn: '中部',
    descriptionCn: '富士山与日本阿尔卑斯山脉。',
    imageUrl: 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?auto=format&fit=crop&w=1000',
  },
  {
    id: 'osaka',
    nameEn: 'Kansai',
    nameCn: '关西',
    descriptionCn: '千年古都与现代活力的交融。',
    imageUrl: 'https://images.unsplash.com/photo-1590559899731-a382839e5549?auto=format&fit=crop&w=1000',
  },
  {
    id: 'chugoku',
    nameEn: 'Chugoku',
    nameCn: '中国',
    descriptionCn: '历史遗迹与濑户内海风光。',
    imageUrl: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=1000',
  },
  {
    id: 'shikoku',
    nameEn: 'Shikoku',
    nameCn: '四国',
    descriptionCn: '朝圣之路与自然美景。',
    imageUrl: 'https://images.unsplash.com/photo-1624601573012-efb68931cc8f?auto=format&fit=crop&w=1000',
  },
  {
    id: 'kyushu',
    nameEn: 'Kyushu',
    nameCn: '九州',
    descriptionCn: '温泉与火山的故乡。',
    imageUrl: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=1000',
  },
  {
    id: 'okinawa',
    nameEn: 'Okinawa',
    nameCn: '冲绳',
    descriptionCn: '热带天堂与琉球文化。',
    imageUrl: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?auto=format&fit=crop&w=1000',
  },
] as const;

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Discover Japan
          </h1>
          <p className="text-xl text-gray-600">
            探索日本的魅力，体验独特的文化与美食
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {regions.map((region) => (
            <CityCard key={region.id} city={region} />
          ))}
        </div>
      </div>
    </div>
  );
}