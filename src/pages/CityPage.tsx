import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { MapPin, ArrowRight } from 'lucide-react';
import LanguageToggle from '../components/LanguageToggle';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface Category {
  id: string;
  name: string;
  name_cn: string;
  slug: string;
}

interface Article {
  id: string;
  category_id: string;
  category: Category;
  title: string;
  title_cn: string;
  content: string;
  content_cn: string;
  featured_image: string;
  created_at: string;
  slug: string;
}

export default function CityPage() {
  const { cityId } = useParams<{ cityId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState<'en' | 'cn'>(
    searchParams.get('lang') === 'en' ? 'en' : 'cn'
  );
  const [cityData, setCityData] = useState<{
    name: string;
    name_cn: string;
    description: string;
    description_cn: string;
    hero_image_url: string;
  } | null>(null);

  useEffect(() => {
    loadData();
  }, [cityId]);

  useEffect(() => {
    const newLang = searchParams.get('lang');
    if (newLang === 'cn' || newLang === 'en') {
      setLanguage(newLang);
    }
  }, [location.search]);

  const handleLanguageChange = (newLanguage: 'en' | 'cn') => {
    setLanguage(newLanguage);
    const params = new URLSearchParams(location.search);
    params.set('lang', newLanguage);
    navigate(`${location.pathname}?${params.toString()}`, { replace: true });
  };

  async function loadData() {
    try {
      setLoading(true);
      
      const { data: cityData, error } = await supabase
        .from('categories')
        .select(`
          id,
          name,
          name_cn,
          description,
          hero_image_url,
          introduction,
          introduction_cn
        `)
        .eq('slug', cityId)
        .single();
      
      if (error) {
        console.error('Error loading city data:', error);
        setLoading(false);
        return;
      }

      if (cityData) {
        setCityData({
          name: cityData.name,
          name_cn: cityData.name_cn,
          description: cityData.introduction || cityData.description,
          description_cn: cityData.introduction_cn || cityData.description_cn,
          hero_image_url: cityData.hero_image_url
        });

        // Load articles after we have the city ID
        const { data: cityArticles, error: articlesError } = await supabase
          .from('articles')
          .select(`
            *,
            category:categories!articles_category_id_fkey(*),
            location:categories!articles_location_id_fkey(*),
            article_tags(tag:tags(*))
          `)
          .eq('location_id', cityData.id)
          .eq('status', 'published')
          .order('created_at', { ascending: false });

        if (articlesError) {
          console.error('Error loading articles:', articlesError);
          return;
        }

        if (cityArticles) {
          setArticles(cityArticles);
        }

        // Load categories
        const { data: activityCategory } = await supabase
          .from('categories')
          .select('id')
          .eq('slug', 'activity')
          .single();

        if (!activityCategory) return;

        const { data: activityCategories, error: categoriesError } = await supabase
          .from('categories')
          .select('*')
          .eq('parent_id', activityCategory.id);

        if (categoriesError) {
          console.error('Error loading categories:', categoriesError);
          return;
        }

        if (activityCategories) {
          setCategories(activityCategories);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredArticles = selectedCategory
    ? articles.filter((article) => article.category_id === selectedCategory)
    : articles;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (!cityData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">City not found</h1>
          <p className="text-gray-600">The city you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-[40vh] overflow-hidden">
        <img
          src={cityData.hero_image_url}
          alt={language === 'en' ? cityData.name : cityData.name_cn}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center text-white">
                <MapPin className="h-6 w-6 mr-2" />
                <h1 className="text-4xl font-bold">
                  {language === 'en' ? cityData.name : cityData.name_cn}
                </h1>
              </div>
              <LanguageToggle language={language} onChange={handleLanguageChange} />
            </div>
            <p className="text-xl max-w-3xl text-white/90">
              {language === 'en' ? cityData.description : cityData.description_cn}
            </p>
          </div>
        </div>
      </div>

      {/* Category Filters */}
      <div className="sticky top-0 bg-white shadow-sm z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-2 py-4 overflow-x-auto">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === null
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {language === 'en' ? 'All' : '全部'}
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id || null)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {language === 'en' ? category.name : category.name_cn}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Articles Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((article) => (
            <article
              key={article.id}
              className="bg-white rounded-lg shadow-sm overflow-hidden group cursor-pointer"
            >
              <div className="aspect-w-16 aspect-h-9 relative overflow-hidden">
                <img
                  src={article.featured_image || 'https://via.placeholder.com/800x600'}
                  alt={article.title}
                  className="w-full h-48 object-cover transform group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 bg-red-500 text-white text-sm font-medium rounded-full">
                    {article.category?.name_cn}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-red-500 transition-colors">
                  <Link 
                    to={`/articles/${article.slug}?lang=${language}`} 
                    className="hover:text-red-600"
                  >
                    {language === 'en' ? article.title : article.title_cn}
                  </Link>
                </h3>
                <p className="text-sm text-gray-500">
                  {language === 'en' ? article.content : article.content_cn}
                </p>
                <time className="block mt-4 text-sm text-gray-400">
                  {new Date(article.created_at).toLocaleDateString()}
                </time>
                <Link
                  to={`/articles/${article.slug}?lang=${language}`}
                  className="inline-flex items-center mt-4 text-red-600 hover:text-red-700"
                >
                  {language === 'en' ? 'Read More' : '阅读更多'}
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}