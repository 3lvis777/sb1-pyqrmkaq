import React, { useState, useEffect } from 'react';
import CityCard from '../components/CityCard';
import { supabase } from '../lib/supabase';
import { Loader2 } from 'lucide-react';
import type { City } from '../types';

interface CityWithMedia {
  id: string;
  nameEn: string;
  nameCn: string;
  descriptionCn: string;
  imageUrl: string;
  mediaId?: string;
}

export default function Home() {
  const [regions, setRegions] = useState<CityWithMedia[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRegions() {
      try {
        const { data: locationCategory } = await supabase.from('categories')
          .select('id').eq('slug', 'location').single();

        if (!locationCategory) return;

        // Get regions with their associated media
        const { data: regions } = await supabase
          .from('categories')
          .select('*')
          .eq('parent_id', locationCategory.id)
          .order('popularity', { ascending: false });

        if (regions) {
          setRegions(regions.map(region => ({
            id: region.slug,
            nameEn: region.name,
            nameCn: region.name_cn,
            descriptionCn: region.introduction_cn || region.description_cn || '',
            imageUrl: region.hero_image_url
          })));
        }
      } catch (error) {
        console.error('Error loading regions:', error);
      } finally {
        setLoading(false);
      }
    }

    loadRegions();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-red-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Discover Japan
          </h1>
          <p className="text-xl text-gray-600">
            探索日本的魅力，体验独特的文化与美食
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {regions.map((region) => (
            <CityCard key={region.id} city={region} />
          ))}
        </div>
      </div>
    </div>
  );
}