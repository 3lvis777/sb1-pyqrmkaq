import React from 'react';
import { Globe } from 'lucide-react';

interface LanguageSwitcherProps {
  language: 'en' | 'cn';
  onChange: (language: 'en' | 'cn') => void;
}

export default function LanguageSwitcher({ language, onChange }: LanguageSwitcherProps) {
  return (
    <div className="fixed top-24 right-6 z-50">
      <div className="bg-white/90 backdrop-blur-sm rounded-full shadow-lg p-1.5 flex items-center border border-gray-200/50">
        <Globe className="h-4 w-4 text-gray-500 absolute left-3" />
        <select
          value={language}
          onChange={(e) => onChange(e.target.value as 'en' | 'cn')}
          className="appearance-none bg-transparent pl-8 pr-8 py-1 text-sm font-medium text-gray-700 focus:outline-none cursor-pointer"
        >
          <option value="en">EN</option>
          <option value="cn">中文</option>
        </select>
      </div>
    </div>
  );
}