import React, { useState } from 'react';
import AreaDetails from './AreaDetails';

interface KantoArea {
  id: string;
  nameEn: string;
  nameCn: string;
  imageUrl: string;
  coordinates: string; // SVG path coordinates
}

const kantoAreas: KantoArea[] = [
  {
    id: 'tokyo',
    nameEn: 'Tokyo',
    nameCn: '东京',
    imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=500',
    coordinates: 'M180,240 L200,240 L210,250 L200,260 L180,260 Z'
  },
  {
    id: 'kanagawa',
    nameEn: 'Kanagawa',
    nameCn: '神奈川',
    imageUrl: 'https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?auto=format&fit=crop&w=500',
    coordinates: 'M160,260 L200,260 L210,270 L190,280 L150,270 Z'
  },
  {
    id: 'chiba',
    nameEn: 'Chiba',
    nameCn: '千叶',
    imageUrl: 'https://images.unsplash.com/photo-1542931287-023b922fa89b?auto=format&fit=crop&w=500',
    coordinates: 'M210,230 L240,220 L250,240 L240,260 L210,250 Z'
  },
  {
    id: 'saitama',
    nameEn: 'Saitama',
    nameCn: '埼玉',
    imageUrl: 'https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=500',
    coordinates: 'M170,220 L210,220 L210,240 L170,240 Z'
  },
  {
    id: 'ibaraki',
    nameEn: 'Ibaraki',
    nameCn: '茨城',
    imageUrl: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=500',
    coordinates: 'M210,190 L240,190 L250,220 L240,220 L210,220 Z'
  },
  {
    id: 'tochigi',
    nameEn: 'Tochigi',
    nameCn: '栃木',
    imageUrl: 'https://images.unsplash.com/photo-1480796927426-f609979314bd?auto=format&fit=crop&w=500',
    coordinates: 'M170,190 L210,190 L210,220 L170,220 Z'
  },
  {
    id: 'gunma',
    nameEn: 'Gunma',
    nameCn: '群马',
    imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=500',
    coordinates: 'M130,190 L170,190 L170,220 L130,220 Z'
  },
];

export default function KantoMap() {
  const [hoveredArea, setHoveredArea] = useState<string | null>(null);
  const [selectedArea, setSelectedArea] = useState<string | null>(null);

  return (
    <div className="py-12">
      <h2 className="text-3xl font-bold text-gray-900 mb-8">
        Explore Kanto Region
        <span className="ml-3 text-xl text-gray-500">关东地区</span>
      </h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Map */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <svg
            viewBox="0 0 400 400"
            className="w-full h-auto"
            style={{ background: '#f8fafc' }}
          >
            {kantoAreas.map((area) => (
              <path
                key={area.id}
                d={area.coordinates}
                fill={hoveredArea === area.id ? '#ef4444' : '#fff'}
                stroke="#1f2937"
                strokeWidth="2"
                onMouseEnter={() => setHoveredArea(area.id)}
                onMouseLeave={() => setHoveredArea(null)}
                className="transition-colors duration-200 cursor-pointer hover:fill-red-500"
              />
            ))}
          </svg>
        </div>

        {/* Area Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {kantoAreas.map((area) => (
            <div
              key={area.id}
              className={`relative overflow-hidden rounded-lg transition-transform duration-200 ${
                hoveredArea === area.id ? 'scale-105 ring-2 ring-red-500' : ''
              } cursor-pointer`}
              onMouseEnter={() => setHoveredArea(area.id)}
              onMouseLeave={() => setHoveredArea(null)}
              onClick={() => setSelectedArea(area.id)}
            >
              <img
                src={area.imageUrl}
                alt={area.nameEn}
                className="w-full h-48 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 p-4">
                <h3 className="text-xl font-bold text-white">
                  {area.nameEn}
                  <span className="ml-2 text-lg text-white/90">{area.nameCn}</span>
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>
      {selectedArea && (
        <AreaDetails
          areaId={selectedArea}
          onClose={() => setSelectedArea(null)}
        />
      )}
    </div>
  );
}