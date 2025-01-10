import React from 'react';
import { MapPin, CircleDollarSign } from 'lucide-react';

interface RestaurantCardProps {
  name: string;
  nameCn: string;
  category: string;
  categoryCn: string;
  description: string;
  address: string;
  priceRange: number;
  imageUrl: string;
}

export default function RestaurantCard({
  name,
  nameCn,
  category,
  categoryCn,
  description,
  address,
  priceRange,
  imageUrl,
}: RestaurantCardProps) {
  const renderPriceRange = () => {
    return Array(priceRange)
      .fill(null)
      .map((_, i) => (
        <CircleDollarSign key={i} className="h-4 w-4 inline-block text-yellow-500" />
      ));
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden group">
      <div className="aspect-w-16 aspect-h-9 relative overflow-hidden">
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-64 object-cover transform group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-6">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              {name}
              <span className="ml-2 text-lg text-gray-500">{nameCn}</span>
            </h3>
            <p className="text-sm text-gray-600">
              {category}
              <span className="mx-2">·</span>
              <span className="text-gray-500">{categoryCn}</span>
            </p>
          </div>
          <div className="flex">{renderPriceRange()}</div>
        </div>
        <p className="text-gray-600 mb-4">{description}</p>
        <div className="flex items-start">
          <MapPin className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
          <p className="ml-2 text-sm text-gray-500">{address}</p>
        </div>
      </div>
    </div>
  );
}