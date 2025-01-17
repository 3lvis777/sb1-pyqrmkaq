import React from 'react';
import { MapPin } from 'lucide-react';

interface LocationBadgeProps {
  name: string;
  nameCn: string;
  language: 'en' | 'cn';
  onClick?: (e: React.MouseEvent) => void;
}

export default function LocationBadge({ name, nameCn, language, onClick }: LocationBadgeProps) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center px-1.5 py-0.5 bg-red-500/80 text-white text-xs rounded-full shadow-sm hover:bg-red-600/80 transition-colors backdrop-blur-sm"
    >
      <MapPin className="h-2.5 w-2.5 mr-0.5" />
      <span className="font-medium truncate max-w-[80px]">
        {language === 'en' ? name : nameCn}
      </span>
    </button>
  );
}