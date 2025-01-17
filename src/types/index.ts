export interface Location {
  id: string;
  nameEn: string;
  nameCn: string;
  descriptionCn: string;
  imageUrl: string;
  category: 'dining' | 'entertainment' | 'sightseeing';
  city: 'tokyo' | 'osaka' | 'kyoto' | 'hokkaido';
  rating: number;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface City {
  id: 'tokyo' | 'osaka' | 'kyoto' | 'hokkaido';
  nameEn: string;
  nameCn: string;
  descriptionCn: string;
  imageUrl: string;
  imageCredit?: string;
  imageCreditUrl?: string;
}

export interface AdminUser {
  id: string;
  email: string;
  role: 'admin' | 'editor';
}

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  nickname: string;
  avatar_url: string | null;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface UpdateProfileData {
  full_name?: string;
  nickname?: string;
  avatar_url?: string | null;
}