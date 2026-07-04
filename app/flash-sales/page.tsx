'use client';

import { useState, useEffect } from 'react';
import ProductCard from '@/components/ProductCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import { FiZap, FiClock, FiPackage } from 'react-icons/fi';
import axios from 'axios';

export default function FlashSalesPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // Calculate time left until next 12-hour flash sale cycle (midnight or noon in Kenyan time)
  const calculateTimeLeft = () => {
    // Get current time in Kenyan timezone (EAT - UTC+3)
    const now = new Date();
    const kenyaTime = new Date(now.toLocaleString('en-US', { timeZone: 'Africa/Nairobi' }));
    
    const currentHour = kenyaTime.getHours();
    
    // Determine next cycle time (midnight 00:00 or noon 12:00)
    const nextCycle = new Date(kenyaTime);
    
    if (currentHour < 12) {
      // Before noon - next cycle is 12:00 (noon)
      nextCycle.setHours(12, 0, 0, 0);
    } else {
      // After noon - next cycle is midnight (00:00 next day)
      nextCycle.setDate(nextCycle.getDate() + 1);
      nextCycle.setHours(0, 0, 0, 0);
    }
    
    const diff = nextCycle.getTime() - kenyaTime.getTime();
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    return { hours, minutes, seconds };
  };

  // Fetch flash sale products (featured products) and shuffle them
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get('/api/products', {
          params: {
            featured: 'true',
            limit: 24,
            timestamp: Date.now() // Prevent caching
          }
        });
        
        // Shuffle products for randomization
        const shuffled = [...(res.data.products || [])].sort(() => Math.random() - 0.5);
        setProducts(shuffled);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
    
    // Refresh products every 5 minutes to show different items
    const refreshInterval = setInterval(() => {
      fetchProducts();
    }, 5 * 60 * 1000); // 5 minutes
    
    return () => clearInterval(refreshInterval);
  }, []);

  // Initialize and update countdown timer with high accuracy
  useEffect(() => {
    // Set initial time
    setTimeLeft(calculateTimeLeft());

    // Update every second with exact timing
    const timer = setInterval(() => {
      const newTime = calculateTimeLeft();
      setTimeLeft(newTime);
      
      // Auto-refresh products when cycle ends (00:00 or 12:00)
      if (newTime.hours === 0 && newTime.minutes === 0 && newTime.seconds === 0) {
        window.location.reload();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (num: number) => String(num).padStart(2, '0');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white py-8 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <FiZap className="w-12 h-12 text-yellow-300 animate-pulse" />
              <div>
                <h1 className="text-4xl font-bold">Flash Sales</h1>
                <p className="text-red-100 mt-1">Limited time offers - Don't miss out!</p>
              </div>
            </div>

            {/* Countdown Timer */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center gap-2">
                <FiClock className="w-5 h-5" />
                <span className="text-lg font-medium">Ends In:</span>
              </div>
              <div className="flex space-x-2">
                <div className="bg-white text-red-600 px-4 py-3 rounded-lg font-bold text-2xl min-w-[4rem] text-center shadow-md">
                  {formatTime(timeLeft.hours)}
                  <div className="text-xs text-gray-600 font-normal">Hours</div>
                </div>
                <span className="text-3xl font-bold">:</span>
                <div className="bg-white text-red-600 px-4 py-3 rounded-lg font-bold text-2xl min-w-[4rem] text-center shadow-md">
                  {formatTime(timeLeft.minutes)}
                  <div className="text-xs text-gray-600 font-normal">Minutes</div>
                </div>
                <span className="text-3xl font-bold">:</span>
                <div className="bg-white text-red-600 px-4 py-3 rounded-lg font-bold text-2xl min-w-[4rem] text-center shadow-md">
                  {formatTime(timeLeft.seconds)}
                  <div className="text-xs text-gray-600 font-normal">Seconds</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <FiZap className="w-24 h-24 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-600 mb-2">No Flash Sales Active</h2>
            <p className="text-gray-500">Check back soon for amazing deals!</p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {products.length} Amazing Deals Available
              </h2>
              <p className="text-gray-600 mt-1">Hurry! Limited stock available</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export const dynamic = 'force-dynamic';
