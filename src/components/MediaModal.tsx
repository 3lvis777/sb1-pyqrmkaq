import React, { useState, useEffect } from 'react';
import { X, Upload, Search, Check, Loader2, Edit2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import type { MediaFile } from '../types/cms';

interface MediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string, credit?: string, creditUrl?: string) => void;
}

export default function MediaModal({ isOpen, onClose, onSelect }: MediaModalProps) {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFileUrl, setSelectedFileUrl] = useState<string | null>(null);
  const [showCreditForm, setShowCreditForm] = useState(false);
  const [editingFile, setEditingFile] = useState<MediaFile | null>(null);
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [creditInfo, setCreditInfo] = useState({
    credit: '',
    creditUrl: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadFiles();
    }
  }, [isOpen]);

  // Update credit info when file is selected
  useEffect(() => {
    if (selectedFile) {
      setCreditInfo({
        credit: selectedFile.credit || '',
        creditUrl: selectedFile.credit_url || ''
      });
    } else {
      setEditingFile(null);
      setCreditInfo({ credit: '', creditUrl: '' });
    }
  }, [selectedFile]);

  async function loadFiles() {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('media')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading files:', error);
        throw new Error('Failed to load media files');
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
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Only image files are allowed');
      return;
    }

    setUploading(true);
    const toastId = toast.loading('Uploading image...');

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(fileName);

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

      toast.success('Image uploaded successfully', { id: toastId });
      await loadFiles();
      setSelectedFileUrl(publicUrl);
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image', { id: toastId });
    } finally {
      setUploading(false);
    }
  }

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  const handleNext = () => {
    if (!selectedFile) return;
    setShowCreditForm(true);
    setEditMode(false);
    // Set credit info from selected file
    setCreditInfo({
      credit: selectedFile.credit || '',
      creditUrl: selectedFile.credit_url || ''
    });
  };

  const handleInsert = () => {
    const file = selectedFile || editingFile;
    if (!file) return;
    
    // If we're in edit mode, just update the attribution
    if (editMode) {
      handleUpdateAttribution(file);
      return;
    }

    // Validate URL if provided
    if (creditInfo.creditUrl && !creditInfo.creditUrl.match(/^https?:\/\/.+/)) {
      toast.error('Please enter a valid URL starting with http:// or https://');
      return;
    }

    setSaving(true);
    try {
      handleUpdateAttribution(file);

      // Only call onSelect and close if we're not editing
      if (!editingFile) {
        onSelect(file.url, creditInfo.credit, creditInfo.creditUrl);
        onClose();
      }
    } catch (error) {
      console.error('Error selecting image:', error);
      toast.error('Failed to select image');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateAttribution = async (file: MediaFile) => {
    try {
      const { error } = await supabase
        .from('media')
        .update({
          credit: creditInfo.credit,
          credit_url: creditInfo.creditUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', file.id);

      if (error) throw error;

      await loadFiles(); // Reload files to get updated credit info
      toast.success('Image attribution updated');
      setShowCreditForm(false);
      setEditingFile(null);
      setEditMode(false);
    } catch (error) {
      console.error('Error updating media credit:', error);
      toast.error('Failed to update image attribution');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg w-full max-w-4xl h-[80vh] flex flex-col">
        {showCreditForm ? (
          <>
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Image Credit</h2>
              <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6 flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="aspect-w-16 aspect-h-9">
                  <img 
                    src={selectedFileUrl || ''} 
                    alt="Selected image"
                    className="rounded-lg object-cover w-full h-full"
                  />
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Image Credit
                    </label>
                    <input
                      type="text"
                      value={creditInfo.credit}
                      onChange={(e) => setCreditInfo(prev => ({ ...prev, credit: e.target.value }))}
                      placeholder="e.g., John Doe"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Credit URL
                    </label>
                    <input
                      type="url"
                      value={creditInfo.creditUrl}
                      onChange={(e) => {
                        const url = e.target.value;
                        // Only update if empty or starts with http:// or https://
                        if (!url || url.match(/^https?:\/\/.*/)) {
                          setCreditInfo(prev => ({ ...prev, creditUrl: url }));
                        }
                      }}
                      placeholder="https://example.com/profile"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500"
                      pattern="https?://.+"
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      Must start with http:// or https://
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 border-t flex justify-end space-x-4">
              <button
                onClick={() => setShowCreditForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Back
              </button>
              <button
                onClick={() => {
                  handleUpdateAttribution(selectedFile || editingFile);
                  setShowCreditForm(false);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                OK
              </button>
              <button
                onClick={handleInsert}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-500 hover:bg-red-600"
              >
                Insert Image
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Header */}
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Media Library</h2>
              <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Search and Upload */}
            <div className="p-4 border-b space-y-4">
              <div className="flex items-center space-x-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Search media..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <label className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-500 hover:bg-red-600 cursor-pointer">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin text-red-500" />
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {filteredFiles.map((file) => (
                    <div
                      key={file.id}
                      onClick={() => {
                        setSelectedFile(file);
                        setSelectedFileUrl(file.url);
                      }}
                      className={`relative rounded-lg overflow-hidden cursor-pointer group ${
                        selectedFileUrl === file.url ? 'ring-2 ring-red-500' : ''
                      }`}
                    >
                      <img
                        src={file.url}
                        alt={file.name}
                        className="w-full h-32 object-cover transition-transform duration-200 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity duration-200" />
                      {file.credit && (
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                          <p className="text-white/90 text-sm">
                            Image Credit: {file.credit}
                          </p>
                          {file.credit_url && (
                            <a 
                              href={file.credit_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-white/80 hover:text-white text-xs transition-colors underline decoration-dotted"
                            >
                              View Attribution
                            </a>
                          )}
                        </div>
                      )}
                      {selectedFileUrl === file.url && (
                        <div className="absolute top-2 right-2">
                          <div className="bg-red-500 rounded-full p-1">
                            <Check className="h-4 w-4 text-white" />
                          </div>
                        </div>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingFile(file);
                          setCreditInfo({
                            credit: file.credit || '',
                            creditUrl: file.credit_url || ''
                          });
                          setEditMode(true);
                          setShowCreditForm(true);
                        }}
                        className="absolute bottom-2 right-2 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-colors"
                      >
                        <Edit2 className="h-4 w-4 text-gray-600" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 border-t flex justify-end space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleNext}
                disabled={!selectedFileUrl}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-500 hover:bg-red-600 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}