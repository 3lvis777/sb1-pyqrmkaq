/*
  # CMS Tables Setup

  1. New Tables
    - `articles`
      - Core article content and metadata
    - `categories`
      - Hierarchical category structure
    - `tags`
      - Article tags
    - `article_tags`
      - Many-to-many relationship between articles and tags
    - `article_images`
      - Image gallery for articles

  2. Security
    - Enable RLS on all tables
    - Add policies for admin access
*/

-- Create categories table
CREATE TABLE categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id uuid REFERENCES categories(id),
  name text NOT NULL,
  name_cn text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  description_cn text,
  meta_title text,
  meta_description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create tags table
CREATE TABLE tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  name_cn text NOT NULL,
  slug text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);

-- Create articles table
CREATE TABLE articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES categories(id),
  title text NOT NULL,
  title_cn text NOT NULL,
  slug text NOT NULL UNIQUE,
  content text NOT NULL,
  content_cn text NOT NULL,
  featured_image text,
  meta_title text,
  meta_description text,
  published boolean DEFAULT false,
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create article_tags junction table
CREATE TABLE article_tags (
  article_id uuid REFERENCES articles(id) ON DELETE CASCADE,
  tag_id uuid REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (article_id, tag_id)
);

-- Create article_images table
CREATE TABLE article_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id uuid REFERENCES articles(id) ON DELETE CASCADE,
  url text NOT NULL,
  alt_text text,
  alt_text_cn text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_images ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Public can read published articles"
  ON articles FOR SELECT
  TO public
  USING (published = true);

CREATE POLICY "Public can read categories"
  ON categories FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public can read tags"
  ON tags FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public can read article tags"
  ON article_tags FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public can read article images"
  ON article_images FOR SELECT
  TO public
  USING (true);

-- Create policies for admin access
CREATE POLICY "Admins can manage articles"
  ON articles FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.is_admin = true
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.is_admin = true
  ));

CREATE POLICY "Admins can manage categories"
  ON categories FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.is_admin = true
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.is_admin = true
  ));

CREATE POLICY "Admins can manage tags"
  ON tags FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.is_admin = true
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.is_admin = true
  ));

CREATE POLICY "Admins can manage article tags"
  ON article_tags FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.is_admin = true
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.is_admin = true
  ));

CREATE POLICY "Admins can manage article images"
  ON article_images FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.is_admin = true
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.is_admin = true
  ));