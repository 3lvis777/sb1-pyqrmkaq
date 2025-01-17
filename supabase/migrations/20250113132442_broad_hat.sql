/*
  # Remove license column

  1. Changes
    - Drop featured_image_license column from articles table
*/

-- Drop the license column
ALTER TABLE articles DROP COLUMN IF EXISTS featured_image_license;