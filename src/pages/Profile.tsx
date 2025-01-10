import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import ChangePasswordModal from '../components/ChangePasswordModal';
import { supabase } from '../lib/supabase';
import { Profile, UpdateProfileData } from '../types';
import { Camera, Loader2, Lock } from 'lucide-react';

const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/jpg'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [avatar, setAvatar] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    nickname: '',
  });

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return 'Please upload a valid image file (JPG or PNG)';
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'File size must be less than 5MB';
    }
    return null;
  };

  async function loadProfile() {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user!.id)
        .single();

      if (error) throw error;
      setProfile(data);
      setFormData({
        full_name: data.full_name || '',
        nickname: data.nickname || '',
      });
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const error = validateFile(file);
    if (error) {
      toast.error(error);
      return;
    }

    setError('');
    setAvatar(file);
    toast.success('Photo selected successfully');
  };

  async function uploadAvatar(file: File) {
    const fileExt = file.name.split('.').pop();
    const timestamp = new Date().getTime();
    const filePath = `${user!.id}/${timestamp}.${fileExt}`;

    // Delete old avatar if exists
    if (profile?.avatar_url) {
      const oldPath = profile.avatar_url.split('/').pop();
      if (oldPath) {
        await supabase.storage
          .from('avatars')
          .remove([`${user!.id}/${oldPath}`]);
      }
    }

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    return filePath;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    
    const savePromise = new Promise(async (resolve, reject) => {
      try {
        setUpdating(true);
        setError('');

        const updates: UpdateProfileData = {
          ...formData,
        };

        if (avatar) {
          const filePath = await uploadAvatar(avatar);
          const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath);
          
          updates.avatar_url = publicUrl;
        }

        const { error } = await supabase
          .from('profiles')
          .update(updates)
          .eq('id', user.id);

        if (error) throw error;
        await loadProfile();
        setAvatar(null);
        resolve('Profile updated successfully');
      } catch (error) {
        console.error('Error updating profile:', error);
        reject('Failed to update profile');
      } finally {
        setUpdating(false);
      }
    });

    toast.promise(savePromise, {
      loading: 'Saving changes...',
      success: 'Profile updated successfully!',
      error: (err) => err || 'An error occurred',
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-red-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-sm rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-8">Profile Settings</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
                  {error}
                </div>
              )}

              <div className="flex items-center space-x-6">
                <div className="relative">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt="Profile"
                      className="h-24 w-24 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center">
                      <Camera className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                  <label className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg cursor-pointer">
                    <Camera className="h-4 w-4 text-gray-600" />
                    <input
                      type="file"
                      className="hidden"
                      accept=".jpg,.jpeg,.png"
                      onChange={handleFileChange}
                    />
                  </label>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900">Profile Photo</h3>
                  <p className="text-sm text-gray-500">
                    Click the camera icon to upload a new photo
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500"
                  />
                </div>

                <div>
                  <label htmlFor="nickname" className="block text-sm font-medium text-gray-700">
                    Nickname
                  </label>
                  <input
                    type="text"
                    id="nickname"
                    value={formData.nickname}
                    onChange={(e) => setFormData(prev => ({ ...prev, nickname: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    value={profile?.email || ''}
                    disabled
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-50"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(true)}
                  className="inline-flex items-center px-4 py-2 mr-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <Lock className="h-4 w-4 mr-2" />
                  Change Password
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                >
                  {updating ? (
                    <>
                      <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </div>
  );
}