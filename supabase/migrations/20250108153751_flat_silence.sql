/*
  # Add RLS Policies for CMS Tables

  This migration adds Row Level Security (RLS) policies for the CMS tables.

  1. Security
    - Add policies for public read access to published content
    - Add policies for admin write access to all content
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public can read published articles" ON articles;
DROP POLICY IF EXISTS "Public can read categories" ON categories;
DROP POLICY IF EXISTS "Public can read tags" ON tags;
DROP POLICY IF EXISTS "Public can read article tags" ON article_tags;
DROP POLICY IF EXISTS "Public can read article images" ON article_images;
DROP POLICY IF EXISTS "Admins can manage articles" ON articles;
DROP POLICY IF EXISTS "Admins can manage categories" ON categories;
DROP POLICY IF EXISTS "Admins can manage tags" ON tags;
DROP POLICY IF EXISTS "Admins can manage article tags" ON article_tags;
DROP POLICY IF EXISTS "Admins can manage article images" ON article_images;

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