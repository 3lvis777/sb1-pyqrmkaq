/*
  # Add image attribution link field
  
  1. Changes
    - Add featured_image_attribution_url column to articles table
    - This allows linking to the original image source or creator's profile
*/

ALTER TABLE articles
ADD COLUMN featured_image_attribution_url text;