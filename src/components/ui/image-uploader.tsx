import React, { useState, useRef } from "react";
import { Button } from "./button";
import { Card } from "./card";
import { Upload, X, Image as ImageIcon } from "lucide-react";

interface ImageFile {
  id: string;
  file?: File;
  url: string;
  caption?: string;
  displayOrder: number;
}

interface ImageUploaderProps {
  listingId?: string;
  onImagesChange?: (images: ImageFile[]) => void;
  maxImages?: number;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  listingId,
  onImagesChange,
  maxImages = 10,
}) => {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (images.length + files.length > maxImages) {
      alert(`Maximum ${maxImages} images allowed`);
      return;
    }

    setUploading(true);

    try {
      const newImages: ImageFile[] = [];

      for (const file of files) {
        // Validate file type
        if (!file.type.startsWith("image/")) {
          alert(`${file.name} is not an image file`);
          continue;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          alert(`${file.name} is too large. Max size is 5MB`);
          continue;
        }

        // Create preview URL
        const previewUrl = URL.createObjectURL(file);
        const id = `temp-${Date.now()}-${Math.random()}`;

        newImages.push({
          id,
          file,
          url: previewUrl,
          displayOrder: images.length + newImages.length,
        });
      }

      const updatedImages = [...images, ...newImages];
      setImages(updatedImages);
      onImagesChange?.(updatedImages);
    } catch (error) {
      console.error("Error handling files:", error);
      alert("Error processing images");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const removeImage = (id: string) => {
    const updatedImages = images.filter((img) => img.id !== id);
    setImages(updatedImages);
    onImagesChange?.(updatedImages);
  };

  const updateCaption = (id: string, caption: string) => {
    const updatedImages = images.map((img) =>
      img.id === id ? { ...img, caption } : img
    );
    setImages(updatedImages);
    onImagesChange?.(updatedImages);
  };

  const moveImage = (id: string, direction: "left" | "right") => {
    const index = images.findIndex((img) => img.id === id);
    if (
      (direction === "left" && index === 0) ||
      (direction === "right" && index === images.length - 1)
    ) {
      return;
    }

    const newImages = [...images];
    const newIndex = direction === "left" ? index - 1 : index + 1;
    [newImages[index], newImages[newIndex]] = [
      newImages[newIndex],
      newImages[index],
    ];

    // Update display order
    const reorderedImages = newImages.map((img, idx) => ({
      ...img,
      displayOrder: idx,
    }));

    setImages(reorderedImages);
    onImagesChange?.(reorderedImages);
  };

  return (
    <div className="space-y-4">
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          id="image-upload"
        />
        <Button
          type="button"
          variant="outline"
          disabled={uploading || images.length >= maxImages}
          onClick={() => fileInputRef.current?.click()}
          className="w-full"
        >
          <Upload className="h-4 w-4 mr-2" />
          {uploading
            ? "Processing..."
            : `Upload Images (${images.length}/${maxImages})`}
        </Button>
        <p className="text-sm text-muted-foreground mt-2">
          Supported formats: JPG, PNG, WebP. Max size: 5MB per image.
        </p>
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((image, index) => (
            <Card key={image.id} className="p-2 relative group">
              <div className="aspect-video relative rounded-md overflow-hidden bg-muted">
                <img
                  src={image.url}
                  alt={image.caption || `Image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeImage(image.id)}
                  className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-2 space-y-2">
                <input
                  type="text"
                  placeholder="Caption (optional)"
                  value={image.caption || ""}
                  onChange={(e) => updateCaption(image.id, e.target.value)}
                  className="w-full text-sm px-2 py-1 border rounded"
                />
                <div className="flex gap-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => moveImage(image.id, "left")}
                    disabled={index === 0}
                    className="flex-1"
                  >
                    ←
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => moveImage(image.id, "right")}
                    disabled={index === images.length - 1}
                    className="flex-1"
                  >
                    →
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
