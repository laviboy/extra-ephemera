import React, { useEffect, useState } from "react";
import { ImageGallery } from "../ui/image-gallery";
import { Skeleton } from "../ui/skeleton";

interface ListingImage {
  id: string;
  url: string;
  caption?: string;
}

interface ListingImagesProps {
  listingId: string;
}

/**
 * Component to display images for a listing
 * Use this in your listing detail page
 */
export const ListingImages: React.FC<ListingImagesProps> = ({ listingId }) => {
  const [images, setImages] = useState<ListingImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchImages() {
      try {
        setLoading(true);
        const response = await fetch(`/api/images?listingId=${listingId}`);

        if (!response.ok) {
          throw new Error("Failed to fetch images");
        }

        const data = await response.json();
        setImages(data.images || []);
      } catch (err: any) {
        console.error("Error fetching images:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (listingId) {
      fetchImages();
    }
  }, [listingId]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="aspect-video rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Failed to load images</p>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No images available for this listing</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Property Images</h2>
      <ImageGallery images={images} />
    </div>
  );
};

export default ListingImages;
