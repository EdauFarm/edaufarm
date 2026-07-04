'use client';

import Link from 'next/link';
import Image from 'next/image';
import { FiShoppingCart, FiHeart, FiRefreshCw } from 'react-icons/fi';
import { formatPrice, calculateDiscount } from '@/lib/utils';
import { useCartStore } from '@/store/cartStore';
import { useLanguage } from '@/contexts/LanguageContext';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: {
    _id: string;
    title: string;
    title_fr?: string;
    title_ar?: string;
    description: string;
    description_fr?: string;
    description_ar?: string;
    price: number;
    compareAtPrice?: number;
    images: string[];
    category: string;
    rating: {
      average: number;
      count: number;
    };
    stock: number;
    buybackEnabled?: boolean;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const { language, t } = useLanguage();
  const discount = calculateDiscount(product.price, product.compareAtPrice);

  const getLocalizedTitle = () => {
    if (language === 'fr' && product.title_fr) return product.title_fr;
    if (language === 'ar' && product.title_ar) return product.title_ar;
    return product.title;
  };

  const getLocalizedDescription = () => {
    if (language === 'fr' && product.description_fr) return product.description_fr;
    if (language === 'ar' && product.description_ar) return product.description_ar;
    return product.description;
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (product.stock === 0) {
      toast.error(t('product.outOfStock'));
      return;
    }

    addItem({
      productId: product._id,
      title: getLocalizedTitle(),
      price: product.price,
      image: product.images[0] || '',
      quantity: 1,
    });

    toast.success(t('cart.addedToCart'));
  };

  return (
    <Link href={`/products/${product._id}`} className="block h-full">
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-2xl hover:border-primary-200 transition-all duration-300 group h-full flex flex-col">
        {/* Image Container */}
        <div className="relative h-48 sm:h-56 md:h-64 lg:h-72 xl:h-80 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
          {product.images[0] ? (
            <Image
              src={product.images[0]}
              alt={getLocalizedTitle()}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-contain p-2 group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
              quality={85}
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-100 to-gray-200">
              <svg className="w-20 h-20 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          
          {/* Badges Container */}
          <div className="absolute top-0 left-0 right-0 flex justify-between items-start p-2">
            <div className="flex flex-col gap-2">
              {/* Discount Badge */}
              {discount > 0 && (
                <div className="bg-gradient-to-r from-red-500 to-red-600 text-white px-2.5 py-1 rounded-full text-xs font-bold shadow-lg">
                  -{discount}%
                </div>
              )}
              {/* Buyback Badge */}
              {product.buybackEnabled && (
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-2.5 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                  <FiRefreshCw className="w-3 h-3" />
                  <span>Buyback</span>
                </div>
              )}
            </div>
            <div className="flex-1"></div>
            {/* Stock Badge */}
            {product.stock === 0 && (
              <div className="bg-gray-900 text-white px-2.5 py-1 rounded-full text-xs font-semibold shadow-lg">
                {t('product.outOfStock')}
              </div>
            )}
          </div>

          {/* Quick Actions - Show on hover */}
          <div className="absolute bottom-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button 
              onClick={(e) => {
                e.preventDefault();
                toast.success('Added to wishlist');
              }}
              className="bg-white p-2.5 rounded-full shadow-lg hover:bg-red-50 hover:scale-110 transition-all"
            >
              <FiHeart className="text-red-500 w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-3 sm:p-4 md:p-5 lg:p-6 flex-1 flex flex-col">
          {/* Category Badge */}
          <div className="inline-flex items-center mb-2">
            <span className="text-[10px] sm:text-xs bg-primary-50 text-primary-700 px-2 py-0.5 rounded-md font-medium uppercase tracking-wide">
              {product.category}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 text-xs sm:text-sm md:text-base lg:text-lg min-h-[36px] md:min-h-[40px] lg:min-h-[48px] leading-tight">
            {getLocalizedTitle()}
          </h3>

          {/* Rating & Reviews */}
          <div className="flex items-center gap-1.5 mb-3">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${
                    i < Math.round(product.rating.average)
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-gray-300 fill-gray-300'
                  }`}
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-[10px] sm:text-xs text-gray-600 font-medium">
              ({product.rating.count})
            </span>
          </div>

          {/* Price Section */}
          <div className="mt-auto">
            <div className="flex flex-col gap-1 mb-3">
              <span className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-primary-600">
                {formatPrice(product.price)}
              </span>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <span className="text-xs sm:text-sm text-gray-400 line-through">
                  {formatPrice(product.compareAtPrice)}
                </span>
              )}
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className={`w-full py-2 sm:py-2.5 md:py-3 lg:py-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 text-xs sm:text-sm md:text-base lg:text-lg font-semibold shadow-sm ${
                product.stock === 0
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-primary-600 to-primary-700 text-white hover:from-primary-700 hover:to-primary-800 hover:shadow-md active:scale-95'
              }`}
            >
              <FiShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>{product.stock === 0 ? t('product.outOfStock') : t('product.addToCart')}</span>
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
