import { supabase } from '../src/lib/supabase';
import { osakaPlaces } from '../src/data/osaka-sightseeing';

async function uploadMedia() {
  for (const place of osakaPlaces) {
    try {
      const fileName = `osaka-${place.title.toLowerCase().replace(/\s+/g, '-')}.jpg`;
      
      // Insert into media table
      const { error } = await supabase
        .from('media')
        .insert({
          name: fileName,
          original_name: fileName,
          url: place.imageUrl,
          size: 0, // Size will be updated after actual file upload
          mime_type: 'image/jpeg',
          tags: ['osaka', 'sightseeing', 'places'],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      console.log(`Added ${fileName} to media library`);
    } catch (error) {
      console.error(`Error uploading ${place.title}:`, error);
    }
  }
}

uploadMedia();