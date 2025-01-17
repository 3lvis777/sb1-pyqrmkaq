/*
  # Add Media Credits

  1. Changes
    - Add credit and credit_url fields to media table
    - These fields will be used for image attribution across the site
*/

-- Add credit fields to media table
ALTER TABLE media
ADD COLUMN credit text,
ADD COLUMN credit_url text;