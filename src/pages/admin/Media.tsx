import React, { useState, useEffect } from 'react';
import { Upload, Search, Trash2, Loader2, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface MediaFile {
  name: string;
  url: string;
  created_at: string;
  size: number;
}

export default function Media() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadFiles();
  }, []);

  async function loadFiles() {
    try {
      const { data, error } = await supabase.storage
        .from('images')
        .list();

      if (error) throw error;

      const filesWithUrls = await Promise.all(
        (data || []).map(async (file) => {
          const { data: { publicUrl } } = supabase.storage
            .from('images')
            .getPublicUrl(file.name);

          return {
            name: file.name,
            url: publicUrl,
            created_at: file.created_at,
            size: file.metadata?.size || 0,
          };
        })
      );

      setFiles(filesWithUrls);
    } catch (error) {
      console.error('Error loading files:', error);
      toast.error('Failed to load media files');
    } finally {
      setLoading(false);
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const uploadedFiles = e.target.files;
    if (!uploadedFiles || uploadedFiles.length === 0) return;

    setUploading(true);
    const toastId = toast.loading('Uploading files...');

    try {
      for (const file of uploadedFiles) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

        const { error } = await supabase.storage
          .from('images')
          .upload(fileName, file);

        if (error) throw error;
      }

      toast.success('Files uploaded successfully', { id: toastId });
      loadFiles();
    } catch (error) {
      console.error('Error uploading files:', error);
      toast.error('Failed to upload files', { id: toastId });
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(fileName: string) {
    const confirmed = window.confirm('Are you sure you want to delete this file?');
    if (!confirmed) return;

    try {
      const { error } = await supabase.storage
        .from('images')
        .remove([fileName]);

      if (error) throw error;

      toast.success('File deleted successfully');
      loadFiles();
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error('Failed to delete file');
    }
  }

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-red-500" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Media Library</h1>
        <label className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-500 hover:bg-red-600 cursor-pointer">
          <Upload className="h-4 w-4 mr-2" />
          Upload Files
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
            disabled={uploading}
          />
        </label>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredFiles.map((file) => (
          <div key={file.name} className="bg-white rounded-lg shadow-sm overflow-hidden group">
            <div className="aspect-w-16 aspect-h-9 bg-gray-100 relative">
              {file.url ? (
                <img
                  src={file.url}
                  alt={file.name}
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://via.placeholder.com/400x300?text=Error+Loading+Image';
                  }}
                />
              ) : (
                <div className="flex items-center justify-center h-48">
                  <ImageIcon className="h-12 w-12 text-gray-400" />
                </div>
              )}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center opacity-0 group-hover:opacity-100">
                <button
                  onClick={() => handleDelete(file.name)}
                  className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="p-4">
              <p className="text-sm font-medium text-gray-900 truncate" title={file.name}>
                {file.name}
              </p>
              <p className="text-sm text-gray-500">
                {formatFileSize(file.size)}
              </p>
              <p className="text-xs text-gray-400">
                {new Date(file.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </div>

      {filteredFiles.length === 0 && (
        <div className="text-center py-12">
          <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No media files</h3>
          <p className="mt-1 text-sm text-gray-500">
            Upload some files to get started
          </p>
        </div>
      )}
    </div>
  );
}