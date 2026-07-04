'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { formatPrice } from '@/lib/utils';
import axios from 'axios';

interface SponsoredProduct {
  _id: string;
  title: string;
  images: string[];
  price: number;
  compareAtPrice?: number;
  brand?: string;
  rating: { average: number; count: number };
}

export default function SponsoredProducts() {
  const [products, setProducts] = useState<SponsoredProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get('/api/products?limit=6&sort=rating');
        setProducts(res.data.products || []);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (loading) {
    return (
      <section className="my-12 animate-pulse">
        <div className="bg-gray-200 h-8 w-64 rounded mb-6"></div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-gray-200 h-64 rounded-lg"></div>
          ))}
        </div>
      </section>
    );
  }

  const calculateDiscount = (price: number, compareAt?: number) => {
    if (!compareAt) return 0;
    return Math.round(((compareAt - price) / compareAt) * 100);
  };

  if (products.length === 0) {
    return (
      <section className="my-12">
        <div className="text-center text-gray-500 py-8">
          <p>No sponsored products available at the moment.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="my-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900">
          Sponsored Products
        </h2>
        <Link
          href="/products?sponsored=true"
          className="text-orange-600 hover:text-orange-700 font-medium text-sm transition-colors"
        >
          View All →
        </Link>
      </div>

      {/* Products Grid - Desktop */}
      <div className="hidden md:grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {products.map((product) => {
          const discount = calculateDiscount(product.price, product.compareAtPrice);
          
          return (
            <Link
              key={product._id}
              href={`/products/${product._id}`}
              className="bg-white rounded-lg border border-gray-200 p-3 hover:shadow-lg transition-all hover:border-orange-500 group flex flex-col min-w-0"
            >
              {/* Product Image */}
              <div className="relative w-full h-32 mb-3 bg-gray-100 rounded-lg overflow-hidden">
                <Image
                  src={product.images[0]}
                  alt={product.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 16vw"
                />
                {discount > 0 && (
                  <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-bold">
                    -{discount}%
                  </div>
                )}
              </div>

              {/* Product Details */}
              <div className="min-w-0">
                {product.brand && (
                  <p className="text-xs text-gray-500 mb-1 truncate">{product.brand}</p>
                )}
                <h3 className="text-xs font-medium text-gray-900 mb-2 line-clamp-2 min-h-[2rem] break-words">
                  {product.title}
                </h3>

                {/* Price */}
                <div className="flex flex-col gap-1 mb-2">
                  <span className="text-orange-600 font-bold text-sm truncate">
                    {formatPrice(product.price)}
                  </span>
                  {product.compareAtPrice && (
                    <span className="text-gray-400 text-xs line-through truncate">
                      {formatPrice(product.compareAtPrice)}
                    </span>
                  )}
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-3 h-3 ${
                          i < Math.floor(product.rating.average)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                        viewBox="0 0 20 20"
                      >
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-xs text-gray-500">
                    ({product.rating.count})
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Products List - Mobile Vertical Scroll */}
      <div className="md:hidden space-y-3">
        {products.map((product) => {
          const discount = calculateDiscount(product.price, product.compareAtPrice);
          
          return (
            <Link
              key={product._id}
              href={`/products/${product._id}`}
              className="flex bg-white rounded-lg border border-gray-200 p-3 hover:shadow-md transition-shadow"
            >
              {/* Product Image */}
              <div className="relative w-24 h-24 flex-shrink-0 mr-3 bg-gray-100 rounded-lg overflow-hidden">
                <Image
                  src={product.images[0]}
                  alt={product.title}
                  fill
                  className="object-cover"
                  sizes="96px"
                />
                {discount > 0 && (
                  <div className="absolute top-1 right-1 bg-red-500 text-white px-1.5 py-0.5 rounded text-xs font-bold">
                    -{discount}%
                  </div>
                )}
              </div>

              {/* Product Details */}
              <div className="flex-1 min-w-0">
                {product.brand && (
                  <p className="text-xs text-gray-500 mb-1 truncate">{product.brand}</p>
                )}
                <h3 className="text-xs font-medium text-gray-900 mb-2 line-clamp-2 break-words">
                  {product.title}
                </h3>

                {/* Price */}
                <div className="flex flex-col gap-1 mb-1">
                  <span className="text-orange-600 font-bold text-sm truncate">
                    {formatPrice(product.price)}
                  </span>
                  {product.compareAtPrice && (
                    <span className="text-gray-400 text-xs line-through truncate">
                      {formatPrice(product.compareAtPrice)}
                    </span>
                  )}
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-3 h-3 ${
                          i < Math.floor(product.rating.average)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                        viewBox="0 0 20 20"
                      >
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-xs text-gray-500">
                    ({product.rating.count})
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
