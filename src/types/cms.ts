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

export type ArticleStatus = 'draft' | 'published';

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
  featured_image_caption: string | null;
  featured_image_credit: string | null;
  featured_image_license: string | null;
  featured_image_attribution_url: string | null;
  meta_title: string | null;
  meta_description: string | null;
  status: 'draft' | 'published';
  status: ArticleStatus;
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
  featured_image_caption: string;
  featured_image_credit: string;
  featured_image_license: string;
  featured_image_attribution_url: string;
  status: 'draft' | 'published';
  meta_title: string;
  meta_description: string;
  featured_image?: File;
  status: 'draft' | 'published';
  tag_ids: string[];
  gallery_images?: File[];
}

export interface MediaFile {
  id: string;
  name: string;
  original_name: string;
  url: string;
  size: number;
  mime_type: string;
  alt_text: string | null;
  credit: string | null;
  credit_url: string | null;
  tags: string[];
  usage_count: number;
  created_at: string;
  updated_at: string;
}

export interface MediaTag {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}