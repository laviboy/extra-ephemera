import { getSupabase } from "./supabaseClient";

const STORAGE_BUCKET = "listings-images";

interface UploadImageResult {
  url: string;
  path: string;
}

/**
 * Upload an image to Supabase storage
 * @param file The file to upload
 * @param listingId The listing ID to organize files
 * @returns Object containing the public URL and storage path
 */
export async function uploadImage(
  file: File,
  listingId: string
): Promise<UploadImageResult> {
  try {
    const supabase = getSupabase();

    // Generate unique file name
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(7)}.${fileExt}`;
    const filePath = `${listingId}/${fileName}`;

    console.log(`📤 Uploading to Supabase storage: ${filePath}`);

    // Upload file to Supabase storage
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("❌ Supabase storage error:", error);
      throw error;
    }

    console.log("✅ File uploaded successfully:", data?.path);

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(filePath);

    console.log("🔗 Public URL:", publicUrl);

    return {
      url: publicUrl,
      path: filePath,
    };
  } catch (error) {
    console.error("Error uploading image:", error);
    throw new Error("Failed to upload image");
  }
}

/**
 * Delete an image from Supabase storage
 * @param path The storage path of the image
 */
export async function deleteImage(path: string): Promise<void> {
  try {
    const supabase = getSupabase();

    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([path]);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error("Error deleting image:", error);
    throw new Error("Failed to delete image");
  }
}

/**
 * Delete all images for a listing
 * @param listingId The listing ID
 */
export async function deleteListingImages(listingId: string): Promise<void> {
  try {
    const supabase = getSupabase();

    const { data: files, error: listError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .list(listingId);

    if (listError) {
      throw listError;
    }

    if (files && files.length > 0) {
      const filePaths = files.map((file) => `${listingId}/${file.name}`);
      const { error: deleteError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .remove(filePaths);

      if (deleteError) {
        throw deleteError;
      }
    }
  } catch (error) {
    console.error("Error deleting listing images:", error);
    throw new Error("Failed to delete listing images");
  }
}

/**
 * Initialize the storage bucket (run this once)
 */
export async function initializeStorageBucket(): Promise<void> {
  try {
    const supabase = getSupabase();

    // Check if bucket exists
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(
      (bucket) => bucket.name === STORAGE_BUCKET
    );

    if (!bucketExists) {
      // Create bucket with public access
      const { error } = await supabase.storage.createBucket(STORAGE_BUCKET, {
        public: true,
        fileSizeLimit: 5242880, // 5MB
        allowedMimeTypes: [
          "image/jpeg",
          "image/png",
          "image/webp",
          "image/gif",
        ],
      });

      if (error) {
        throw error;
      }
    }
  } catch (error) {
    console.error("Error initializing storage bucket:", error);
  }
}
