import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Tag } from 'lucide-react';
import LanguageToggle from "../components/LanguageToggle";
import { marked } from "marked";
import { supabase } from "../lib/supabase";
import type { Article } from '../types/cms';
import { useAuth } from '../contexts/AuthContext';

// Configure marked options
marked.use({
  breaks: true,
  gfm: true,
  headerIds: true,
});

export default function ArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const isPreview = new URLSearchParams(location.search).get('preview') === 'true';
  const [language, setLanguage] = useState<'en' | 'cn'>(
    new URLSearchParams(location.search).get('lang') === 'en' ? 'en' : 'cn'
  );
  
  // Scroll to top when article loads
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [article]);

  useEffect(() => {
    loadArticle();
  }, [slug]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const langParam = params.get('lang');
    if (langParam === 'cn' || langParam === 'en') {
      setLanguage(langParam);
    }
  }, [location.search]);

  const handleLanguageChange = (newLanguage: 'en' | 'cn') => {
    setLanguage(newLanguage);
    const params = new URLSearchParams(location.search);
    params.set('lang', newLanguage);
    navigate(`${location.pathname}?${params.toString()}`, { replace: true });
  };

  async function loadArticle() {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select(`
          *,
          category:categories!articles_category_id_fkey(name, name_cn),
          location:categories!articles_location_id_fkey(name, name_cn),
          article_tags(tag:tags(*))
        `)
        .eq('slug', slug)
        .eq('status', isPreview ? 'draft' : 'published')
        .single();

      if (error) throw error;
      setArticle(data);

      // Redirect if trying to preview draft without permission
      if (isPreview && data?.status === 'draft' && !user?.id) {
        navigate('/login');
      }
    } catch (error) {
      console.error('Error loading article:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Article not found</h1>
          <p className="text-gray-600">The article you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Hero Image Section */}
      {article.featured_image && (
        <div className="relative w-full h-[100vh]">
          <img
            src={article.featured_image}
            alt={language === 'en' ? article.title : article.title_cn}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
          
          <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-6 lg:px-8 pb-12">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center space-x-4 mb-4">
                <span className="px-3 py-1 bg-red-500 text-white text-sm font-medium rounded-full">
                  {language === 'en' ? article.category?.name : article.category?.name_cn}
                </span>
                <span className="text-white/80">·</span>
                <div className="flex items-center text-white/80">
                  <Calendar className="h-4 w-4 mr-1" />
                  {new Date(article.created_at).toLocaleDateString()}
                </div>
                <div className="flex-1" />
                <LanguageToggle language={language} onChange={handleLanguageChange} />
              </div>

              <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 leading-tight">
                {language === 'en' ? article.title : article.title_cn}
              </h1>

              {article.location && (
                <div className="flex items-center text-white/90 mb-4">
                  <MapPin className="h-5 w-5 mr-2" />
                  <span>
                    {language === 'en' ? article.location.name : article.location.name_cn}
                  </span>
                </div>
              )}

              {article.featured_image_caption && (
                <p className="text-white/80 text-sm mt-4">
                  {article.featured_image_caption}
                </p>
              )}
              {article.featured_image_credit && (
                <p className="text-white/60 text-sm">
                  Image Credits:{' '}
                  {article.featured_image_attribution_url ? (
                    <a
                      href={article.featured_image_attribution_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white/80 hover:text-white transition-colors underline decoration-dotted"
                    >
                      {article.featured_image_credit}
                    </a>
                  ) : (
                    <span>{article.featured_image_credit}</span>
                  )}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Article Content */}
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-xl p-8">
          {article.article_tags && article.article_tags.length > 0 && (
            <div className="flex items-center flex-wrap gap-2">
              <Tag className="h-4 w-4 text-gray-400" />
              {article.article_tags.map(({ tag }) => (
                <span
                  key={tag.id}
                  className="px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded-md"
                >
                  {tag.name}
                  <span className="ml-1 text-gray-500">{tag.name_cn}</span>
                </span>
              ))}
            </div>
          )}

          {/* Article Body */}
          <div 
            className="markdown-content text-gray-800 mb-6"
            dangerouslySetInnerHTML={{
              __html: marked(language === 'en' ? article.content : article.content_cn)
            }}
          >
          </div>

          {/* Article Footer */}
          <div className="border-t pt-6">
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div>
                Category: {language === 'en' ? article.category?.name : article.category?.name_cn}
              </div>
              {article.updated_at && (
                <div>
                  Last updated: {new Date(article.updated_at).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}