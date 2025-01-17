import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ArrowRight } from 'lucide-react';
import LocationBadge from './LocationBadge';

interface Article {
  id: string;
  title: string;
  title_cn: string;
  content: string;
  content_cn: string;
  featured_image: string;
  created_at: string;
  slug: string;
  location?: {
    name: string;
    name_cn: string;
    slug: string;
  };
}

interface LatestArticlesProps {
  articles: Article[];
  language: 'en' | 'cn';
}

export default function LatestArticles({ articles, language }: LatestArticlesProps) {
  return (
    <div className="space-y-4">
      {articles.map((article, index) => (
        <Link 
          key={article.id}
          to={`/articles/${article.slug}${location.search}`}
          className="flex bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow group"
        >
          {/* Thumbnail */}
          <div className="w-48 h-32 flex-shrink-0 relative overflow-hidden">
            <img
              src={article.featured_image}
              alt={language === 'en' ? article.title : article.title_cn}
              className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
            />
            {article.location && (
              <div className="absolute top-2 left-2">
                <LocationBadge
                  name={article.location.name}
                  nameCn={article.location.name_cn}
                  language={language}
                />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 p-4">
            <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-red-500 transition-colors">
              {language === 'en' ? article.title : article.title_cn}
            </h3>
            <p className="text-gray-600 text-sm mb-2 line-clamp-2">
              {(language === 'en' ? article.content : article.content_cn)
                .replace(/<[^>]*>/g, '')
                .slice(0, language === 'en' ? 150 : 100)}...
            </p>
            <div className="flex items-center justify-between">
              <time className="text-sm text-gray-500 flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                {new Date(article.created_at).toLocaleDateString()}
              </time>
              <span className="text-red-500 flex items-center text-sm font-medium">
                {language === 'en' ? 'Read More' : '阅读更多'}
                <ArrowRight className="h-4 w-4 ml-1" />
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}