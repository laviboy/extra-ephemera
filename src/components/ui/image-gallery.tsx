import React, { useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogContent } from "./dialog";

interface Image {
  id: string;
  url: string;
  caption?: string;
}

interface ImageGalleryProps {
  images: Image[];
  className?: string;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  className = "",
}) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const openLightbox = (index: number) => {
    setSelectedIndex(index);
  };

  const closeLightbox = () => {
    setSelectedIndex(null);
  };

  const goToPrevious = () => {
    if (selectedIndex !== null && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    }
  };

  const goToNext = () => {
    if (selectedIndex !== null && selectedIndex < images.length - 1) {
      setSelectedIndex(selectedIndex + 1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (selectedIndex === null) return;

    switch (e.key) {
      case "ArrowLeft":
        goToPrevious();
        break;
      case "ArrowRight":
        goToNext();
        break;
      case "Escape":
        closeLightbox();
        break;
    }
  };

  if (images.length === 0) {
    return null;
  }

  return (
    <>
      {/* Gallery Grid */}
      <div
        className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 ${className}`}
      >
        {images.map((image, index) => (
          <button
            key={image.id}
            onClick={() => openLightbox(index)}
            className="aspect-video relative rounded-lg overflow-hidden bg-muted hover:opacity-90 transition-opacity cursor-pointer group"
          >
            <img
              src={image.url}
              alt={image.caption || `Image ${index + 1}`}
              className="w-full h-full object-cover"
            />
            {image.caption && (
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-2 text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                {image.caption}
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Lightbox Dialog */}
      <Dialog open={selectedIndex !== null} onOpenChange={closeLightbox}>
        <DialogContent
          className="max-w-[95vw] max-h-[95vh] p-0 bg-black/95 border-none"
          onKeyDown={handleKeyDown}
        >
          {selectedIndex !== null && (
            <div className="relative w-full h-full flex items-center justify-center">
              {/* Close Button */}
              <button
                onClick={closeLightbox}
                className="absolute top-4 right-4 z-50 text-white hover:text-gray-300 transition-colors bg-black/50 rounded-full p-2"
              >
                <X className="h-6 w-6" />
              </button>

              {/* Previous Button */}
              {selectedIndex > 0 && (
                <button
                  onClick={goToPrevious}
                  className="absolute left-4 z-50 text-white hover:text-gray-300 transition-colors bg-black/50 rounded-full p-3"
                >
                  <ChevronLeft className="h-8 w-8" />
                </button>
              )}

              {/* Next Button */}
              {selectedIndex < images.length - 1 && (
                <button
                  onClick={goToNext}
                  className="absolute right-4 z-50 text-white hover:text-gray-300 transition-colors bg-black/50 rounded-full p-3"
                >
                  <ChevronRight className="h-8 w-8" />
                </button>
              )}

              {/* Main Image */}
              <div className="flex flex-col items-center justify-center w-full h-full p-8">
                <img
                  src={images[selectedIndex].url}
                  alt={
                    images[selectedIndex].caption ||
                    `Image ${selectedIndex + 1}`
                  }
                  className="max-w-full max-h-[80vh] object-contain"
                />

                {/* Caption and Counter */}
                <div className="mt-4 text-center">
                  {images[selectedIndex].caption && (
                    <p className="text-white text-lg mb-2">
                      {images[selectedIndex].caption}
                    </p>
                  )}
                  <p className="text-gray-400 text-sm">
                    {selectedIndex + 1} / {images.length}
                  </p>
                </div>
              </div>

              {/* Thumbnail Strip (Optional) */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 overflow-x-auto max-w-[90vw] px-4">
                {images.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => setSelectedIndex(index)}
                    className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-all ${
                      index === selectedIndex
                        ? "border-white scale-110"
                        : "border-transparent opacity-50 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={image.url}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ImageGallery;
