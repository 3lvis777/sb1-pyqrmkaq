import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Loader2, Image } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Category } from '../../types/cms';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';
import MediaModal from '../../components/MediaModal';

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    name_cn: '',
    slug: '',
    description: '',
    description_cn: '',
    parent_id: '',
    featured_image_url: '',
  });
  const [editData, setEditData] = useState({
    id: '',
    name: '',
    name_cn: '',
    slug: '',
    description: '',
    description_cn: '',
    parent_id: '',
    featured_image_url: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const handleEdit = (category: Category) => {
    setEditData({
      id: category.id,
      name: category.name,
      name_cn: category.name_cn,
      slug: category.slug,
      description: category.description || '',
      description_cn: category.description_cn || '',
      parent_id: category.parent_id || '',
      featured_image_url: category.featured_image_url || '',
    });
    setShowEditModal(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { error } = await supabase
        .from('categories')
        .update({
          name: editData.name,
          name_cn: editData.name_cn,
          slug: editData.slug,
          description: editData.description,
          description_cn: editData.description_cn,
          parent_id: editData.parent_id || null,
        })
        .eq('id', editData.id);

      if (error) throw error;

      toast.success('Category updated successfully');
      setShowEditModal(false);
      loadCategories();
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error('Failed to update category');
    } finally {
      setSaving(false);
    }
  };

  async function loadCategories() {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      const { error } = await supabase
        .from('categories')
        .insert(formData);

      if (error) throw error;

      toast.success('Category created successfully');
      setShowForm(false);
      setFormData({
        name: '',
        name_cn: '',
        slug: '',
        description: '',
        description_cn: '',
        parent_id: '',
      });
      loadCategories();
    } catch (error) {
      console.error('Error creating category:', error);
      toast.error('Failed to create category');
    } finally {
      setSaving(false);
    }
  }

  const handleFeaturedImageSelect = async (url: string) => {
    if (!selectedCategory) return;
    
    try {
      const { error } = await supabase
        .from('categories')
        .update({ featured_image_url: url })
        .eq('id', selectedCategory);

      if (error) throw error;

      toast.success('Featured image updated successfully');
      loadCategories();
      setShowMediaModal(false);
      setSelectedCategory(null);
    } catch (error) {
      console.error('Error updating featured image:', error);
      toast.error('Failed to update featured image');
    }
  };

  const filteredCategories = categories.filter(
    (category) =>
      category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.name_cn.includes(searchQuery)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-red-500" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-500 hover:bg-red-600"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Category
        </button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">New Category</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Name (English)
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Name (Chinese)
                </label>
                <input
                  type="text"
                  value={formData.name_cn}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name_cn: e.target.value }))
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Slug
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, slug: e.target.value }))
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Parent Category
                </label>
                <select
                  value={formData.parent_id}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      parent_id: e.target.value,
                    }))
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500"
                >
                  <option value="">None</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name} ({category.name_cn})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Description (English)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Description (Chinese)
                </label>
                <textarea
                  value={formData.description_cn}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description_cn: e.target.value,
                    }))
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500"
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-500 hover:bg-red-600 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Edit Category</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Name (English)
                </label>
                <input
                  type="text"
                  value={editData.name}
                  onChange={(e) =>
                    setEditData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Name (Chinese)
                </label>
                <input
                  type="text"
                  value={editData.name_cn}
                  onChange={(e) =>
                    setEditData((prev) => ({ ...prev, name_cn: e.target.value }))
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Slug
                </label>
                <input
                  type="text"
                  value={editData.slug}
                  onChange={(e) =>
                    setEditData((prev) => ({ ...prev, slug: e.target.value }))
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Parent Category
                </label>
                <select
                  value={editData.parent_id}
                  onChange={(e) =>
                    setEditData((prev) => ({
                      ...prev,
                      parent_id: e.target.value,
                    }))
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500"
                >
                  <option value="">None</option>
                  {categories
                    .filter((c) => c.id !== editData.id)
                    .map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name} ({category.name_cn})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Description (English)
                </label>
                <textarea
                  value={editData.description}
                  onChange={(e) =>
                    setEditData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Description (Chinese)
                </label>
                <textarea
                  value={editData.description_cn}
                  onChange={(e) =>
                    setEditData((prev) => ({
                      ...prev,
                      description_cn: e.target.value,
                    }))
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Featured Image
                </label>
                {editData.featured_image_url && (
                  <div className="mt-2 relative">
                    <img
                      src={editData.featured_image_url}
                      alt="Featured"
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setEditData((prev) => ({ ...prev, featured_image_url: '' }))
                      }
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory(editData.id);
                    setShowMediaModal(true);
                  }}
                  className="mt-2 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  {editData.featured_image_url ? 'Change Image' : 'Add Image'}
                </button>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-500 hover:bg-red-600 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Slug
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Parent
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredCategories.map((category) => (
              <tr key={category.id}>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">
                    {category.name}
                  </div>
                  <div className="text-sm text-gray-500">{category.name_cn}</div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {category.slug}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {category.parent_id
                    ? categories.find((c) => c.id === category.parent_id)?.name
                    : '-'}
                </td>
                <td className="px-6 py-4 text-right text-sm font-medium">
                  <button
                    onClick={() => handleEdit(category)}
                    className="text-red-500 hover:text-red-600 inline-flex items-center"
                  >
                    <Edit2 className="h-4 w-4 mr-1" />
                    Edit
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedCategory(category.id);
                      setShowMediaModal(true);
                    }}
                    className="ml-4 text-gray-500 hover:text-gray-600 inline-flex items-center"
                  >
                    <Image className="h-4 w-4 mr-1" />
                    {category.featured_image_url ? 'Change Image' : 'Add Image'}
                  </button>
                  <button className="ml-4 text-gray-500 hover:text-gray-600 inline-flex items-center">
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <MediaModal
        isOpen={showMediaModal}
        onClose={() => {
          setShowMediaModal(false);
          setSelectedCategory(null);
        }}
        onSelect={handleFeaturedImageSelect}
      />
    </div>
  );
}