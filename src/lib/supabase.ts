import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const BUCKET_BASE_URL = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public`;

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

export const getImageUrl = (path: string) => `${BUCKET_BASE_URL}/images/${path}`;

export const uploadImage = async (file: File, path: string) => {
  const { data, error } = await supabase.storage
    .from('images')
    .upload(path, file);

  if (error) throw error;
  return getImageUrl(path);
};