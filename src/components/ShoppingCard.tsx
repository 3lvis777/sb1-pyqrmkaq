import React from 'react';
import { MapPin, ArrowRight } from 'lucide-react';

interface ShoppingCardProps {
  name: string;
  nameCn: string;
  description: string;
  descriptionCn: string;
  address: string;
  imageUrl: string;
}

export default function ShoppingCard({
  name,
  nameCn,
  description,
  descriptionCn,
  address,
  imageUrl,
}: ShoppingCardProps) {
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
        <h3 className="text-xl font-bold text-gray-900 mb-1">
          {name}
          <span className="ml-2 text-lg text-gray-500">{nameCn}</span>
        </h3>
        <p className="text-gray-600 mb-2">{description}</p>
        <p className="text-gray-500 mb-4 text-sm">{descriptionCn}</p>
        <div className="flex items-start mb-4">
          <MapPin className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
          <p className="ml-2 text-sm text-gray-500">{address}</p>
        </div>
        <button className="inline-flex items-center text-red-600 hover:text-red-700 font-medium">
          Explore More
          <ArrowRight className="ml-1 h-4 w-4" />
        </button>
      </div>
    </div>
  );
}