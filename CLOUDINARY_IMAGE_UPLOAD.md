# Cloudinary Image Upload System

## Overview
This system allows admin users to upload product images directly to Cloudinary or use existing image URLs when creating/editing products.

## Features
- ✅ Direct image upload to Cloudinary
- ✅ Multiple image upload support (drag & drop or file picker)
- ✅ URL input for existing images
- ✅ Image preview with Cloudinary optimization
- ✅ Remove images functionality
- ✅ Primary image indicator
- ✅ Admin-only access

## Implementation

### 1. Environment Variables
Added to `.env.local`:
```env
CLOUDINARY_CLOUD_NAME=deltoizgm
CLOUDINARY_API_KEY=138218413644177
CLOUDINARY_API_SECRET=JjwCy3fOltzkBrYIAlvy20e01Bc
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=deltoizgm
```

### 2. API Endpoint
Created `/app/api/cloudinary/upload/route.ts`

**Endpoints:**
- `POST /api/cloudinary/upload` - Upload images
- `DELETE /api/cloudinary/upload` - Delete images

**Features:**
- Admin authentication check
- Multiple file upload support
- Auto-optimization (1000x1000 limit, auto quality, auto format)
- Stored in `gadgetworld/products` folder

**Upload Example:**
```typescript
const formData = new FormData();
formData.append('files', file1);
formData.append('files', file2);

const response = await axios.post('/api/cloudinary/upload', formData);
// Returns: { success: true, urls: [...], message: "..." }
```

### 3. ImageUploader Component
Created `/components/admin/ImageUploader.tsx`

**Props:**
```typescript
interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
}
```

**Features:**
- Two modes: Upload or URL input
- Drag & drop support
- Multiple file selection
- Image preview grid
- Remove individual images
- Primary image badge (first image)
- Cloudinary optimized display using `CldImage`

**Usage:**
```tsx
<ImageUploader 
  images={formData.images} 
  onChange={(images) => setFormData({...formData, images})} 
/>
```

### 4. Updated Admin Pages

#### New Product Page
- **Path:** `/app/admin/products/new/page.tsx`
- Changed `images: ['']` to `images: [] as string[]`
- Replaced manual image inputs with `<ImageUploader />`
- Added `handleImagesChange` handler

#### Edit Product Page
- **Path:** `/app/admin/products/[id]/page.tsx`
- Same updates as new product page
- Loads existing images from database

## How to Use

### As Admin - Creating Product:

1. Navigate to `/admin/products/new`
2. Fill in product details
3. In the **Product Images** section:

   **Option A: Upload Images**
   - Click "Upload Images" tab (default)
   - Drag & drop images or click to browse
   - Select one or multiple images
   - Images automatically upload to Cloudinary
   - Preview appears in grid below

   **Option B: Add Image URL**
   - Click "Add Image URL" tab
   - Paste image URL
   - Click "Add URL" button
   - Image appears in preview grid

4. Reorder by removing and re-adding (first = primary)
5. Remove unwanted images with X button
6. Submit form to create product

### As Admin - Editing Product:

1. Navigate to `/admin/products/[id]`
2. Existing images load automatically
3. Add more images or remove existing ones
4. Submit to update

## Image Optimization

All uploaded images are automatically:
- Resized to max 1000x1000px (maintains aspect ratio)
- Quality optimized (`q_auto`)
- Format optimized (`f_auto` - WebP, AVIF when supported)
- Stored in organized folder: `gadgetworld/products`

## Technical Details

### Cloudinary Configuration
```javascript
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
```

### Upload Transformation
```javascript
transformation: [
  { width: 1000, height: 1000, crop: 'limit' },
  { quality: 'auto' },
  { fetch_format: 'auto' }
]
```

### Response Format
```json
{
  "success": true,
  "urls": [
    {
      "url": "https://res.cloudinary.com/deltoizgm/image/upload/v1234/gadgetworld/products/xyz.jpg",
      "publicId": "gadgetworld/products/xyz",
      "width": 1000,
      "height": 1000
    }
  ],
  "message": "2 image(s) uploaded successfully"
}
```

## Security

- Admin role check on API endpoint
- Server-side validation
- Secure API keys (server-side only)
- File type validation (images only)
- Size limits enforced by Cloudinary

## Dependencies

```json
{
  "next-cloudinary": "latest",
  "cloudinary": "^2.x"
}
```

## Future Enhancements

- [ ] Bulk delete images
- [ ] Image cropping/editing before upload
- [ ] Drag-to-reorder images
- [ ] Image upload progress bar
- [ ] Compression settings
- [ ] Alt text for images
- [ ] Image search/filter in media library

## Troubleshooting

### Images not uploading
1. Check Cloudinary credentials in `.env.local`
2. Verify admin authentication
3. Check browser console for errors
4. Ensure files are valid images

### Images not displaying
1. Verify image URLs are correct
2. Check Cloudinary dashboard
3. Ensure NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is set

### API errors
1. Check server logs
2. Verify Cloudinary account status
3. Check API rate limits

## Related Files

- `/app/api/cloudinary/upload/route.ts` - Upload API endpoint
- `/components/admin/ImageUploader.tsx` - Image uploader component
- `/app/admin/products/new/page.tsx` - New product page
- `/app/admin/products/[id]/page.tsx` - Edit product page
- `/.env.local` - Environment configuration

## Testing

### Manual Testing Steps:
1. ✅ Login as admin
2. ✅ Create new product
3. ✅ Upload single image
4. ✅ Upload multiple images
5. ✅ Add image via URL
6. ✅ Remove image
7. ✅ Submit form
8. ✅ Edit existing product
9. ✅ Verify images persist
10. ✅ Check Cloudinary dashboard

## Support

For Cloudinary documentation:
- [Image Upload API](https://cloudinary.com/documentation/image_upload_api_reference)
- [Next.js Integration](https://next.cloudinary.dev/)
- [Transformation Reference](https://cloudinary.com/documentation/transformation_reference)
