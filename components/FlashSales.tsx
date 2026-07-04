'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiZap, FiArrowRight, FiClock, FiAlertCircle, FiPackage } from 'react-icons/fi';
import { useCurrency } from '@/contexts/CurrencyContext';
import axios from 'axios';

interface SeasonalProduct {
  id: string;
  name: string;
  images: string[];
  price: number;
  compare_at_price?: number;
  quantity: number;
  unit_type?: string;
  is_organic?: boolean;
  categories?: { name: string } | null;
}

export default function FlashSales() {
  const { currency } = useCurrency();
  const formatCurrency = (amount: number, fromCurrency: string = 'KES') =>
    require('@/lib/currencyFormat').convertAndFormatPrice(
      amount,
      fromCurrency,
      currency.code
    );

  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [seasonalProducts, setSeasonalProducts] = useState<SeasonalProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const handleImageError = (productId: string) => {
    setImageErrors(prev => ({ ...prev, [productId]: true }));
  };

  const calculateDiscount = (price: number, compareAt?: number) => {
    if (!compareAt) return 0;
    return Math.round(((compareAt - price) / compareAt) * 100);
  };

  const calculateTimeLeft = useCallback(() => {
    const now = new Date();
    const kenyaTime = new Date(now.toLocaleString('en-US', { timeZone: 'Africa/Nairobi' }));

    const currentHour = kenyaTime.getHours();
    const nextCycle = new Date(kenyaTime);

    if (currentHour < 12) {
      nextCycle.setHours(12, 0, 0, 0);
    } else {
      nextCycle.setDate(nextCycle.getDate() + 1);
      nextCycle.setHours(0, 0, 0, 0);
    }

    const diff = nextCycle.getTime() - kenyaTime.getTime();

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return { hours, minutes, seconds };
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setError(null);
        const res = await axios.get('/api/products', {
          params: {
            featured: 'true',
            limit: 6,
            timestamp: Date.now()
          },
          timeout: 8000,
        });
        let products = res.data.products || [];
        products = products.sort(() => Math.random() - 0.5);
        setSeasonalProducts(products);
      } catch (error: any) {
        setError('Failed to load seasonal harvest deals');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      const newTime = calculateTimeLeft();
      setTimeLeft(newTime);

      if (newTime.hours === 0 && newTime.minutes === 0 && newTime.seconds === 0) {
        window.location.reload();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [calculateTimeLeft]);

  const formatTime = (num: number) => String(num).padStart(2, '0');

  if (loading) {
    return (
      <section className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg shadow-xl overflow-hidden my-8 h-64 animate-pulse">
        <div className="bg-white/10 h-full"></div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg shadow-xl overflow-hidden my-8">
        <div className="p-8 text-center">
          <FiAlertCircle className="w-12 h-12 text-white mx-auto mb-4" />
          <h3 className="text-white text-lg font-semibold mb-2">Seasonal Harvest Temporarily Unavailable</h3>
          <p className="text-primary-100 text-sm">We'll be back with fresh farm deals soon!</p>
        </div>
      </section>
    );
  }

  if (seasonalProducts.length === 0) {
    return null;
  }

  return (
    <section className="bg-gradient-to-r from-amber-600 to-amber-700 rounded-lg shadow-xl overflow-hidden my-8">
      <div className="flex flex-col sm:flex-row items-center justify-between px-4 md:px-6 py-3 md:py-4 bg-amber-700 gap-3">
        <div className="flex items-center space-x-2 md:space-x-3">
          <FiZap className="w-5 h-5 md:w-6 md:h-6 text-yellow-300 animate-pulse" />
          <h2 className="text-white font-bold text-lg md:text-2xl">Seasonal Harvest Deals</h2>
          <span className="bg-yellow-400 text-amber-800 px-2 md:px-3 py-0.5 md:py-1 rounded-full text-xs md:text-sm font-bold animate-pulse">
            FRESH
          </span>
        </div>

        <div className="flex items-center space-x-2 md:space-x-3">
          <FiClock className="w-4 h-4 text-white hidden sm:inline" />
          <span className="text-white text-xs md:text-sm font-medium">Harvest ends in:</span>
          <div className="flex space-x-1 md:space-x-2">
            <div className="bg-white text-amber-700 px-2 md:px-3 py-1.5 md:py-2 rounded-md font-bold text-xs md:text-base min-w-[2.5rem] md:min-w-[3rem] text-center shadow-md">
              {formatTime(timeLeft.hours)}
              <div className="text-[8px] md:text-[10px] text-gray-600 font-normal">HRS</div>
            </div>
            <span className="text-white text-base md:text-xl font-bold self-center">:</span>
            <div className="bg-white text-amber-700 px-2 md:px-3 py-1.5 md:py-2 rounded-md font-bold text-xs md:text-base min-w-[2.5rem] md:min-w-[3rem] text-center shadow-md">
              {formatTime(timeLeft.minutes)}
              <div className="text-[8px] md:text-[10px] text-gray-600 font-normal">MIN</div>
            </div>
            <span className="text-white text-base md:text-xl font-bold self-center">:</span>
            <div className="bg-white text-amber-700 px-2 md:px-3 py-1.5 md:py-2 rounded-md font-bold text-xs md:text-base min-w-[2.5rem] md:min-w-[3rem] text-center shadow-md">
              {formatTime(timeLeft.seconds)}
              <div className="text-[8px] md:text-[10px] text-gray-600 font-normal">SEC</div>
            </div>
          </div>
        </div>

        <Link
          href="/products?featured=true"
          className="hidden lg:flex items-center space-x-2 text-white hover:text-yellow-300 transition-colors font-medium"
        >
          <span>See All</span>
          <FiArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="bg-white p-4 md:p-6 hidden md:block">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {seasonalProducts.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className="group bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all hover:scale-105 hover:border-amber-500"
            >
              <div className="relative aspect-square bg-gradient-to-br from-amber-50 to-yellow-50">
                {product.compare_at_price && (
                  <div className="absolute top-2 left-2 z-10 bg-red-600 text-white px-2 py-1 rounded-md font-bold text-sm">
                    -{calculateDiscount(product.price, product.compare_at_price)}%
                  </div>
                )}

                {product.is_organic && (
                  <div className="absolute top-2 right-2 z-10 bg-primary-600 text-white px-2 py-1 rounded-md font-bold text-xs">
                    Organic
                  </div>
                )}

                {product.images[0] && !imageErrors[product.id] ? (
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 16vw"
                    onError={() => handleImageError(product.id)}
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-2">
                    <div className="w-12 h-12 mb-2 rounded-full bg-gradient-to-br from-primary-600 to-primary-700 flex items-center justify-center">
                      <FiPackage className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-xs text-gray-500 text-center">Edau Farm</p>
                  </div>
                )}
              </div>

              <div className="p-3 min-w-0">
                {product.categories?.name && (
                  <p className="text-[10px] text-primary-600 font-medium mb-1">{product.categories.name}</p>
                )}
                <h3 className="text-xs font-medium text-gray-800 mb-2 line-clamp-2 group-hover:text-primary-700 transition-colors break-words h-8">
                  {product.name}
                </h3>

                <div className="flex flex-col gap-1 mb-2">
                  <span className="text-sm font-bold text-primary-700">
                    {formatCurrency(product.price)}
                  </span>
                  {product.compare_at_price && (
                    <span className="text-xs text-gray-500 line-through">
                      {formatCurrency(product.compare_at_price)}
                    </span>
                  )}
                </div>

                <div className="mt-2">
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>{product.quantity} in stock</span>
                    <span className="text-primary-600 font-semibold">Order Now!</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className="bg-primary-600 h-1.5 rounded-full transition-all"
                      style={{ width: `${Math.min((product.quantity / 50) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="bg-white p-4 md:hidden overflow-x-auto scrollbar-hide" style={{ touchAction: 'pan-y pan-x' }}>
        <div className="flex space-x-3 pb-2" style={{ width: 'max-content' }}>
          {seasonalProducts.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className="group bg-white rounded-lg border border-gray-200 overflow-hidden active:scale-95 flex-shrink-0"
              style={{ width: '140px' }}
            >
              <div className="relative aspect-square bg-gradient-to-br from-amber-50 to-yellow-50">
                {product.compare_at_price && (
                  <div className="absolute top-1.5 left-1.5 z-10 bg-red-600 text-white px-1.5 py-0.5 rounded-md font-bold text-xs">
                    -{calculateDiscount(product.price, product.compare_at_price)}%
                  </div>
                )}

                {product.is_organic && (
                  <div className="absolute top-1.5 right-1.5 z-10 bg-primary-600 text-white px-1.5 py-0.5 rounded-md font-bold text-[10px]">
                    Organic
                  </div>
                )}

                {product.images[0] && !imageErrors[product.id] ? (
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="140px"
                    onError={() => handleImageError(product.id)}
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-2">
                    <div className="w-10 h-10 mb-1 rounded-full bg-gradient-to-br from-primary-600 to-primary-700 flex items-center justify-center">
                      <FiPackage className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-[10px] text-gray-500 text-center">Edau Farm</p>
                  </div>
                )}
              </div>

              <div className="p-2 min-w-0">
                <h3 className="text-xs font-medium text-gray-800 mb-1.5 line-clamp-2 h-8 break-words">
                  {product.name}
                </h3>

                <div className="flex flex-col gap-0.5 mb-1.5">
                  <span className="text-xs font-bold text-primary-700">
                    {formatCurrency(product.price)}
                  </span>
                  {product.compare_at_price && (
                    <span className="text-[10px] text-gray-500 line-through">
                      {formatCurrency(product.compare_at_price)}
                    </span>
                  )}
                </div>

                <div className="mt-1.5">
                  <div className="flex justify-between text-[10px] text-gray-600 mb-0.5">
                    <span>{product.quantity} left</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1">
                    <div
                      className="bg-primary-600 h-1 rounded-full"
                      style={{ width: `${Math.min((product.quantity / 50) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <Link
          href="/products?featured=true"
          className="flex items-center justify-center space-x-2 mt-3 text-primary-700 font-semibold text-sm py-2 border border-primary-600 rounded-lg active:scale-95"
        >
          <span>See All Harvest Deals</span>
          <FiArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}
