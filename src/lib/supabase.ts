import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing required environment variables:');
  if (!supabaseUrl) console.error('- VITE_SUPABASE_URL is not set');
  if (!supabaseAnonKey) console.error('- VITE_SUPABASE_ANON_KEY is not set');
  throw new Error('Please check your environment variables');
}

const BUCKET_BASE_URL = `${supabaseUrl}/storage/v1/object/public`;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

export const getImageUrl = (path: string) => `${BUCKET_BASE_URL}/images/${path}`;

export const uploadImage = async (file: File, path: string) => {
  try {
    const { data, error } = await supabase.storage
      .from('images')
      .upload(path, file);

    if (error) throw error;
    return getImageUrl(path);
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};