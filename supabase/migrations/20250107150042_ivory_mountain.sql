/*
  # Initial schema setup for Japan Travel Guide

  1. New Tables
    - `locations`
      - Stores all location data including attractions, restaurants, etc.
      - Includes bilingual names and descriptions
      - Contains metadata like category, city, rating
    - `cities`
      - Stores main city information
      - Includes bilingual names and descriptions

  2. Security
    - Enable RLS on all tables
    - Public read access for locations and cities
    - Admin write access for all tables
*/

-- Create cities table
CREATE TABLE IF NOT EXISTS cities (
  id text PRIMARY KEY,
  name_en text NOT NULL,
  name_cn text NOT NULL,
  description_cn text NOT NULL,
  image_url text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create locations table
CREATE TABLE IF NOT EXISTS locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_en text NOT NULL,
  name_cn text NOT NULL,
  description_cn text NOT NULL,
  image_url text NOT NULL,
  category text NOT NULL CHECK (category IN ('dining', 'entertainment', 'sightseeing')),
  city_id text REFERENCES cities(id) ON DELETE CASCADE,
  rating numeric(2,1) CHECK (rating >= 0 AND rating <= 5),
  address text NOT NULL,
  lat numeric NOT NULL,
  lng numeric NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;

-- Create policies for cities
CREATE POLICY "Allow public read access for cities"
  ON cities
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow admin write access for cities"
  ON cities
  FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'email' IN (SELECT email FROM auth.users WHERE auth.users.raw_user_meta_data->>'role' = 'admin'))
  WITH CHECK (auth.jwt() ->> 'email' IN (SELECT email FROM auth.users WHERE auth.users.raw_user_meta_data->>'role' = 'admin'));

-- Create policies for locations
CREATE POLICY "Allow public read access for locations"
  ON locations
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow admin write access for locations"
  ON locations
  FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'email' IN (SELECT email FROM auth.users WHERE auth.users.raw_user_meta_data->>'role' = 'admin'))
  WITH CHECK (auth.jwt() ->> 'email' IN (SELECT email FROM auth.users WHERE auth.users.raw_user_meta_data->>'role' = 'admin'));