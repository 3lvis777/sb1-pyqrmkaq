/*
  # Add detailed city information

  1. New Tables
    - `city_details`
      - `id` (text, primary key, references cities.id)
      - `hero_image_url` (text)
      - `introduction` (text)
      - `introduction_cn` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `city_details` table
    - Add policy for public read access
    - Add policy for admin write access
*/

CREATE TABLE IF NOT EXISTS city_details (
  id text PRIMARY KEY REFERENCES cities(id) ON DELETE CASCADE,
  hero_image_url text NOT NULL,
  introduction text NOT NULL,
  introduction_cn text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE city_details ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access for city details"
  ON city_details
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow admin write access for city details"
  ON city_details
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND is_admin = true
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND is_admin = true
  ));