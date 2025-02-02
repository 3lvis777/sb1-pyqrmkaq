import React, { useState, useEffect } from 'react';
import { FileText, FolderTree, Tags, LayoutDashboard, Plus, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import type { Article } from '../types/cms';

const stats = [
  {
    label: 'Total Articles',
    labelCn: '文章总数',
    value: '24',
    icon: FileText,
    color: 'bg-blue-500',
  },
  {
    label: 'Categories',
    labelCn: '分类',
    value: '8',
    icon: FolderTree,
    color: 'bg-green-500',
  },
  {
    label: 'Tags',
    labelCn: '标签',
    value: '32',
    icon: Tags,
    color: 'bg-purple-500',
  },
];
export default function Admin() {
  const [recentArticles, setRecentArticles] = useState<Article[]>([]);
  const [loadingArticles, setLoadingArticles] = useState(true);

  useEffect(() => {
    loadRecentArticles();
  }, []);

  async function loadRecentArticles() {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select(`
          *,
          category:categories!articles_category_id_fkey(name)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setRecentArticles(data || []);
    } catch (error) {
      console.error('Error loading recent articles:', error);
      toast.error('Failed to load recent articles');
    } finally {
      setLoadingArticles(false);
    }
  }


  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500">
              Welcome to your content management dashboard
            </p>
          </div>
          <Link
            to="/admin/articles/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-500 hover:bg-red-600"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Article
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white rounded-lg shadow-sm p-6 flex items-center"
            >
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <Icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">
                  {stat.label}
                  <span className="ml-1 text-gray-400">{stat.labelCn}</span>
                </h3>
                <p className="text-2xl font-semibold text-gray-900">
                  {stat.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Articles */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">
              Recent Articles
              {loadingArticles && (
                <Loader2 className="ml-2 h-4 w-4 inline animate-spin text-gray-400" />
              )}
            </h2>
            <Link
              to="/admin/articles" 
              className="text-sm font-medium text-red-500 hover:text-red-600"
            >
              View all
            </Link>
          </div>
        </div>
        <div className="divide-y divide-gray-200">
          {recentArticles.length > 0 ? recentArticles.map((article) => (
            <Link
              key={article.id}
              to={`/admin/articles/${article.id}/edit`}
              className="block p-6 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">
                    {article.title}
                  </h3>
                  <p className="text-sm text-gray-500">{article.titleCn}</p>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {article.category?.name}
                  </span>
                  <p className="mt-1 text-xs text-gray-500">
                    {new Date(article.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </Link>
          )) : (
            <div className="p-6 text-center">
              {loadingArticles ? (
                <Loader2 className="h-8 w-8 mx-auto animate-spin text-gray-400" />
              ) : (
                <p className="text-gray-500">
                  No articles found. Create your first article to get started.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}