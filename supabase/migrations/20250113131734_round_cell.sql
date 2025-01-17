/*
  # Add image attribution fields

  1. New Columns
    - featured_image_caption: For image captions
    - featured_image_credit: For crediting the image creator/owner
    - featured_image_license: For specifying the license type
    - featured_image_attribution_url: For linking to the original source/license

  2. Changes
    - Adds new columns to articles table for image attribution
*/

-- Add image attribution columns
ALTER TABLE articles
ADD COLUMN IF NOT EXISTS featured_image_caption text,
ADD COLUMN IF NOT EXISTS featured_image_credit text,
ADD COLUMN IF NOT EXISTS featured_image_license text,
ADD COLUMN IF NOT EXISTS featured_image_attribution_url text;