export interface Category {
  id: string;
  parent_id: string | null;
  name: string;
  name_cn: string;
  slug: string;
  description: string | null;
  description_cn: string | null;
  meta_title: string | null;
  meta_description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Tag {
  id: string;
  name: string;
  name_cn: string;
  slug: string;
  created_at: string;
}

export interface Article {
  id: string;
  category_id: string;
  location_id: string | null;
  title: string;
  title_cn: string;
  slug: string;
  content: string;
  content_cn: string;
  featured_image: string | null;
  meta_title: string | null;
  meta_description: string | null;
  status: 'draft' | 'published';
  status: 'draft' | 'published';
  published_at: string | null;
  created_at: string;
  updated_at: string;
  category?: Category;
  tags?: Tag[];
  images?: ArticleImage[];
}

export interface ArticleImage {
  id: string;
  article_id: string;
  url: string;
  alt_text: string | null;
  alt_text_cn: string | null;
  sort_order: number;
  created_at: string;
}

export interface ArticleFormData {
  title: string;
  title_cn: string;
  location_id: string;
  slug: string;
  content: string;
  content_cn: string;
  category_id: string;
  status: 'draft' | 'published';
  meta_title: string;
  meta_description: string;
  featured_image?: File;
  status: 'draft' | 'published';
  tag_ids: string[];
  gallery_images?: File[];
}