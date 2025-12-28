# Image Upload & Gallery Implementation Guide

## Overview
This guide covers the complete image upload and gallery functionality added to the Extra Ephemera project, including:
- Database migration for images table
- Supabase storage integration
- Image uploader component with shadcn UI
- Lightbox gallery with full-screen view and navigation

## 📁 Files Created/Modified

### Database Schema & Migration
1. **`drizzle/0003_add_images_table.sql`** - Migration file for images table
2. **`src/db/schema/images.ts`** - TypeScript schema definition
3. **`src/db/schema/index.ts`** - Updated to export images schema

### Components
4. **`src/components/ui/image-uploader.tsx`** - Image upload component
5. **`src/components/ui/image-gallery.tsx`** - Gallery with lightbox
6. **`src/components/listings/CreateListingForm.tsx`** - Updated with image upload

### API & Utilities
7. **`src/lib/storage.ts`** - Supabase storage utility functions
8. **`src/pages/api/images.ts`** - API endpoints for image operations

## 🗄️ Database Schema

### Images Table
```sql
CREATE TABLE "images" (
  "id" text PRIMARY KEY NOT NULL,
  "listing_id" text NOT NULL,
  "url" text NOT NULL,
  "storage_path" text NOT NULL,
  "caption" text,
  "display_order" integer DEFAULT 0,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
```

**Relationships:**
- `listing_id` → Foreign key to `listings.id` with CASCADE delete
- Indexed on `listing_id` for efficient queries
- One listing can have many images (one-to-many relationship)

## 🚀 Setup Instructions

### 1. Run Database Migration
```bash
# Apply the new migration
npm run db:push

# Or if using drizzle-kit migrate
npx drizzle-kit push:pg
```

### 2. Set Up Supabase Storage

#### Create Storage Bucket
Go to your Supabase dashboard → Storage → Create new bucket:
- **Bucket name:** `listing-images`
- **Public bucket:** Yes (for public image access)
- **File size limit:** 5MB
- **Allowed MIME types:** image/jpeg, image/png, image/webp, image/gif

#### Set Storage Policies
Add these RLS policies in Supabase:

```sql
-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'listing-images');

-- Allow public read access
CREATE POLICY "Public can view images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'listing-images');

-- Allow users to delete their own images
CREATE POLICY "Users can delete their own images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'listing-images');
```

### 3. Initialize Storage (One-time)
The storage utility includes an initialization function. You can call it once:

```typescript
import { initializeStorageBucket } from '@/lib/storage';

// Call this in your app initialization
await initializeStorageBucket();
```

## 🎨 Components Usage

### ImageUploader Component

```tsx
import { ImageUploader } from '@/components/ui/image-uploader';

function MyForm() {
  const [images, setImages] = useState([]);

  return (
    <ImageUploader 
      listingId="optional-listing-id"
      onImagesChange={setImages}
      maxImages={10}
    />
  );
}
```

**Props:**
- `listingId` (optional): For organizing files
- `onImagesChange`: Callback with updated images array
- `maxImages`: Maximum number of images (default: 10)

**Features:**
- Multiple file selection
- Drag & drop support (via native file input)
- Image preview before upload
- Caption editing
- Reordering (left/right arrows)
- Remove images
- File validation (type & size)

### ImageGallery Component

```tsx
import { ImageGallery } from '@/components/ui/image-gallery';

function ListingDetail() {
  const images = [
    { id: '1', url: 'https://...', caption: 'Beach view' },
    { id: '2', url: 'https://...', caption: 'Pool area' }
  ];

  return <ImageGallery images={images} />;
}
```

**Features:**
- Responsive grid layout (2/3/4 columns)
- Click to open full-screen lightbox
- Keyboard navigation (← → arrows, ESC to close)
- Next/Previous buttons
- Image counter (1 / 5)
- Thumbnail navigation strip
- Caption display

## 🔌 API Endpoints

### POST `/api/images`
Save image metadata to database
```typescript
fetch('/api/images', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    id: crypto.randomUUID(),
    listingId: 'listing-123',
    url: 'https://...',
    storagePath: 'listing-123/image.jpg',
    caption: 'Optional caption',
    displayOrder: 0
  })
});
```

### GET `/api/images?listingId=xxx`
Fetch all images for a listing
```typescript
const res = await fetch('/api/images?listingId=listing-123');
const { images } = await res.json();
```

### DELETE `/api/images`
Delete an image
```typescript
fetch('/api/images', {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ id: 'image-id' })
});
```

## 📦 Storage Utility Functions

### uploadImage()
```typescript
import { uploadImage } from '@/lib/storage';

const result = await uploadImage(file, listingId);
// Returns: { url: string, path: string }
```

### deleteImage()
```typescript
import { deleteImage } from '@/lib/storage';

await deleteImage('listing-123/image.jpg');
```

### deleteListingImages()
```typescript
import { deleteListingImages } from '@/lib/storage';

// Delete all images for a listing
await deleteListingImages('listing-123');
```

## 🎯 Image Upload Flow

1. **User selects images** → ImageUploader component
2. **Validation** → File type & size checks
3. **Preview** → Display using Object URLs
4. **Form submit** → CreateListingForm
5. **Create listing** → Get listing ID from API
6. **Upload to Supabase** → Use `uploadImage()` utility
7. **Save metadata** → POST to `/api/images`
8. **Success** → Images linked to listing

## 🔍 Library Recommendations

### Current Implementation
The `ImageGallery` component is built using:
- **shadcn/ui Dialog** - For modal/lightbox
- **Lucide Icons** - For UI icons
- **Native React state** - For navigation logic

### Alternative Libraries (Optional Upgrades)

#### 1. **yet-another-react-lightbox** ⭐ RECOMMENDED
```bash
npm install yet-another-react-lightbox
```
**Pros:**
- Modern, TypeScript-first
- Excellent keyboard & touch support
- Plugins for thumbnails, zoom, fullscreen
- Actively maintained (2024)
- Small bundle size (~15KB)

**Usage:**
```tsx
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

<Lightbox
  open={open}
  close={() => setOpen(false)}
  slides={images.map(img => ({ src: img.url }))}
/>
```

#### 2. **react-image-lightbox**
```bash
npm install react-image-lightbox
```
**Pros:**
- Simple API
- Good mobile support
- Widely used

**Cons:**
- Older, less actively maintained
- Larger bundle size

#### 3. **react-medium-image-zoom**
```bash
npm install react-medium-image-zoom
```
**Pros:**
- Smooth zoom animations
- Medium.com style
- Very lightweight

**Cons:**
- No gallery/carousel features
- Single image zoom only

#### 4. **PhotoSwipe**
```bash
npm install photoswipe
```
**Pros:**
- Feature-rich
- Touch gestures
- Zoom & pan

**Cons:**
- Larger bundle size
- More complex API

### Recommendation
✅ Stick with the **current custom implementation** for simplicity, OR
✅ Upgrade to **yet-another-react-lightbox** for production-ready features

## 🎨 Customization

### Styling
All components use Tailwind CSS and shadcn/ui tokens:
- Modify colors in [tailwind.config.mjs](tailwind.config.mjs)
- Customize component styles in respective `.tsx` files

### Validation
Edit validation rules in [src/lib/storage.ts](src/lib/storage.ts):
```typescript
// Change file size limit
fileSizeLimit: 5242880, // 5MB

// Change allowed types
allowedMimeTypes: ['image/jpeg', 'image/png']
```

### Max Images
Change in CreateListingForm.tsx:
```tsx
<ImageUploader maxImages={20} />
```

## 🐛 Troubleshooting

### Images not uploading
1. Check Supabase storage bucket exists
2. Verify RLS policies are set
3. Check browser console for errors
4. Ensure file size < 5MB

### Images not displaying
1. Verify bucket is public
2. Check image URLs are correct
3. Inspect network tab for 403/404 errors

### Migration issues
```bash
# Reset and reapply
npm run db:drop
npm run db:push
```

## 📝 Next Steps

1. ✅ Run database migration
2. ✅ Set up Supabase storage bucket
3. ✅ Configure RLS policies
4. ✅ Test image upload on create listing page
5. ✅ Add ImageGallery to listing detail pages
6. Consider adding image compression (e.g., browser-image-compression)
7. Add loading states and progress indicators
8. Implement image optimization (WebP conversion)
9. Add image cropping/editing (react-image-crop)

## 🎉 Features Overview

### ✅ Completed
- [x] Database schema for images
- [x] Supabase storage integration
- [x] Image uploader with preview
- [x] Caption and reordering
- [x] Full-screen lightbox gallery
- [x] Keyboard navigation
- [x] API endpoints
- [x] Form integration

### 🚧 Future Enhancements
- [ ] Image compression before upload
- [ ] Drag & drop file reordering
- [ ] Bulk upload with progress bar
- [ ] Image cropping tool
- [ ] WebP conversion
- [ ] Lazy loading for galleries
- [ ] CDN integration

---

**Need help?** Check the implementation in:
- [CreateListingForm.tsx](src/components/listings/CreateListingForm.tsx)
- [image-uploader.tsx](src/components/ui/image-uploader.tsx)
- [image-gallery.tsx](src/components/ui/image-gallery.tsx)
