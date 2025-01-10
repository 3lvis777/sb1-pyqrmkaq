import React from 'react';
import { Link } from 'react-router-dom';
import type { City } from '../types';

interface CityCardProps {
  city: City;
}

export default function CityCard({ city }: CityCardProps) {
  return (
    <Link to={`/city/${city.id}`} className="group">
      <div className="relative overflow-hidden rounded-lg shadow-lg">
        <img
          src={city.imageUrl}
          alt={city.nameEn}
          className="w-full h-64 object-cover transform group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 p-6">
          <h3 className="text-2xl font-bold text-white mb-1">{city.nameEn}</h3>
          <p className="text-lg text-white/90">{city.nameCn}</p>
        </div>
      </div>
    </Link>
  );
}