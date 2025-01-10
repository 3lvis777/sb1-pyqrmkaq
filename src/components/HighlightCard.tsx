import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface HighlightCardProps {
  id: string;
  imageUrl: string;
  title: string;
  titleCn: string;
  description: string;
  cityId: string;
}

export default function HighlightCard({
  id,
  imageUrl,
  title,
  titleCn,
  description,
  cityId,
}: HighlightCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden group">
      <div className="aspect-w-16 aspect-h-9 relative overflow-hidden">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-1">
          {title}
          <span className="ml-2 text-lg text-gray-500">{titleCn}</span>
        </h3>
        <p className="text-gray-600 mb-4 line-clamp-2">{description}</p>
        <Link
          to={`/city/${cityId}/place/${id}`}
          className="inline-flex items-center text-red-600 hover:text-red-700 font-medium"
        >
          Learn More
          <ArrowRight className="ml-1 h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}