import React from 'react';
import { ArrowRight } from 'lucide-react';

interface ExperienceCardProps {
  title: string;
  titleCn: string;
  description: string;
  descriptionCn: string;
  duration: string;
  imageUrl: string;
  price: string;
}

export default function ExperienceCard({
  title,
  titleCn,
  description,
  descriptionCn,
  duration,
  imageUrl,
  price,
}: ExperienceCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden group">
      <div className="aspect-w-16 aspect-h-9 relative overflow-hidden">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-64 object-cover transform group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-1">
          {title}
          <span className="ml-2 text-lg text-gray-500">{titleCn}</span>
        </h3>
        <p className="text-gray-600 mb-2">{description}</p>
        <p className="text-gray-500 mb-4 text-sm">{descriptionCn}</p>
        <div className="flex items-center mb-4 text-sm text-gray-500">
          <span>{duration}</span>
          <span className="mx-2">·</span>
          <span>{price}</span>
        </div>
        <button className="inline-flex items-center text-red-600 hover:text-red-700 font-medium">
          Learn More
          <ArrowRight className="ml-1 h-4 w-4" />
        </button>
      </div>
    </div>
  );
}