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
    id: string;
    name: string;
    price: number;
    compare_at_price?: number;
    images: string[];
    category_id?: string;
    unit_type?: string;
    is_organic?: boolean;
    rating_avg?: number;
    rating_count?: number;
    quantity?: number;
    categories?: { name: string; slug: string } | null;
  };
}

const unitLabels: Record<string, string> = {
  piece: 'pcs',
  kg: 'kg',
  bunch: 'bunch',
  sack: 'sack',
  crate: 'crate',
  litre: 'L',
  liter: 'L',
  dozen: 'dz',
  box: 'box',
  jar: 'jar',
  bottle: 'btl',
  tray: 'tray',
  bucket: 'bucket',
};

export default function ProductCard({ product }: ProductCardProps) {
  const { currency } = useCurrency();
  const formatCurrency = (amount: number) => convertAndFormatPrice(amount, 'KES', currency.code);
  const [imageError, setImageError] = useState(false);
  const discount = calculateDiscount(product.price, product.compare_at_price);

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const shareData = {
      title: product.name,
      text: `Check out ${product.name} from Edau Farm`,
      url: `${window.location.origin}/products/${product.id}`,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
      }
    } else {
      navigator.clipboard.writeText(shareData.url).then(() => {
        alert('Product link copied to clipboard!');
      }).catch(() => {
        alert('Unable to share. Please copy the URL manually.');
      });
    }
  };

  return (
    <Link href={`/products/${product.id}`} className="block group">
      <div className="bg-white rounded-xl overflow-hidden border border-primary-100 hover:shadow-xl hover:border-primary-200 transition-all duration-300">
        <div className="relative aspect-square bg-gradient-to-br from-primary-50 to-green-50">
          {product.images?.[0] && !imageError ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover"
              loading="lazy"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-4">
              <div className="w-20 h-20 mb-3 rounded-full bg-gradient-to-br from-primary-600 to-primary-700 flex items-center justify-center">
                <FiPackage className="w-10 h-10 text-white" />
              </div>
              <div className="text-center">
                <p className="text-xs font-semibold text-gray-900 mb-1">Edau Farm</p>
                <p className="text-xs text-gray-500">Image unavailable</p>
              </div>
            </div>
          )}

          {discount > 0 && (
            <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-0.5 text-xs font-medium rounded">
              -{discount}%
            </div>
          )}

          {product.is_organic && (
            <div className="absolute top-2 right-10 bg-primary-600 text-white px-2 py-0.5 text-xs font-medium rounded flex items-center gap-1">
              <span>🌿</span> Organic
            </div>
          )}

          {(product.quantity === 0) && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="bg-white text-gray-900 px-4 py-2 rounded-lg font-semibold text-sm">
                Out of Stock
              </span>
            </div>
          )}

          <button
            onClick={handleShare}
            className="absolute top-2 right-2 bg-white/90 hover:bg-white text-gray-700 hover:text-gray-900 p-2 rounded-full shadow-md hover:shadow-lg transition-all duration-200 opacity-0 group-hover:opacity-100 lg:opacity-100"
            aria-label="Share product"
          >
            <FiShare2 className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3">
          {product.categories?.name && (
            <p className="text-xs text-primary-600 mb-1 font-medium">
              {product.categories.name}
            </p>
          )}
          <h3 className="text-sm text-gray-900 line-clamp-2 mb-1 min-h-[2.5rem] group-hover:text-gray-700 transition-colors">
            {product.name}
          </h3>

          <div className="flex flex-col gap-1">
            {product.compare_at_price && product.compare_at_price > product.price && (
              <div className="text-xs text-gray-400 line-through">
                {formatCurrency(product.compare_at_price)}
              </div>
            )}
            <div className="flex items-baseline gap-1">
              <div className="text-lg font-semibold text-gray-900">
                {formatCurrency(product.price)}
              </div>
              {product.unit_type && (
                <span className="text-xs text-gray-500">/ {unitLabels[product.unit_type] || product.unit_type}</span>
              )}
            </div>
          </div>

          {product.rating_count && product.rating_count > 0 && (
            <div className="flex items-center gap-1 mt-2">
              <div className="flex text-yellow-400">
                {'★'.repeat(Math.round(product.rating_avg || 0))}
                {'☆'.repeat(5 - Math.round(product.rating_avg || 0))}
              </div>
              <span className="text-xs text-gray-500">({product.rating_count})</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
