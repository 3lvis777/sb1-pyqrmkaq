import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Eye, Check, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import type { Article, ArticleStatus } from '../../types/cms';

export default function Articles() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ArticleStatus | 'all'>('all');
  const [selectedArticles, setSelectedArticles] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);

  useEffect(() => {
    loadArticles();
  }, []);

  // Clear selections when tab changes
  useEffect(() => {
    setSelectedArticles([]);
  }, [activeTab]);

  const handleSelectAll = () => {
    if (selectedArticles.length === filteredArticles.length) {
      setSelectedArticles([]);
    } else {
      setSelectedArticles(filteredArticles.map(article => article.id));
    }
  };

  const handleSelectArticle = (articleId: string) => {
    setSelectedArticles(prev => 
      prev.includes(articleId) 
        ? prev.filter(id => id !== articleId)
        : [...prev, articleId]
    );
  };

  const handleBulkDelete = async () => {
    if (selectedArticles.length === 0) return;

    const confirmed = window.confirm(`Are you sure you want to delete ${selectedArticles.length} articles?`);
    if (!confirmed) return;

    try {
      // Delete article tags first
      const { error: tagsError } = await supabase
        .from('article_tags')
        .delete()
        .in('article_id', selectedArticles);

      if (tagsError) throw tagsError;

      // Then delete the articles
      const { error } = await supabase
        .from('articles')
        .delete()
        .in('id', selectedArticles);

      if (error) throw error;

      toast.success(`${selectedArticles.length} articles deleted successfully`);
      setArticles(prevArticles => 
        prevArticles.filter(article => !selectedArticles.includes(article.id))
      );
      setSelectedArticles([]);
    } catch (error) {
      console.error('Error deleting articles:', error);
      toast.error('Failed to delete articles');
    }
  };

  async function handleDelete(articleId: string) {
    const confirmed = window.confirm('Are you sure you want to delete this article?');
    if (!confirmed) return;

    if (!articleId) {
      toast.error('Invalid article ID');
      return;
    }

    setDeleting(articleId);
    try {
      // Delete article tags first
      const { error: tagsError } = await supabase
        .from('article_tags')
        .delete()
        .eq('article_id', articleId);

      if (tagsError) throw tagsError;

      // Then delete the article
      const { error } = await supabase
        .from('articles')
        .delete()
        .eq('id', articleId);

      if (error) throw error;

      toast.success('Article deleted successfully');
      setArticles((prevArticles) => prevArticles.filter(article => article.id !== articleId));
    } catch (error) {
      console.error('Error deleting article:', error);
      toast.error('Failed to delete article');
    } finally {
      setDeleting(null);
    }
  }

  async function loadArticles() {
    try {
      const { data, error } = await supabase
        .from('articles') 
        .select('*, category:categories!articles_category_id_fkey(name, name_cn), location:categories!articles_location_id_fkey(name, name_cn)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setArticles(data || []);
    } catch (error) {
      console.error('Error loading articles:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredArticles = articles.filter(
    (article) =>
      (article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.title_cn.includes(searchQuery)) &&
      (activeTab === 'all' || article.status === activeTab)
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Articles</h1>
        <div className="flex items-center space-x-4">
          {selectedArticles.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setShowBulkActions(!showBulkActions)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Bulk Actions ({selectedArticles.length})
                <ChevronDown className="ml-2 h-4 w-4" />
              </button>
              
              {showBulkActions && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border">
                  <button
                    onClick={handleBulkDelete}
                    className="w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-gray-50"
                  >
                    Delete Selected
                  </button>
                </div>
              )}
            </div>
          )}
          <Link
            to="/admin/articles/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-500 hover:bg-red-600"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Article
          </Link>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center space-x-4 mb-4">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              activeTab === 'all'
                ? 'bg-red-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All ({articles.length})
          </button>
          <button
            onClick={() => setActiveTab('draft')}
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              activeTab === 'draft'
                ? 'bg-red-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Drafts ({articles.filter(a => a.status === 'draft').length})
          </button>
          <button
            onClick={() => setActiveTab('published')}
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              activeTab === 'published'
                ? 'bg-red-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Published ({articles.filter(a => a.status === 'published').length})
          </button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="pl-6 pr-3 py-3 text-left">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-red-500 border-gray-300 rounded focus:ring-red-500"
                    checked={selectedArticles.length === filteredArticles.length && filteredArticles.length > 0}
                    onChange={handleSelectAll}
                  />
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredArticles.map((article) => (
              <tr 
                key={article.id}
                className={`${
                  selectedArticles.includes(article.id) ? 'bg-red-50' : ''
                } hover:bg-gray-50 transition-colors`}
              >
                <td className="pl-6 pr-3 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-red-500 border-gray-300 rounded focus:ring-red-500"
                      checked={selectedArticles.includes(article.id)}
                      onChange={() => handleSelectArticle(article.id)}
                    />
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">
                    {article.title}
                  </div>
                  <div className="text-sm text-gray-500">{article.title_cn}</div>
                </td>
                <td className="px-6 py-4">
                  <div>
                    <div className="text-sm text-gray-900">
                      {article.category?.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {article.category?.name_cn}
                    </div>
                    <div className="mt-1 text-xs text-gray-400">
                      {article.location?.name} ({article.location?.name_cn})
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      article.status === 'published'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {article.status === 'published' ? 'Published' : 'Draft'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(article.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right text-sm font-medium">
                  <Link
                    to={`/articles/${article.slug}?preview=true`}
                    target="_blank"
                    className="text-gray-500 hover:text-gray-600 inline-flex items-center mr-4"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Preview
                  </Link>
                  <Link
                    to={`/admin/articles/${article.id}/edit`}
                    className="text-red-500 hover:text-red-600 inline-flex items-center"
                  >
                    <Edit2 className="h-4 w-4 mr-1" />
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(article.id)}
                    disabled={deleting === article.id}
                    className="ml-4 text-gray-500 hover:text-gray-600 inline-flex items-center"
                  >
                    <Trash2 className={`h-4 w-4 mr-1 ${deleting === article.id ? 'animate-spin' : ''}`} />
                    {deleting === article.id ? 'Deleting...' : 'Delete'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}