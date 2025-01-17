import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

interface NewsFlashProps {
  article: {
    title: string;
    title_cn: string;
    slug: string;
  };
  language: 'en' | 'cn';
}

export default function NewsFlash({ article, language }: NewsFlashProps) {
  return (
    <div className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-12 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-sm">
              {language === 'en' ? 'LATEST' : '最新'}
            </span>
            <Link 
              to={`/articles/${article.slug}?lang=${language}`}
              className="text-gray-900 hover:text-red-500 transition-colors line-clamp-1"
            >
              {language === 'en' ? article.title : article.title_cn}
            </Link>
          </div>
          <Link
            to={`/articles/${article.slug}?lang=${language}`}
            className="flex items-center text-red-500 hover:text-red-600 text-sm font-medium"
          >
            {language === 'en' ? 'Read More' : '阅读更多'}
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}