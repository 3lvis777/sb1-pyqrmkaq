import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Please click the "Connect to Supabase" button in the top right to set up your database connection');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

const BUCKET_BASE_URL = `${supabaseUrl}/storage/v1/object/public`;

export const getImageUrl = (path: string) => `${BUCKET_BASE_URL}/images/${path}`;

export const uploadImage = async (file: File, path: string) => {
  try {
    const { data, error } = await supabase.storage
      .from('images')
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;
    return getImageUrl(path);
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};