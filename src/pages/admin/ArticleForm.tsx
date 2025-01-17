import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Upload, Save, Loader2, Plus, Eye, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Article, Category, Tag, ArticleFormData } from '../../types/cms';
import Editor from '../../components/Editor';
import MediaModal from '../../components/MediaModal';
import { uploadImage } from '../../lib/supabase';
import toast from 'react-hot-toast';

export default function ArticleForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [savingDraft, setSavingDraft] = useState(false);
  const [locations, setLocations] = useState<Category[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [filteredTags, setFilteredTags] = useState<Tag[]>([]);
  const [publishing, setPublishing] = useState(false);
  const [showTagForm, setShowTagForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [existingFeaturedImage, setExistingFeaturedImage] = useState<string | null>(null);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [newTagData, setNewTagData] = useState({
    name: '',
    name_cn: '',
    slug: ''
  });
  const [formData, setFormData] = useState<ArticleFormData>({
    title: '',
    title_cn: '',
    status: 'draft',
    location_id: '',
    slug: '',
    content: '',
    content_cn: '',
    category_id: '',
    meta_title: '',
    meta_description: '',
    tag_ids: [],
    featured_image_caption: '',
    featured_image_credit: '',
    featured_image_attribution_url: '',
  });

  useEffect(() => {
    loadCategories();
    loadTags();
    loadLocations();
    if (id) {
      loadArticle(id);
    }
  }, [id]);
  
  useEffect(() => {
    filterTagsByCategory(formData.category_id);
  }, [formData.category_id, allTags]);

  const filterTagsByCategory = (categoryId: string) => {
    if (!categoryId) {
      setFilteredTags([]);
      return;
    }

    const categorySlugMap: Record<string, string[]> = {
      food: ['sushi', 'ramen', 'tempura', 'udon', 'yakitori', 'kaiseki', 'izakaya', 'wagyu', 'sashimi', 'donburi'],
      shopping: ['mall', 'market', 'outlet', 'souvenir', 'department-store', 'boutique', 'duty-free', 'electronics'],
      entertainment: ['onsen', 'temple', 'shrine', 'park', 'museum', 'festival', 'garden', 'castle', 'mountain', 'beach']
    };

    const category = categories.find(c => c.id === categoryId);
    if (!category) {
      setFilteredTags([]);
      return;
    }

    const relevantSlugs = categorySlugMap[category.slug.toLowerCase()] || [];
    const relevantTags = allTags.filter(tag => 
      relevantSlugs.some(slug => tag.slug.toLowerCase() === slug.toLowerCase()) ||
      tag.slug.toLowerCase().includes(category.slug.toLowerCase())
    );

    setFilteredTags(relevantTags);
  };

  async function loadLocations() {
    const { data: locationCategory } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', 'location')
      .single();

    if (locationCategory) {
      const { data } = await supabase
        .from('categories')
        .select('*')
        .eq('parent_id', locationCategory.id)
        .order('name');
      setLocations(data || []);
    }
  }

  async function loadCategories() {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .eq('parent_id', (
        await supabase
          .from('categories')
          .select('id')
          .eq('slug', 'activity')
          .single()
      ).data?.id)
      .order('name');
    setCategories(data || []);
  }

  async function loadTags() {
    const { data } = await supabase
      .from('tags')
      .select('*')
      .order('name');
    setAllTags(data || []);
  }

  async function loadArticle(articleId: string) {
    try {
      const { data: articleData, error } = await supabase
        .from('articles')
        .select(`
          *,
          article_tags(tag_id),
          category:categories!articles_category_id_fkey(*),
          location:categories!articles_location_id_fkey(*)
        `)
        .eq('id', articleId)
        .single();

      if (error) {
        console.error('Error loading article:', error);
        toast.error('Failed to load article');
        return;
      }

      if (articleData) {
        setExistingFeaturedImage(articleData.featured_image);
        setFormData({
          title: articleData.title || '',
          title_cn: articleData.title_cn || '',
          slug: articleData.slug || '',
          content: articleData.content || '',
          content_cn: articleData.content_cn || '',
          category_id: articleData.category_id || '',
          location_id: articleData.location_id || '',
          meta_title: articleData.meta_title || '',
          meta_description: articleData.meta_description || '',
          status: articleData.status || 'draft',
          tag_ids: articleData.article_tags?.map(at => at.tag_id) || [],
          featured_image_caption: articleData.featured_image_caption || '',
          featured_image_credit: articleData.featured_image_credit || '',
          featured_image_attribution_url: articleData.featured_image_attribution_url || '',
        });
      }
    } catch (error) {
      console.error('Error loading article:', error);
      toast.error('Failed to load article');
    }
  }

  const handleImageSelect = async (url: string, credit?: string, creditUrl?: string) => {
    try {
      // Update form data with credit info
      setFormData(prev => ({
        ...prev,
        featured_image_credit: credit || '',
        featured_image_attribution_url: creditUrl || ''
      }));
      
      setExistingFeaturedImage(url);
      
      // Add a small delay before closing modal
      setTimeout(() => {
        setShowMediaModal(false);
        toast.success('Featured image updated');
      }, 100);
    } catch (error) {
      console.error('Error updating featured image:', error);
      toast.error('Failed to update featured image');
    }
  };

  const handleSaveDraft = async () => {
    setSavingDraft(true);
    try {
      const updates = {
        ...formData,
        status: 'draft',
        featured_image: existingFeaturedImage,
      };

      if (id) {
        const { error } = await supabase
          .from('articles')
          .update(updates)
          .eq('id', id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('articles')
          .insert(updates);

        if (error) throw error;
      }

      toast.success('Draft saved successfully');
    } catch (error) {
      console.error('Error saving draft:', error);
      toast.error('Failed to save draft');
    } finally {
      setSavingDraft(false);
    }
  };

  const handlePublish = async () => {
    setPublishing(true);
    try {
      // Basic validation
      if (!formData.title || !formData.title_cn || !formData.slug) {
        toast.error('Please fill in all required fields');
        setPublishing(false);
        return;
      }

      // URL validation - only if URL is provided
      if (formData.featured_image_attribution_url && 
          !formData.featured_image_attribution_url.match(/^https?:\/\/.+/)) {
        toast.error('Attribution URL must start with http:// or https://');
        setPublishing(false);
        return;
      }

      // Validate category
      if (!formData.category_id) {
        toast.error('Please select a category');
        setPublishing(false);
        return;
      }

      // Check if slug exists (for new articles)
      if (!id) {
        const { data: existingArticles, error: slugCheckError } = await supabase
          .from('articles')
          .select('id')
          .eq('slug', formData.slug);

        if (slugCheckError) throw slugCheckError;

        if (existingArticles && existingArticles.length > 0) {
          toast.error('An article with this slug already exists. Please choose a different slug.');
          setPublishing(false);
          return;
        }
      }

      const updates = {
        ...formData,
        status: 'published',
        featured_image: existingFeaturedImage,
        published_at: new Date().toISOString(),
      };

      if (id) {
        const { error } = await supabase
          .from('articles')
          .update(updates)
          .eq('id', id);

        if (error) {
          if (error.code === '23505') {
            toast.error('An article with this slug already exists. Please choose a different slug.');
            return;
          }
          throw error;
        }
      } else {
        const { error } = await supabase
          .from('articles')
          .insert(updates);

        if (error) {
          if (error.code === '23505') {
            toast.error('An article with this slug already exists. Please choose a different slug.');
            return;
          }
          throw error;
        }
      }

      toast.success('Article published successfully');
      navigate('/admin/articles');
    } catch (error) {
      console.error('Error publishing article:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to publish article');
    } finally {
      setPublishing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (saving) return;
    setSaving(true);

    try {
      // Basic validation
      if (!formData.title || !formData.title_cn || !formData.slug) {
        toast.error('Please fill in all required fields');
        setSaving(false);
        return;
      }

      // URL validation - only if URL is provided
      if (formData.featured_image_attribution_url && 
          !formData.featured_image_attribution_url.match(/^https?:\/\/.+/)) {
        toast.error('Attribution URL must start with http:// or https://');
        setSaving(false);
        return;
      }

      // Check if slug exists (for new articles)
      if (!id) {
        const { data: existingArticles, error: slugCheckError } = await supabase
          .from('articles')
          .select('id')
          .eq('slug', formData.slug);

        if (slugCheckError) throw slugCheckError;

        if (existingArticles && existingArticles.length > 0) {
          toast.error('An article with this slug already exists. Please choose a different slug.');
          setSaving(false);
          return;
        }
      }

      let savedArticleId = id;
      
      // Clean up empty values to prevent UUID errors
      const cleanFormData = {
        ...formData,
        location_id: formData.location_id || null,
        category_id: formData.category_id || null,
        tag_ids: formData.tag_ids.filter(Boolean),
        featured_image: existingFeaturedImage
      };

      if (id) {
        const { error } = await supabase
          .from('articles')
          .update(cleanFormData)
          .eq('id', id);

        if (error) {
          if (error.code === '23505') {
            toast.error('An article with this slug already exists. Please choose a different slug.');
            return;
          }
          throw error;
        }
      } else {
        const { data: newArticle, error } = await supabase
          .from('articles')
          .insert(cleanFormData)
          .select()
          .single();

        if (error) {
          if (error.code === '23505') {
            toast.error('An article with this slug already exists. Please choose a different slug.');
            return;
          }
          throw error;
        }
        savedArticleId = newArticle.id;
      }

      if (savedArticleId) {
        // Gallery functionality removed
      }

      toast.success('Article saved successfully');
      
      // Add a small delay before navigation to ensure state updates are complete
      await new Promise(resolve => setTimeout(resolve, 100));
      navigate('/admin/articles');
    } catch (error) {
      console.error('Error saving article:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save article');
    } finally {
      setSaving(false);
    }
  };

  // Rest of the component remains the same...

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {id ? 'Edit Article' : 'New Article'}
        </h1>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowPreview(true)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </button>
          <button
            onClick={handleSaveDraft}
            disabled={savingDraft}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            {savingDraft ? (
              <>
                <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Draft
              </>
            )}
          </button>
          <button
            onClick={handlePublish}
            disabled={publishing}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-500 hover:bg-red-600"
          >
            {publishing ? (
              <>
                <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                Publishing...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Publish
              </>
            )}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Title (English)
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Title (Chinese)
                </label>
                <input
                  type="text"
                  value={formData.title_cn}
                  onChange={(e) => setFormData(prev => ({ ...prev, title_cn: e.target.value }))}
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
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Category
                </label>
                <select
                  value={formData.category_id}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, category_id: e.target.value }));
                    filterTagsByCategory(e.target.value);
                  }}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name} ({category.name_cn})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Location
                </label>
                <select
                  value={formData.location_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, location_id: e.target.value }))}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500"
                >
                  <option value="">Select a location</option>
                  {locations.map((location) => (
                    <option key={location.id} value={location.id}>
                      {location.name} ({location.name_cn})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Tags
                </label>
                <div className="mt-1 flex flex-wrap gap-2">
                  {filteredTags.map((tag) => (
                    <label
                      key={tag.id}
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                        formData.tag_ids.includes(tag.id)
                          ? 'bg-red-500 text-white'
                          : 'bg-gray-100 text-gray-700'
                      } cursor-pointer transition-colors`}
                    >
                      <input
                        type="checkbox"
                        className="hidden"
                        checked={formData.tag_ids.includes(tag.id)}
                        onChange={(e) => {
                          setFormData(prev => ({
                            ...prev,
                            tag_ids: e.target.checked
                              ? [...prev.tag_ids, tag.id]
                              : prev.tag_ids.filter(id => id !== tag.id)
                          }));
                        }}
                      />
                      {tag.name} ({tag.name_cn})
                    </label>
                  ))}
                  {formData.category_id && filteredTags.length === 0 && (
                    <p className="text-sm text-gray-500">
                      No relevant tags found for this category
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Meta Title
                </label>
                <input
                  type="text"
                  value={formData.meta_title}
                  onChange={(e) => setFormData(prev => ({ ...prev, meta_title: e.target.value }))}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Meta Description
                </label>
                <textarea
                  value={formData.meta_description}
                  onChange={(e) => setFormData(prev => ({ ...prev, meta_description: e.target.value }))}
                  rows={3}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500"
                />
              </div>
              {/* Existing form fields remain the same */}
              {/* ... */}
            </div>

            {/* Featured Image Section */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Featured Image</h3>
              <div className="space-y-4">
                {existingFeaturedImage && (
                  <div className="relative rounded-lg overflow-hidden">
                    <img
                      src={existingFeaturedImage}
                      alt="Featured"
                      className="w-full h-48 object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setExistingFeaturedImage(null)}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setShowMediaModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  {existingFeaturedImage ? 'Change Featured Image' : 'Add Featured Image'}
                </button>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Image Caption
                    </label>
                    <input
                      type="text"
                      value={formData.featured_image_caption}
                      onChange={(e) => setFormData(prev => ({ ...prev, featured_image_caption: e.target.value }))}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Image Credit
                    </label>
                    <input
                      type="text"
                      value={formData.featured_image_credit}
                      onChange={(e) => setFormData(prev => ({ ...prev, featured_image_credit: e.target.value }))}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Credit URL
                  </label>
                  <input
                    type="url"
                    value={formData.featured_image_attribution_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, featured_image_attribution_url: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500"
                  />
                </div>
              </div>
            </div>

            {/* Content Editors */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Article Content</h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content (English)
                  </label>
                  <Editor
                    content={formData.content}
                    onChange={(content) => setFormData(prev => ({ ...prev, content }))}
                    placeholder="Write your article content in English..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content (Chinese)
                  </label>
                  <Editor
                    content={formData.content_cn}
                    onChange={(content) => setFormData(prev => ({ ...prev, content_cn: content }))}
                    placeholder="用中文写文章内容..."
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/admin/articles')}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-500 hover:bg-red-600"
              >
                {saving ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                    Saving...
                  </>
                ) : (
                  'Save Article'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      <MediaModal
        isOpen={showMediaModal}
        onClose={() => setShowMediaModal(false)}
        onSelect={handleImageSelect}
      />
    </div>
  );
}