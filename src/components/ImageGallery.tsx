import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X, ExternalLink } from 'lucide-react';

interface GalleryImage {
  id: string;
  url: string;
  caption?: string;
  caption_cn?: string;
  credit?: string;
  credit_url?: string;
}

interface ImageGalleryProps {
  images: GalleryImage[];
  language?: 'en' | 'cn';
}

export default function ImageGallery({ images, language = 'en' }: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (showLightbox) {
      if (e.key === 'ArrowLeft') {
        goToPrevious();
      } else if (e.key === 'ArrowRight') {
        goToNext();
      } else if (e.key === 'Escape') {
        setShowLightbox(false);
      }
    }
  };

  React.useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showLightbox]);

  if (!images.length) return null;

  const currentImage = images[currentIndex];

  return (
    <div className="mb-20">
      <div className="relative bg-gray-100 rounded-lg overflow-hidden">
        <div className="aspect-w-16 aspect-h-9">
          <img
            src={currentImage.url}
            alt={language === 'en' ? currentImage.caption : currentImage.caption_cn}
            className="w-full h-full object-cover cursor-pointer"
            onClick={() => setShowLightbox(true)}
            loading="lazy"
          />
        </div>

        {/* Image Credit */}
        {(currentImage.credit || currentImage.credit_url) && (
          <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-4">
            <p className="text-sm">
              Image Credit:{' '}
              {currentImage.credit_url ? (
                <a
                  href={currentImage.credit_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-gray-200 underline decoration-dotted"
                >
                  {currentImage.credit}
                </a>
              ) : (
                currentImage.credit
              )}
            </p>
          </div>
        )}

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToPrevious();
              }}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToNext();
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}

        {/* Caption and Credits */}
        {(currentImage.caption || currentImage.credit) && (
          <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-4">
            {currentImage.caption && (
              <p className="text-sm mb-1">
                {language === 'en' ? currentImage.caption : currentImage.caption_cn}
              </p>
            )}
            {currentImage.credit && (
              <p className="text-xs text-gray-300">
                Image Credits:{' '}
                {currentImage.credit_url ? (
                  <a
                    href={currentImage.credit_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white hover:text-gray-200 inline-flex items-center"
                  >
                    {currentImage.credit}
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                ) : (
                  currentImage.credit
                )}
              </p>
            )}
          </div>
        )}

        {/* Thumbnail Navigation */}
        {images.length > 1 && (
          <div className="absolute bottom-0 left-0 right-0 transform translate-y-20">
            <div className="flex gap-2 overflow-x-auto pb-4 px-2">
              {images.map((image, index) => (
                <button
                  key={image.id}
                  onClick={() => setCurrentIndex(index)}
                  className={`relative flex-shrink-0 ${
                    index === currentIndex
                      ? 'ring-2 ring-red-500'
                      : 'hover:ring-2 hover:ring-gray-300'
                  }`}
                >
                  <img
                    src={image.url}
                    alt={language === 'en' ? image.caption : image.caption_cn}
                    className="h-16 w-24 object-cover rounded"
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {showLightbox && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center"
          onClick={() => setShowLightbox(false)}
        >
          <button
            onClick={() => setShowLightbox(false)}
            className="absolute top-4 right-4 text-white p-2 hover:bg-white/10 rounded-full"
          >
            <X className="h-6 w-6" />
          </button>
          
          <div className="relative max-w-7xl mx-auto px-4" onClick={e => e.stopPropagation()}>
            <img
              src={currentImage.url}
              alt={language === 'en' ? currentImage.caption : currentImage.caption_cn}
              className="max-h-[85vh] w-auto mx-auto"
            />
            
            {/* Lightbox Image Credit */}
            {(currentImage.credit || currentImage.credit_url) && (
              <div className="absolute bottom-4 left-0 right-0 text-center">
                <p className="text-sm text-white/90">
                  Image Credit:{' '}
                  {currentImage.credit_url ? (
                    <a
                      href={currentImage.credit_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white hover:text-gray-200 underline decoration-dotted"
                    >
                      {currentImage.credit}
                    </a>
                  ) : (
                    currentImage.credit
                  )}
                </p>
              </div>
            )}

            {images.length > 1 && (
              <>
                <button
                  onClick={goToPrevious}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70"
                >
                  <ChevronLeft className="h-8 w-8" />
                </button>
                <button
                  onClick={goToNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70"
                >
                  <ChevronRight className="h-8 w-8" />
                </button>
              </>
            )}

            {(currentImage.caption || currentImage.credit) && (
              <div className="absolute -bottom-12 left-0 right-0 text-white text-center">
                {currentImage.caption && (
                  <p className="text-lg mb-2">
                    {language === 'en' ? currentImage.caption : currentImage.caption_cn}
                  </p>
                )}
                {currentImage.credit && (
                  <p className="text-sm text-gray-300">
                    Image Credit:{' '}
                    {currentImage.credit_url ? (
                      <a
                        href={currentImage.credit_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white hover:text-gray-200 inline-flex items-center"
                      >
                        {currentImage.credit}
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    ) : (
                      currentImage.credit
                    )}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}