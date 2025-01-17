import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Image as ImageIcon, GripVertical, X, Plus, Edit2 } from 'lucide-react';
import MediaModal from './MediaModal';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';

interface GalleryImage {
  id: string;
  media_id: string;
  url: string;
  caption: string;
  caption_cn: string;
  sort_order: number;
  credit?: string;
  credit_url?: string;
}

interface GalleryManagerProps {
  articleId: string;
  images: GalleryImage[];
  onChange: (images: GalleryImage[]) => void;
}

export default function GalleryManager({ articleId, images, onChange }: GalleryManagerProps) {
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [editingImage, setEditingImage] = useState<string | null>(null);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(images);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update sort order
    const updatedItems = items.map((item, index) => ({
      ...item,
      sort_order: index
    }));

    onChange(updatedItems);
  };

  const handleImageSelect = async (url: string) => {
    try {
      // Get media record
      const { data: mediaRecord, error: mediaError } = await supabase
        .from('media')
        .select('id, credit, credit_url')
        .eq('url', url)
        .single();

      if (mediaError || !mediaRecord) {
        throw new Error('Media record not found');
      }

      // Create new gallery image
      const newImage: GalleryImage = {
        id: `temp-${Date.now()}`, // Temporary ID until saved
        media_id: mediaRecord.id,
        url,
        caption: '',
        caption_cn: '',
        sort_order: images.length,
        credit: mediaRecord.credit,
        credit_url: mediaRecord.credit_url
      };

      const updatedImages = [...images, newImage].map((img, index) => ({
        ...img,
        sort_order: index
      }));
      
      onChange(updatedImages);
      setShowMediaModal(false);
      toast.success('Image added to gallery');
    } catch (error) {
      console.error('Error adding gallery image:', error);
      toast.error('Failed to add image to gallery');
    }
  };

  const handleRemoveImage = (id: string) => {
    const updatedImages = images
      .filter(img => img.id !== id)
      .map((img, index) => ({
        ...img,
        sort_order: index
      }));
    onChange(updatedImages);
  };

  const handleUpdateCaption = (id: string, field: 'caption' | 'caption_cn', value: string) => {
    const updatedImages = images.map(img =>
      img.id === id ? { ...img, [field]: value } : img
    );
    onChange(updatedImages);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex-1">
          <h3 className="text-lg font-medium text-gray-900">Image Gallery</h3>
          <p className="text-sm text-gray-500 mt-1">Drag and drop to reorder images</p>
        </div>
        <button
          onClick={() => setShowMediaModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-500 hover:bg-red-600"
        >
          <Plus className="h-4 w-4 mr-2 flex-shrink-0" />
          Add Image
        </button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="gallery">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-3"
            >
              {images.map((image, index) => (
                <Draggable
                  key={image.id}
                  draggableId={image.id}
                  index={index}
                >
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex gap-4">
                        {/* Drag Handle */}
                        <div
                          {...provided.dragHandleProps}
                          className="flex items-center text-gray-400 hover:text-gray-600"
                        >
                          <GripVertical className="h-5 w-5 cursor-grab active:cursor-grabbing" />
                        </div>

                        {/* Thumbnail */}
                        <div className="w-32 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          {image.url ? (
                            <img
                              src={image.url}
                              alt=""
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageIcon className="h-8 w-8 text-gray-400" />
                            </div>
                          )}
                        </div>

                        {/* Caption Fields */}
                        <div className="flex-1 space-y-3">
                          <input
                            type="text"
                            value={image.caption}
                            onChange={(e) => handleUpdateCaption(image.id, 'caption', e.target.value)}
                            placeholder="Caption (English)"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 text-sm"
                          />
                          <input
                            type="text"
                            value={image.caption_cn}
                            onChange={(e) => handleUpdateCaption(image.id, 'caption_cn', e.target.value)}
                            placeholder="Caption (Chinese)"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 text-sm"
                          />
                          {image.credit && (
                            <div className="text-sm text-gray-500">
                              Credit: {image.credit}
                              {image.credit_url && (
                                <a
                                  href={image.credit_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="ml-1 text-red-500 hover:text-red-600"
                                >
                                  (link)
                                </a>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => handleRemoveImage(image.id)}
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-full hover:bg-gray-100"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {images.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 hover:border-gray-300 transition-colors">
          <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No images</h3>
          <p className="mt-1 text-sm text-gray-500">
            Add images to create a gallery for this article
          </p>
        </div>
      )}
      <MediaModal
        isOpen={showMediaModal}
        onClose={() => setShowMediaModal(false)}
        onSelect={handleImageSelect}
      />
    </div>
  );
}