import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { Calendar, Filter, ArrowRight, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import LanguageToggle from '../components/LanguageToggle';
import LocationBadge from '../components/LocationBadge';
import type { Article } from '../types/cms';

interface CategoryData {
  id: string;
  name: string;
  name_cn: string;
  description: string;
  description_cn: string;
  featured_image_url: string;
}

export default function CategoryPage() {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const [articles, setArticles] = useState<Article[]>([]);
  const [category, setCategory] = useState<CategoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [dateFilter, setDateFilter] = useState<'all' | 'week' | 'month' | 'year'>('all');
  const ITEMS_PER_PAGE = 12;
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [language, setLanguage] = useState<'en' | 'cn'>('en');

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (categorySlug) {
      if (categorySlug !== 'all') {
        loadCategory();
      } else {
        setCategory({
          id: 'all',
          name: 'All Articles',
          name_cn: '所有文章',
          description: 'Browse all our articles about Japan',
          description_cn: '浏览所有关于日本的文章',
          featured_image_url: 'https://images.unsplash.com/photo-1480796927426-f609979314bd?auto=format&fit=crop&w=2000'
        });
        setLoading(false);
      }
      loadArticles();
    }
  }, [categorySlug, page, dateFilter, selectedTags]);
  
  const handleLanguageChange = (newLanguage: 'en' | 'cn') => {
    setLanguage(newLanguage);
    const params = new URLSearchParams(location.search);
    params.set('lang', newLanguage);
    navigate(`${location.pathname}?${params.toString()}`, { replace: true });
  };

  async function loadCategory() {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', categorySlug)
        .single();

      if (error) throw error;
      setCategory(data);
    } catch (error) {
      console.error('Error loading category:', error);
    }
  }

  async function loadArticles() {
    try {
      let query = supabase
        .from('articles')
        .select(`
          id, 
          title,
          title_cn,
          content,
          content_cn,
          featured_image,
          created_at,
          slug,
          category:categories!articles_category_id_fkey(id, name, name_cn),
          location:categories!articles_location_id_fkey(id, name, name_cn, slug),
          article_tags(tag:tags(*))
        `)
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      // Only filter by category if not viewing all articles
      if (categorySlug && categorySlug !== 'all') {
        const { data: categoryData } = await supabase
          .from('categories')
          .select('id')
          .eq('slug', categorySlug)
          .single();

        if (categoryData?.id) {
          query = query.eq('category_id', categoryData.id);
        }
      }

      // Apply pagination
      query = query.range((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE - 1);
      query = query.select(`
          id, 
          title,
          title_cn,
          content,
          content_cn,
          featured_image,
          created_at,
          slug,
          category:categories!articles_category_id_fkey(id, name, name_cn),
          location:categories!articles_location_id_fkey(id, name, name_cn, slug),
          article_tags(tag:tags(*))
        `)
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .range((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE - 1);

      // Apply date filter
      if (dateFilter !== 'all') {
        const now = new Date();
        let startDate = new Date();
        
        switch (dateFilter) {
          case 'week':
            startDate.setDate(now.getDate() - 7);
            break;
          case 'month':
            startDate.setMonth(now.getMonth() - 1);
            break;
          case 'year':
            startDate.setFullYear(now.getFullYear() - 1);
            break;
        }
        
        query = query.gte('created_at', startDate.toISOString());
      }

      // Apply tag filters if any are selected
      if (selectedTags.length > 0) {
        const { data: tagIds } = await supabase
          .from('tags')
          .select('id')
          .in('slug', selectedTags);

        if (tagIds) {
          const { data: articleIds } = await supabase
            .from('article_tags')
            .select('article_id')
            .in('tag_id', tagIds.map(t => t.id));

          if (articleIds) {
            query = query.in('id', articleIds.map(a => a.article_id));
          }
        }
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error loading articles:', error);
        setArticles([]);
        setHasMore(false);
        return;
      }

      if (data) {
        const uniqueArticles = Array.from(new Map(data.map(article => [article.id, article])).values());

        if (page === 1) {
          setArticles(uniqueArticles);
        } else {
          setArticles(prev => [...prev, ...uniqueArticles]);
        }
        setHasMore(uniqueArticles.length === ITEMS_PER_PAGE);
      }
    } catch (error) {
      console.error('Unexpected error loading articles:', error);
      setArticles([]);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }

  if (loading && page === 1) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-red-500" />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Category not found</h1>
          <p className="text-gray-600">The category you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const allTags = Array.from(
    new Set(
      articles.flatMap(article => 
        article.article_tags?.map(({ tag }) => ({
          id: tag.id,
          name: tag.name,
          name_cn: tag.name_cn,
          slug: tag.slug
        })) || []
      )
    )
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-[30vh] overflow-hidden">
        <img
          src={category.featured_image_url || 'https://images.unsplash.com/photo-1480796927426-f609979314bd?auto=format&fit=crop&w=2000'}
          alt={category.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl font-bold text-white mb-2">
              {category.name}
              <span className="ml-3 text-2xl text-white/90">{category.name_cn}</span>
            </h1>
            <p className="text-xl text-white/90 max-w-3xl">
              {category.description}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <Filter className="h-5 w-5 mr-2" />
                Filters
              </button>
              <div className="ml-4">
                <LanguageToggle language={language} onChange={handleLanguageChange} />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center space-x-4 shrink-0">
              <select
                value={dateFilter}
                onChange={(e) => {
                  setDateFilter(e.target.value as typeof dateFilter);
                  setPage(1);
                }}
                className="border border-gray-300 rounded-md text-sm py-1 px-2 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="all">All Time</option>
                <option value="week">Past Week</option>
                <option value="month">Past Month</option>
                <option value="year">Past Year</option>
              </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Articles Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <article
              key={article.id}
              className="bg-white rounded-lg shadow-sm overflow-hidden group hover:shadow-md transition-shadow"
            >
              <Link to={`/articles/${article.slug}`}>
                <div className="aspect-w-16 aspect-h-9 relative overflow-hidden">
                  <img
                    src={article.featured_image || 'https://via.placeholder.com/800x600'}
                    alt={language === 'en' ? article.title : article.title_cn}
                    className="w-full h-48 object-cover transform group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4">
                    {article.location && (
                      <LocationBadge
                        name={article.location?.name || ''}
                        nameCn={article.location?.name_cn || ''}
                        language={language}
                        onClick={(e) => {
                          e.preventDefault();
                          if (article.location?.slug) {
                            navigate(`/city/${article.location.slug}`);
                          }
                        }}
                      />
                    )}
                  </div>
                  <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
                    {article.article_tags?.map(({ tag }) => (
                      <span
                        key={`${article.id}-${tag.id}`}
                        className={`px-3 py-1 backdrop-blur-sm text-sm font-medium rounded-full shadow-sm transition-colors ${
                          selectedTags.includes(tag.slug)
                            ? 'bg-red-500/90 text-white'
                            : 'bg-red-100/90 text-red-800 hover:bg-red-200/90'
                        }`}
                        onClick={(e) => {
                          e.preventDefault();
                          setSelectedTags(prev => 
                            prev.includes(tag.slug)
                              ? prev.filter(t => t !== tag.slug)
                              : [...prev, tag.slug]
                          );
                          setPage(1);
                        }}
                      >
                        {language === 'en' ? tag.name : tag.name_cn}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-red-500 transition-colors duration-300">
                    {language === 'en' ? article.title : article.title_cn}
                  </h2>
                  <p className="text-gray-600 mb-4 line-clamp-3">
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
            </article>
          ))}
        </div>

        {/* Load More */}
        {hasMore && (
          <div className="mt-12 text-center">
            <button
              onClick={() => setPage(p => p + 1)}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                  Loading...
                </>
              ) : (
                'Load More Articles'
              )}
            </button>
          </div>
        )}

        {/* No Articles */}
        {articles.length === 0 && !loading && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900">No articles found</h3>
            <p className="mt-1 text-gray-500">Try adjusting your filters or check back later.</p>
          </div>
        )}
      </div>
    </div>
  );
}