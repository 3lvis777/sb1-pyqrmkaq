import React from 'react';
import { Leaf, Sun, Snowflake, Cherry } from 'lucide-react';

interface SeasonEvent {
  icon: typeof Cherry;
  season: string;
  seasonCn: string;
  title: string;
  titleCn: string;
  places: Array<{
    name: string;
    nameCn: string;
    imageUrl: string;
  }>;
}

const seasonalEvents: SeasonEvent[] = [
  {
    icon: Cherry,
    season: 'Spring',
    seasonCn: '春季',
    title: 'Best Cherry Blossom Spots',
    titleCn: '赏樱名所',
    places: [
      {
        name: 'Ueno Park',
        nameCn: '上野公园',
        imageUrl: 'https://images.unsplash.com/photo-1522383225653-ed111181a951?auto=format&fit=crop&w=800'
      },
      {
        name: 'Sumida River Park',
        nameCn: '隅田川公园',
        imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800'
      }
    ]
  },
  {
    icon: Sun,
    season: 'Summer',
    seasonCn: '夏季',
    title: 'Fireworks Festivals',
    titleCn: '烟火大会',
    places: [
      {
        name: 'Sumida River Fireworks Festival',
        nameCn: '隅田川烟火大会',
        imageUrl: 'https://images.unsplash.com/photo-1519098901909-b1553a1190af?auto=format&fit=crop&w=800'
      }
    ]
  },
  {
    icon: Leaf,
    season: 'Autumn',
    seasonCn: '秋季',
    title: 'Fall Foliage Spots',
    titleCn: '红叶景点',
    places: [
      {
        name: 'Meiji Jingu Gaien',
        nameCn: '明治神宫外苑',
        imageUrl: 'https://images.unsplash.com/photo-1480796927426-f609979314bd?auto=format&fit=crop&w=800'
      }
    ]
  },
  {
    icon: Snowflake,
    season: 'Winter',
    seasonCn: '冬季',
    title: 'Illumination Events',
    titleCn: '灯饰节',
    places: [
      {
        name: 'Roppongi Illuminations',
        nameCn: '六本木灯饰',
        imageUrl: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=800'
      }
    ]
  }
];

export default function SeasonalHighlights() {
  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-900 mb-8">
        What's Happening in Tokyo
        <span className="ml-3 text-xl text-gray-500">季节活动</span>
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {seasonalEvents.map((event) => {
          const Icon = event.icon;
          return (
            <div key={event.season} className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <Icon className="h-6 w-6 text-red-500" />
                  <span className="ml-2 font-bold text-gray-900">{event.season}</span>
                  <span className="ml-2 text-gray-500">{event.seasonCn}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {event.title}
                  <span className="ml-2 text-lg text-gray-500">{event.titleCn}</span>
                </h3>
                <div className="space-y-4">
                  {event.places.map((place) => (
                    <div key={place.name} className="group">
                      <div className="relative h-48 rounded-lg overflow-hidden mb-2">
                        <img
                          src={place.imageUrl}
                          alt={place.name}
                          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <h4 className="font-medium text-gray-900">
                        {place.name}
                        <span className="ml-2 text-gray-500">{place.nameCn}</span>
                      </h4>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}