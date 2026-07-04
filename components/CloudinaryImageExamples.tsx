/**
 * Example: Using CldImage for Optimized Product Display
 * 
 * This file demonstrates how to use next-cloudinary's CldImage
 * component to display product images with automatic optimization.
 */

'use client';

import { CldImage } from 'next-cloudinary';

// Example 1: Basic Product Card Image
export function ProductCardImage({ imageUrl, productName }: { imageUrl: string; productName: string }) {
  // Check if it's a Cloudinary URL
  const isCloudinaryUrl = imageUrl.includes('cloudinary.com') || imageUrl.includes('res.cloudinary.com');

  if (isCloudinaryUrl) {
    return (
      <CldImage
        src={imageUrl}
        alt={productName}
        width={300}
        height={300}
        crop={{
          type: 'auto',
          source: true
        }}
        quality="auto"
        format="auto"
        className="object-cover rounded-lg"
      />
    );
  }

  // Fallback for non-Cloudinary URLs
  return (
    <img
      src={imageUrl}
      alt={productName}
      className="w-full h-full object-cover rounded-lg"
    />
  );
}

// Example 2: Product Detail Page - Large Image
export function ProductDetailImage({ imageUrl, productName }: { imageUrl: string; productName: string }) {
  const isCloudinaryUrl = imageUrl.includes('cloudinary.com') || imageUrl.includes('res.cloudinary.com');

  if (isCloudinaryUrl) {
    return (
      <CldImage
        src={imageUrl}
        alt={productName}
        width={800}
        height={800}
        crop={{
          type: 'auto',
          source: true
        }}
        quality="auto"
        format="auto"
        className="object-cover rounded-lg"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"
      />
    );
  }

  return (
    <img
      src={imageUrl}
      alt={productName}
      className="w-full h-full object-cover rounded-lg"
    />
  );
}

// Example 3: Thumbnail Grid
export function ProductThumbnail({ imageUrl, productName, onClick }: { 
  imageUrl: string; 
  productName: string;
  onClick?: () => void;
}) {
  const isCloudinaryUrl = imageUrl.includes('cloudinary.com') || imageUrl.includes('res.cloudinary.com');

  if (isCloudinaryUrl) {
    return (
      <button onClick={onClick} className="relative aspect-square">
        <CldImage
          src={imageUrl}
          alt={productName}
          width={100}
          height={100}
          crop={{
            type: 'thumb',
            gravity: 'auto'
          }}
          quality="auto"
          format="auto"
          className="object-cover rounded-md hover:opacity-75 transition-opacity"
        />
      </button>
    );
  }

  return (
    <button onClick={onClick} className="relative aspect-square">
      <img
        src={imageUrl}
        alt={productName}
        className="w-full h-full object-cover rounded-md hover:opacity-75 transition-opacity"
      />
    </button>
  );
}

// Example 4: Responsive Product Image with Multiple Sizes
export function ResponsiveProductImage({ imageUrl, productName }: { imageUrl: string; productName: string }) {
  const isCloudinaryUrl = imageUrl.includes('cloudinary.com') || imageUrl.includes('res.cloudinary.com');

  if (isCloudinaryUrl) {
    return (
      <CldImage
        src={imageUrl}
        alt={productName}
        width={1000}
        height={1000}
        crop={{
          type: 'auto',
          source: true
        }}
        quality="auto"
        format="auto"
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        className="object-cover"
      />
    );
  }

  return <img src={imageUrl} alt={productName} className="w-full h-full object-cover" />;
}

// Example 5: Hero Image with Custom Transformations
export function HeroProductImage({ imageUrl, productName }: { imageUrl: string; productName: string }) {
  const isCloudinaryUrl = imageUrl.includes('cloudinary.com') || imageUrl.includes('res.cloudinary.com');

  if (isCloudinaryUrl) {
    return (
      <CldImage
        src={imageUrl}
        alt={productName}
        width={1200}
        height={800}
        crop={{
          type: 'fill',
          gravity: 'auto'
        }}
        quality="auto"
        format="auto"
        className="object-cover w-full h-full"
      />
    );
  }

  return <img src={imageUrl} alt={productName} className="w-full h-full object-cover" />;
}

// Example 6: Product Image with Lazy Loading
export function LazyProductImage({ imageUrl, productName }: { imageUrl: string; productName: string }) {
  const isCloudinaryUrl = imageUrl.includes('cloudinary.com') || imageUrl.includes('res.cloudinary.com');

  if (isCloudinaryUrl) {
    return (
      <CldImage
        src={imageUrl}
        alt={productName}
        width={500}
        height={500}
        crop={{
          type: 'auto',
          source: true
        }}
        quality="auto"
        format="auto"
        loading="lazy"
        className="object-cover rounded-lg"
      />
    );
  }

  return (
    <img
      src={imageUrl}
      alt={productName}
      loading="lazy"
      className="w-full h-full object-cover rounded-lg"
    />
  );
}

/**
 * USAGE EXAMPLES:
 * 
 * // In your ProductCard component:
 * <ProductCardImage 
 *   imageUrl={product.images[0]} 
 *   productName={product.title} 
 * />
 * 
 * // In your Product Detail page:
 * <ProductDetailImage 
 *   imageUrl={selectedImage} 
 *   productName={product.title} 
 * />
 * 
 * // In your thumbnail gallery:
 * {product.images.map((img, i) => (
 *   <ProductThumbnail
 *     key={i}
 *     imageUrl={img}
 *     productName={product.title}
 *     onClick={() => setSelectedImage(img)}
 *   />
 * ))}
 * 
 * BENEFITS:
 * ✅ Automatic format optimization (WebP, AVIF)
 * ✅ Automatic quality optimization
 * ✅ Responsive image sizing
 * ✅ Lazy loading support
 * ✅ Smart cropping
 * ✅ CDN delivery
 * ✅ Fallback for non-Cloudinary URLs
 */

export default {
  ProductCardImage,
  ProductDetailImage,
  ProductThumbnail,
  ResponsiveProductImage,
  HeroProductImage,
  LazyProductImage,
};
