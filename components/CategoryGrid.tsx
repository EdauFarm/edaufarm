'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  FiZap, FiSmartphone, FiMonitor, FiPackage, 
  FiTruck, FiShoppingBag, FiDollarSign, FiGift,
  FiStar, FiHeart, FiCpu, FiShield
} from 'react-icons/fi';
import axios from 'axios';
import { formatPrice } from '@/lib/utils';

interface Category {
  name: string;
  icon: any;
  href: string;
  badge?: string;
  bgColor: string;
  textColor: string;
}

const categories: Category[] = [
  { 
    name: 'Electronics', 
    icon: FiSmartphone, 
    href: '/products?category=Electronics',
    bgColor: 'bg-white',
    textColor: 'text-gray-900',
  },
  { 
    name: 'Laptops', 
    icon: FiMonitor, 
    href: '/products?category=Laptops',
    bgColor: 'bg-white',
    textColor: 'text-gray-900',
  },
  { 
    name: 'Smart Devices', 
    icon: FiCpu, 
    href: '/products?category=Smart%20Devices',
    bgColor: 'bg-white',
    textColor: 'text-gray-900',
  },
  { 
    name: 'Printers', 
    icon: FiPackage, 
    href: '/products?category=Printers',
    bgColor: 'bg-white',
    textColor: 'text-gray-900',
  },
  { 
    name: 'Gaming Chairs', 
    icon: FiStar, 
    href: '/products?category=Gaming%20Chairs',
    badge: 'NEW',
    bgColor: 'bg-white',
    textColor: 'text-gray-900',
  },
  { 
    name: 'Office Chairs', 
    icon: FiShield, 
    href: '/products?category=Office%20Chairs',
    bgColor: 'bg-white',
    textColor: 'text-gray-900',
  },
  { 
    name: 'Vacuum Cleaners', 
    icon: FiTruck, 
    href: '/products?category=Vacuum%20Cleaners',
    bgColor: 'bg-white',
    textColor: 'text-gray-900',
  },
  { 
    name: 'Refrigerators', 
    icon: FiPackage, 
    href: '/products?category=Refrigerators',
    bgColor: 'bg-white',
    textColor: 'text-gray-900',
  },
  { 
    name: 'Flash Sales', 
    icon: FiZap, 
    href: '/flash-sales',
    badge: 'SALE',
    bgColor: 'bg-red-600',
    textColor: 'text-white',
  },
];

export default function CategoryGrid() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get('/api/products', { 
        params: { limit: 8, sortBy: 'createdAt', order: 'desc' } 
      });
      if (res.data.success && res.data.products) {
        setProducts(res.data.products);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  // Deduplicate categories by name
  const uniqueCategories = Array.from(
    new Map(categories.map(cat => [(cat.name || '').toLowerCase(), cat])).values()
  );
  return (
    <section className="my-8">
      {/* Product Strip (Top Row) - Desktop only */}
      <div className="mb-4 bg-white rounded-lg shadow-sm p-4 overflow-x-auto hidden md:block">
        <div className="flex space-x-4 min-w-max">
          {loading ? (
            // Loading skeleton
            [1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
              <div key={item} className="flex flex-col items-center space-y-2 w-32">
                <div className="w-24 h-24 bg-gray-200 rounded-lg animate-pulse"></div>
                <div className="w-20 h-3 bg-gray-200 rounded animate-pulse"></div>
                <div className="w-16 h-3 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))
          ) : products.length > 0 ? (
            products.map((product) => (
              <Link 
                key={product._id} 
                href={`/products/${product._id}`}
                className="flex flex-col items-center space-y-2 w-32 hover:shadow-lg transition-shadow rounded-lg p-2"
              >
                <div className="w-24 h-24 bg-gray-100 rounded-lg relative overflow-hidden">
                  {product.images[0] ? (
                    <Image
                      src={product.images[0]}
                      alt={product.title}
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-700 text-center line-clamp-2 font-medium h-8">
                  {product.title}
                </p>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-bold text-orange-600">
                    {formatPrice(product.price)}
                  </span>
                  {product.compareAtPrice && product.compareAtPrice > product.price && (
                    <span className="text-xs text-gray-400 line-through">
                      {formatPrice(product.compareAtPrice)}
                    </span>
                  )}
                </div>
              </Link>
            ))
          ) : (
            <div className="w-full text-center py-8 text-gray-500">
              No products available
            </div>
          )}
        </div>
      </div>

      {/* Category Discovery Grid */}
      <div className="bg-gradient-to-br from-yellow-300 via-yellow-400 to-orange-400 rounded-lg shadow-xl p-4 md:p-8">
        <h2 className="text-center text-xl md:text-3xl font-bold text-gray-900 mb-4 md:mb-6">
          Shop by Category
        </h2>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
          {uniqueCategories.map((category, index) => (
            <Link
              key={index}
              href={category.href}
              className="group relative"
            >
              <div className={`${category.bgColor} rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-lg hover:shadow-2xl transition-all active:scale-95 md:hover:scale-105 cursor-pointer flex flex-col items-center justify-center aspect-square relative overflow-hidden`}>
                {/* Badge */}
                {category.badge && (
                  <div className="absolute top-1 right-1 md:top-2 md:right-2 bg-white text-gray-900 px-1.5 md:px-2 py-0.5 rounded-full text-[9px] md:text-[10px] font-bold shadow-md">
                    {category.badge}
                  </div>
                )}

                {/* Icon */}
                <category.icon className={`w-8 h-8 md:w-12 md:h-12 mb-2 md:mb-3 ${category.textColor} group-hover:scale-110 transition-transform`} />

                {/* Label */}
                <div className="bg-white rounded-full px-2 md:px-4 py-1 md:py-1.5 shadow-md">
                  <span className="text-xs md:text-sm font-bold text-gray-900 line-clamp-1">
                    {category.name}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
