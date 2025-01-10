import React from 'react';
import { Languages } from 'lucide-react';

interface LanguageToggleProps {
  language: 'en' | 'cn';
  onChange: (language: 'en' | 'cn') => void;
}

export default function LanguageToggle({ language, onChange }: LanguageToggleProps) {
  return (
    <div className="flex items-center space-x-2 bg-white rounded-full shadow-sm border p-1">
      <button
        onClick={() => onChange('en')}
        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
          language === 'en'
            ? 'bg-red-500 text-white'
            : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        EN
      </button>
      <button
        onClick={() => onChange('cn')}
        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
          language === 'cn'
            ? 'bg-red-500 text-white'
            : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        中文
      </button>
    </div>
  );
}