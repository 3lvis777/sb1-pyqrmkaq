import React from 'react';
import { X } from 'lucide-react';

interface Destination {
  id: string;
  nameEn: string;
  nameCn: string;
  description: string;
  descriptionCn: string;
  imageUrl: string;
}

interface AreaDetailsProps {
  areaId: string;
  onClose: () => void;
}

const areaDestinations: Record<string, Destination[]> = {
  chiba: [
    {
      id: 'disney',
      nameEn: 'Tokyo Disneyland',
      nameCn: '东京迪士尼乐园',
      description: 'The first Disney park outside the United States',
      descriptionCn: '美国境外第一个迪士尼乐园',
      imageUrl: 'https://images.unsplash.com/photo-1624601573012-efb68931cc8f?auto=format&fit=crop&w=800',
    },
    {
      id: 'naritasan',
      nameEn: 'Naritasan Shinshoji Temple',
      nameCn: '成田山新胜寺',
      description: 'Historic Buddhist temple founded in 940',
      descriptionCn: '始建于940年的历史悠久的佛教寺院',
      imageUrl: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=800',
    },
    {
      id: 'nokogiri',
      nameEn: 'Mount Nokogiri',
      nameCn: '锯山',
      description: 'Mountain with spectacular views of Tokyo Bay',
      descriptionCn: '可俯瞰东京湾的壮丽山景',
      imageUrl: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?auto=format&fit=crop&w=800',
    },
  ],
  // Add other areas' destinations here
};

export default function AreaDetails({ areaId, onClose }: AreaDetailsProps) {
  const destinations = areaDestinations[areaId] || [];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl p-6 m-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Popular Destinations
            <span className="ml-2 text-xl text-gray-500">热门景点</span>
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {destinations.map((dest) => (
            <div
              key={dest.id}
              className="bg-white rounded-lg shadow-sm overflow-hidden group"
            >
              <div className="aspect-w-16 aspect-h-9 relative overflow-hidden">
                <img
                  src={dest.imageUrl}
                  alt={dest.nameEn}
                  className="w-full h-48 object-cover transform group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  {dest.nameEn}
                  <span className="ml-2 text-base text-gray-500">{dest.nameCn}</span>
                </h3>
                <p className="text-sm text-gray-600 mb-1">{dest.description}</p>
                <p className="text-sm text-gray-500">{dest.descriptionCn}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}