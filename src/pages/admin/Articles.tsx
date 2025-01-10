import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import type { Article } from '../../types/cms';

export default function Articles() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'published'>('all');

  useEffect(() => {
    loadArticles();
  }, []);

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
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.title_cn.includes(searchQuery) &&
      (statusFilter === 'all' || article.status === statusFilter)
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Articles</h1>
        <Link
          to="/admin/articles/new"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-500 hover:bg-red-600"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Article
        </Link>
      </div>

      <div className="mb-6">
        <div className="flex items-center space-x-4 mb-4">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              statusFilter === 'all'
                ? 'bg-red-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setStatusFilter('draft')}
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              statusFilter === 'draft'
                ? 'bg-red-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Drafts
          </button>
          <button
            onClick={() => setStatusFilter('published')}
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              statusFilter === 'published'
                ? 'bg-red-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Published
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
              <tr key={article.id}>
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