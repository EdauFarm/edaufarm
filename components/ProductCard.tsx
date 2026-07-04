'use client';

import Link from 'next/link';
import Image from 'next/image';
import { calculateDiscount } from '@/lib/utils';
import { useCurrency } from '@/contexts/CurrencyContext';
import { convertAndFormatPrice } from '@/lib/currencyFormat';
import { useState } from 'react';
import { FiPackage, FiShare2 } from 'react-icons/fi';

interface ProductCardProps {
  product: {
    _id: string;
    title: string;
    price: number;
    compareAtPrice?: number;
    images: string[];
    category: string;
    rating: {
      average: number;
      count: number;
    };
    stock: number;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
    const { currency } = useCurrency();
    // Assume all product prices are stored in KES as base
    const formatCurrency = (amount: number) => convertAndFormatPrice(amount, 'KES', currency.code);
  const [imageError, setImageError] = useState(false);
  const discount = calculateDiscount(product.price, product.compareAtPrice);

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const shareData = {
      title: product.title,
      text: `Check out this ${product.title} on Gadget World`,
      url: `${window.location.origin}/products/${product._id}`,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(shareData.url).then(() => {
        alert('Product link copied to clipboard!');
      }).catch(() => {
        alert('Unable to share. Please copy the URL manually.');
      });
    }
  };

  return (
    <Link href={`/products/${product._id}`} className="block group">
      <div className="bg-white rounded-lg overflow-hidden border border-gray-100 hover:shadow-md transition-shadow duration-200">
        {/* Image Container */}
        <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100">
          {product.images[0] && !imageError ? (
            <Image
              src={product.images[0]}
              alt={product.title}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-contain p-4"
              loading="lazy"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-4">
              <div className="w-20 h-20 mb-3 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                <FiPackage className="w-10 h-10 text-white" />
              </div>
              <div className="text-center">
                <p className="text-xs font-semibold text-gray-900 mb-1">Gadget World</p>
                <p className="text-xs text-gray-500">Image unavailable</p>
              </div>
            </div>
          )}
          
          {/* Sale Badge */}
          {discount > 0 && (
            <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-0.5 text-xs font-medium rounded">
              Sale
            </div>
          )}
          
          {/* Stock Badge */}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="bg-white text-gray-900 px-4 py-2 rounded-lg font-semibold text-sm">
                Out of Stock
              </span>
            </div>
          )}

          {/* Share Button */}
          <button
            onClick={handleShare}
            className="absolute top-2 right-2 bg-white/90 hover:bg-white text-gray-700 hover:text-gray-900 p-2 rounded-full shadow-md hover:shadow-lg transition-all duration-200 opacity-0 group-hover:opacity-100 lg:opacity-100"
            aria-label="Share product"
          >
            <FiShare2 className="w-4 h-4" />
          </button>
        </div>

        {/* Product Info */}
        <div className="p-3">
          <h3 className="text-sm text-gray-900 line-clamp-2 mb-2 min-h-[2.5rem] group-hover:text-gray-700 transition-colors">
            {product.title}
          </h3>
          
          <div className="flex flex-col gap-1">
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <div className="text-xs text-gray-400 line-through">
                {formatCurrency(product.compareAtPrice)}
              </div>
            )}
            <div className="text-lg font-semibold text-gray-900">
              {formatCurrency(product.price)}
            </div>
          </div>
          
          {/* Rating */}
          {product.rating && product.rating.count > 0 && (
            <div className="flex items-center gap-1 mt-2">
              <div className="flex text-yellow-400">
                {'★'.repeat(Math.round(product.rating.average))}
                {'☆'.repeat(5 - Math.round(product.rating.average))}
              </div>
              <span className="text-xs text-gray-500">({product.rating.count})</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
