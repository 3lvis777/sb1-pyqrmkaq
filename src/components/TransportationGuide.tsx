import React from 'react';
import { Train, CreditCard, Car } from 'lucide-react';

interface TransportOption {
  icon: typeof Train;
  title: string;
  titleCn: string;
  description: string;
  descriptionCn: string;
}

const transportOptions: TransportOption[] = [
  {
    icon: Train,
    title: 'Public Transport',
    titleCn: '公共交通',
    description: 'Use the JR Yamanote Line to travel around Tokyo easily',
    descriptionCn: '使用JR山手线轻松环游东京'
  },
  {
    icon: CreditCard,
    title: 'Subway Cards',
    titleCn: '地铁卡',
    description: 'Recommended to buy Suica or Pasmo cards',
    descriptionCn: '推荐购买Suica或Pasmo卡'
  },
  {
    icon: Car,
    title: 'Taxis & Bike Rentals',
    titleCn: '包车或自行车',
    description: 'Taxis are ideal for short trips, and bikes are great for exploring quieter neighborhoods',
    descriptionCn: '出租车适合短途旅行，自行车适合探索安静街区'
  }
];

export default function TransportationGuide() {
  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-900 mb-8">
        How to Get Around Tokyo
        <span className="ml-3 text-xl text-gray-500">交通指南</span>
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {transportOptions.map((option) => {
          const Icon = option.icon;
          return (
            <div key={option.title} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center mb-4">
                <div className="p-3 bg-red-50 rounded-lg">
                  <Icon className="h-6 w-6 text-red-500" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {option.title}
                <span className="ml-2 text-lg text-gray-500">{option.titleCn}</span>
              </h3>
              <p className="text-gray-600 mb-2">{option.description}</p>
              <p className="text-sm text-gray-500">{option.descriptionCn}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}