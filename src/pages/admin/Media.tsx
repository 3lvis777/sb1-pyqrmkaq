import React, { useState, useEffect } from 'react';
import { Upload, Search, Trash2, Loader2, Image as ImageIcon, Edit2, Check, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

import type { MediaFile } from '../../types/cms';
import { getImageUrl } from '../../lib/supabase';

export default function Media() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [editingFile, setEditingFile] = useState<string | null>(null);
  const [newFileName, setNewFileName] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'size'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [view, setView] = useState<'all' | 'regions'>('all');
  const ITEMS_PER_PAGE = 20;

  useEffect(() => {
    loadFiles();
  }, [page, sortBy, sortOrder, selectedTags]);

  const handleStartRename = (file: MediaFile) => {
    setEditingFile(file.name);
    setNewFileName(file.name.split('.').slice(0, -1).join('.'));
  };

  const handleBulkDelete = async () => {
    if (selectedFiles.length === 0) return;
    
    const confirmed = window.confirm(`Are you sure you want to delete ${selectedFiles.length} files?`);
    if (!confirmed) return;

    try {
      // Remove files from local state first
      setFiles(prevFiles => prevFiles.filter(file => !selectedFiles.includes(file.id)));

      for (const fileId of selectedFiles) {
        const { error } = await supabase
          .from('media')
          .delete()
          .eq('id', fileId);

        if (error) throw error;
      }

      toast.success(`${selectedFiles.length} files deleted successfully`);
      setSelectedFiles([]);
      loadFiles();
    } catch (error) {
      console.error('Error deleting files:', error);
      toast.error('Failed to delete files');
      loadFiles();
    }
  };

  const handleSort = (field: 'date' | 'name' | 'size') => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };
  const handleCancelRename = () => {
    setEditingFile(null);
    setNewFileName('');
  };

  const handleRename = async (oldName: string) => {
    const extension = oldName.split('.').pop();
    const newFullName = `${newFileName}.${extension}`;
    const file = files.find(f => f.name === oldName);

    if (newFullName === oldName) {
      handleCancelRename();
      return;
    }

    try {
      if (!file) throw new Error('File not found');

      // Copy the file with the new name
      const { data: copyData, error: copyError } = await supabase.storage
        .from('images')
        .copy(oldName, newFullName);

      if (copyError) throw copyError;

      // Delete the old file
      const { error: deleteError } = await supabase.storage
        .from('images')
        .remove([oldName]);

      if (deleteError) throw deleteError;

      // Get the new public URL
      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(newFullName);

      // Update the database record
      const { error: updateError } = await supabase
        .from('media')
        .update({
          name: newFullName,
          url: publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', file.id);

      if (updateError) {
        // If database update fails, try to revert storage changes
        await supabase.storage
          .from('images')
          .copy(newFullName, oldName)
          .then(() => supabase.storage.from('images').remove([newFullName]));
        throw updateError;
      }
      toast.success('File renamed successfully');
      handleCancelRename();
      loadFiles();
    } catch (error) {
      console.error('Error renaming file:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to rename file');
      loadFiles(); // Reload to ensure UI is in sync
    }
  };

  async function loadFiles() {
    try {
      setLoading(true);
      
      let query = supabase
        .from('media')
        .select('*', { count: 'exact' });

      // Apply filters
      if (searchQuery) {
        query = query.ilike('name', `%${searchQuery}%`);
      }

      if (selectedTags.length > 0) {
        query = query.contains('tags', selectedTags);
      }

      // Apply sorting
      switch (sortBy) {
        case 'date':
          query = query.order('created_at', { ascending: sortOrder === 'asc' });
          break;
        case 'name':
          query = query.order('name', { ascending: sortOrder === 'asc' });
          break;
        case 'size':
          query = query.order('size', { ascending: sortOrder === 'asc' });
          break;
      }

      // Apply pagination
      query = query
        .range((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE - 1);

      const { data, error, count } = await query;

      if (error) throw error;
      
      if (count) {
        setTotalPages(Math.ceil(count / ITEMS_PER_PAGE));
      }

      setFiles(data || []);
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
    setUploadError(null);
    const toastId = toast.loading('Uploading files...');

    try {
      for (const file of uploadedFiles) {
        // Validate file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
          throw new Error(`File ${file.name} exceeds 5MB limit`);
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
          throw new Error(`File ${file.name} is not an image`);
        }

        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

        // Upload file to storage
        const { error } = await supabase.storage
          .from('images')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        // Get the public URL
        const { data: { publicUrl } } = supabase.storage
          .from('images')
          .getPublicUrl(fileName);

        // Insert metadata into media table
        const { error: insertError } = await supabase
          .from('media')
          .insert({
            name: fileName,
            original_name: file.name,
            url: publicUrl,
            size: file.size,
            mime_type: file.type,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (insertError) throw insertError;
      }

      toast.success('Files uploaded successfully', { id: toastId });
      loadFiles();
    } catch (error) {
      console.error('Error uploading files:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload files';
      setUploadError(errorMessage);
      toast.error(errorMessage, { id: toastId });
    } finally {
      setUploading(false);
      // Clear the file input
      if (e.target) {
        e.target.value = '';
      }
    }
  }

  async function handleDelete(fileName: string) {
    const confirmed = window.confirm('Are you sure you want to delete this file?');
    if (!confirmed) return;

    setDeleting(fileName);

    try {
      // Remove from local state first for immediate UI feedback
      setFiles(prevFiles => prevFiles.filter(file => file.name !== fileName));

      const { error } = await supabase.storage
        .from('images')
        .remove([fileName]);

      if (error) {
        // If deletion fails, revert the UI change by reloading files
        loadFiles();
        throw error;
      }

      toast.success('File deleted successfully');
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error('Failed to delete file');
      // Reload files to ensure UI is in sync with server state
      loadFiles();
    } finally {
      setDeleting(null);
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
        <div className="flex items-center space-x-4">
          <div className="flex rounded-md shadow-sm">
            <button
              onClick={() => setView('all')}
              className={`px-4 py-2 text-sm font-medium ${
                view === 'all'
                  ? 'bg-red-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              } border border-gray-300 rounded-l-md`}
            >
              All Media
            </button>
            <button
              onClick={() => setView('regions')}
              className={`px-4 py-2 text-sm font-medium ${
                view === 'regions'
                  ? 'bg-red-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              } border border-l-0 border-gray-300 rounded-r-md`}
            >
              Region Images
            </button>
          </div>
          {selectedFiles.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-500 hover:bg-red-600"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Selected ({selectedFiles.length})
            </button>
          )}
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
      </div>

      <div className="mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          {view === 'regions' && (
            <div className="absolute left-full ml-4 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
              Showing images used in region pages
            </div>
          )}
          <input
            type="text"
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {uploadError && (
              <div className="text-red-500 text-sm">
                {uploadError}
              </div>
            )}
            <button
              onClick={() => handleSort('date')}
              className={`px-3 py-1 rounded-md text-sm ${
                sortBy === 'date' ? 'bg-red-500 text-white' : 'bg-gray-100'
              }`}
            >
              Date {sortBy === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
            <button
              onClick={() => handleSort('name')}
              className={`px-3 py-1 rounded-md text-sm ${
                sortBy === 'name' ? 'bg-red-500 text-white' : 'bg-gray-100'
              }`}
            >
              Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
            <button
              onClick={() => handleSort('size')}
              className={`px-3 py-1 rounded-md text-sm ${
                sortBy === 'size' ? 'bg-red-500 text-white' : 'bg-gray-100'
              }`}
            >
              Size {sortBy === 'size' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredFiles.map((file) => (
          <div 
            key={file.id} 
            className={`bg-white rounded-lg shadow-sm overflow-hidden group ${
              selectedFiles.includes(file.id) ? 'ring-2 ring-red-500' : ''
            }`}
            onClick={() => {
              if (selectedFiles.includes(file.id)) {
                setSelectedFiles(prev => prev.filter(id => id !== file.id));
              } else {
                setSelectedFiles(prev => [...prev, file.id]);
              }
            }}
          >
            <div className="aspect-w-16 aspect-h-9 bg-gray-100 relative">
              {file.url ? (
                <img
                  onClick={() => handleStartRename(file)}
                  src={file.url}
                  alt={file.name}
                  className={`w-full h-48 object-cover cursor-pointer ${
                    selectedFiles.includes(file.id) ? 'opacity-75' : ''
                  }`}
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
              {editingFile === file.name ? (
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={newFileName}
                    onChange={(e) => setNewFileName(e.target.value)}
                    className="flex-1 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                    autoFocus
                  />
                  <button
                    onClick={() => handleRename(file.name)}
                    className="p-1 text-green-500 hover:text-green-600"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                  <button
                    onClick={handleCancelRename}
                    className="p-1 text-gray-500 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900 truncate" title={file.name}>
                    {file.name}
                  </p>
                  <button
                    onClick={() => handleStartRename(file)}
                    className="p-1 text-gray-500 hover:text-gray-600"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                </div>
              )}
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
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center space-x-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 rounded-md bg-gray-100 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-3 py-1">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1 rounded-md bg-gray-100 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

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