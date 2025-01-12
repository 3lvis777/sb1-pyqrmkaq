import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Upload, Save, Loader2, Plus, Eye } from 'lucide-react';
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
      // Include tags that match the category's relevant slugs
      relevantSlugs.some(slug => tag.slug.toLowerCase() === slug.toLowerCase()) ||
      // Also include any tag that contains the category name
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
      });
      
      // Log successful data loading
      console.log('Article data loaded:', articleData);
    }
  }

  async function handleCreateTag() {
    try {
      // Check if tag already exists
      const { data: existingTag, error: checkError } = await supabase
        .from('tags')
        .select('id')
        .or(`name.eq.${newTagData.name},slug.eq.${newTagData.slug}`)
        .single();

      if (checkError && checkError.code !== 'PGRST116') throw checkError;

      if (existingTag) {
        toast.error('A tag with this name or slug already exists');
        return;
      }

      // Create new tag
      const { data, error } = await supabase
        .from('tags')
        .insert(newTagData)
        .select()
        .single();

      if (error) throw error;

      toast.success('Tag created successfully');
      setShowTagForm(false);
      setNewTagData({ name: '', name_cn: '', slug: '' });
      loadTags();

      // Add the new tag to the selected tags
      if (data) {
        setFormData(prev => ({
          ...prev,
          tag_ids: [...prev.tag_ids, data.id]
        }));
      }
    } catch (error) {
      console.error('Error creating tag:', error);
      toast.error('Failed to create tag');
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingDraft(true);
    try {
      const savedArticle = await saveArticle(false);
      toast.success(id ? 'Changes saved as draft' : 'New draft created');
      if (!id && savedArticle) {
        // Only redirect to edit page if this is a new article
        navigate(`/admin/articles/${savedArticle.id}/edit`);
      }
    } catch (error) {
      console.error('Error saving article:', error);
      toast.error('Failed to save article');
    } finally {
      setSavingDraft(false);
    }
  };

  const handleSavePublished = async () => {
    try {
      setSaving(true);
      const savedArticle = await saveArticle(true, true);
      toast.success('Changes saved successfully');
    } catch (error) {
      console.error('Error saving article:', error);
      toast.error('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    try {
      setPublishing(true);
      const publishedArticle = await saveArticle(true, false);
      toast.success('Article published successfully');
      navigate('/admin/articles');
    } catch (error) {
      console.error('Error publishing article:', error);
      toast.error('Failed to publish article');
    } finally {
      setPublishing(false);
    }
  };

  const handleFeaturedImageSelect = (url: string) => {
    setExistingFeaturedImage(url);
    setShowMediaModal(false);
  };

  async function saveArticle(shouldPublish: boolean = false, keepStatus: boolean = false) {
    try {
      let featuredImageUrl = existingFeaturedImage;
      
      if (formData.featured_image instanceof File) {
        featuredImageUrl = await uploadImage(
          formData.featured_image,
          `articles/${Date.now()}-${formData.featured_image.name}`
        );
      }

      const articleData = {
        title: formData.title,
        title_cn: formData.title_cn,
        status: keepStatus ? formData.status : (shouldPublish ? 'published' : 'draft'),
        slug: formData.slug,
        content: formData.content,
        content_cn: formData.content_cn,
        category_id: formData.category_id,
        location_id: formData.location_id,
        meta_title: formData.meta_title,
        meta_description: formData.meta_description,
        featured_image: featuredImageUrl,
        updated_at: new Date().toISOString()
      };

      if (id) {
        const { data, error } = await supabase
          .from('articles')
          .update(articleData)
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        await handleTags(data.id);
        return data;
      } else {
        const { data, error } = await supabase
          .from('articles')
          .insert(articleData)
          .select()
          .single();

        if (error) throw error;
        await handleTags(data.id);
        return data;
      }
    } catch (error) {
      throw error;
    } finally {
      setSavingDraft(false);
      setPublishing(false);
    }
  }

  async function handleTags(articleId: string) {
    try {
      // Get existing tags
      const { data: existingTags } = await supabase
        .from('article_tags')
        .select('tag_id')
        .eq('article_id', articleId);

      const existingTagIds = new Set(existingTags?.map(t => t.tag_id) || []);
      const newTagIds = new Set(formData.tag_ids);

      // Tags to remove (in existing but not in new)
      const tagsToRemove = [...existingTagIds].filter(id => !newTagIds.has(id));
      
      // Tags to add (in new but not in existing)
      const tagsToAdd = [...newTagIds].filter(id => !existingTagIds.has(id));

      // Remove old tags
      if (tagsToRemove.length > 0) {
        const { error: deleteError } = await supabase
          .from('article_tags')
          .delete()
          .eq('article_id', articleId)
          .in('tag_id', tagsToRemove);

        if (deleteError) throw deleteError;
      }

      // Add new tags
      if (formData.tag_ids.length > 0) {
        const { error: insertError } = await supabase
          .from('article_tags')
          .insert(
            tagsToAdd.map(tagId => ({
              article_id: articleId,
              tag_id: tagId
            }))
          );

        if (insertError) {
          throw insertError;
        }
      }
    } catch (error) {
      throw error;
    }
  }

  // Rest of the component remains the same...

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center justify-between">
          <span>{id ? 'Edit Article' : 'New Article'}</span>
          {id && (
            <span className={`text-sm px-3 py-1 rounded-full ${
              formData.status === 'published' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {formData.status === 'published' ? 'Published' : 'Draft'}
            </span>
          )}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Title (English)
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
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
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title_cn: e.target.value }))
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
                Location
              </label>
              <select
                value={formData.location_id}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    location_id: e.target.value,
                  }))
                }
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500"
                required
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
                Category
              </label>
              <select
                value={formData.category_id}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    category_id: e.target.value,
                  }))
                }
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
                Tags
              </label>
              <div className="mt-1 flex items-center space-x-2">
                <select
                  multiple
                  value={formData.tag_ids}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      tag_ids: Array.from(
                        e.target.selectedOptions,
                        (option) => option.value
                      ),
                    }))
                  }
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500"
                >
                  {filteredTags.map((tag) => (
                    <option key={tag.id} value={tag.id}>
                      {tag.name} ({tag.name_cn})
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShowTagForm(true)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Featured Image
                {existingFeaturedImage && (
                  <button
                    type="button"
                    onClick={() => setExistingFeaturedImage(null)}
                    className="ml-2 text-sm text-red-500 hover:text-red-600"
                  >
                    Remove image
                  </button>
                )}
              </label>
              <div className="mt-2 mb-4">
                {existingFeaturedImage ? (
                  <img
                    src={existingFeaturedImage}
                    alt="Featured"
                    className="w-full max-w-md h-48 object-cover rounded-lg shadow-sm"
                  />
                ) : (
                  <div 
                    onClick={() => setShowMediaModal(true)}
                    className="w-full max-w-md h-48 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-red-500 transition-colors"
                  >
                    <div className="text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <p className="mt-1 text-sm text-gray-500">Click to select an image</p>
                    </div>
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => setShowMediaModal(true)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <Upload className="h-4 w-4 mr-2" />
                {existingFeaturedImage ? 'Change Image' : 'Select Image'}
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Content (English)
              </label>
              <Editor
                content={formData.content}
                onChange={(content) =>
                  setFormData((prev) => ({ ...prev, content }))
                }
                placeholder="Write your article content in English..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Content (Chinese)
              </label>
              <Editor
                content={formData.content_cn}
                onChange={(content) =>
                  setFormData((prev) => ({ ...prev, content_cn: content }))
                }
                placeholder="用中文写文章内容..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Meta Title
              </label>
              <input
                type="text"
                value={formData.meta_title}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    meta_title: e.target.value,
                  }))
                }
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Meta Description
              </label>
              <textarea
                value={formData.meta_description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    meta_description: e.target.value,
                  }))
                }
                rows={3}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="submit"
              disabled={savingDraft || publishing}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              {savingDraft ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4 inline" />
                  Saving...
                </>
              ) : (
                'Save as Draft'
              )}
            </button>
            <button
              type="button"
              disabled={savingDraft || publishing}
              onClick={() => setShowPreview(true)}
              name="preview"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </button>
            {formData.status === 'published' && (
              <button
                type="button"
                disabled={saving || publishing || savingDraft}
                onClick={handleSavePublished}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            )}
            {formData.status === 'draft' && (
              <button
                type="button"
                disabled={publishing || savingDraft}
                onClick={handlePublish}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-500 hover:bg-green-600"
              >
                {publishing ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                    Publishing...
                  </>
                ) : (
                  'Publish'
                )}
              </button>
            )}
            <button
              type="button"
              disabled={savingDraft || publishing}
              onClick={() => navigate('/admin/articles')}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
      <MediaModal
        isOpen={showMediaModal}
        onClose={() => setShowMediaModal(false)}
        onSelect={handleFeaturedImageSelect}
      />
    </div>
  );
}