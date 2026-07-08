'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useCurrency } from '@/contexts/CurrencyContext';
import { convertAndFormatPrice } from '@/lib/currencyFormat';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiPackage } from 'react-icons/fi';
import { useCartStore } from '@/store/cartStore';

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
  const [isHovered, setIsHovered] = useState(false);
  const addToCart = useCartStore((state) => state.addItem);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      productId: product.id,
      title: product.name,
      price: product.price,
      image: product.images?.[0] || '',
      quantity: 1,
    });
  };

  const isOutOfStock = product.quantity === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link href={`/products/${product.id}`} className="block group">
        <div
          className="relative bg-white rounded-2xl overflow-hidden transition-all duration-300"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Image Container */}
          <div className="relative aspect-[4/3] bg-neutral-100 overflow-hidden">
            {product.images?.[0] && !imageError ? (
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full">
                <div className="w-16 h-16 rounded-full bg-neutral-200 flex items-center justify-center">
                  <FiPackage className="w-8 h-8 text-neutral-400" />
                </div>
              </div>
            )}

            {/* Out of Stock Overlay */}
            {isOutOfStock && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <span className="bg-white text-neutral-900 px-4 py-2 rounded-full text-sm font-medium">
                  Out of Stock
                </span>
              </div>
            )}

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {product.is_organic && (
                <span className="bg-primary-900 text-white text-xs font-medium px-2.5 py-1 rounded-full">
                  Organic
                </span>
              )}
            </div>

            {/* Quick Add Button */}
            {!isOutOfStock && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 10 }}
                transition={{ duration: 0.2 }}
                onClick={handleQuickAdd}
                className="absolute bottom-4 right-4 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-primary-900 hover:text-white transition-colors z-10"
              >
                <FiPlus className="w-5 h-5" />
              </motion.button>
            )}
          </div>

          {/* Content */}
          <div className="p-5">
            {product.categories?.name && (
              <p className="text-xs text-neutral-500 font-medium uppercase tracking-wider mb-1.5">
                {product.categories.name}
              </p>
            )}
            <h3 className="text-base font-medium text-neutral-900 mb-2 line-clamp-2 leading-snug group-hover:text-primary-700 transition-colors">
              {product.name}
            </h3>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-semibold text-neutral-900">
                {formatCurrency(product.price)}
              </span>
              {product.unit_type && (
                <span className="text-sm text-neutral-500">
                  /{unitLabels[product.unit_type] || product.unit_type}
                </span>
              )}
            </div>
            {product.compare_at_price && product.compare_at_price > product.price && (
              <span className="text-sm text-neutral-400 line-through ml-2">
                {formatCurrency(product.compare_at_price)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
