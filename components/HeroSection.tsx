'use client';

import Link from 'next/link';
import { FiArrowRight, FiShield, FiTruck, FiRefreshCw } from 'react-icons/fi';

export default function HeroSection() {
  return (
    <section className="bg-gradient-to-br from-gray-50 to-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-6">
            <div className="inline-block">
              <span className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                New Arrivals
              </span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              Premium Electronics
            </h1>
            
            <p className="text-lg text-gray-600 max-w-xl">
              Quality gadgets at competitive prices.
            </p>
            
            <div className="flex flex-wrap gap-4 pt-4">
              <Link 
                href="/products" 
                className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium"
              >
                Shop Now
                <FiArrowRight className="w-4 h-4" />
              </Link>
              <Link 
                href="/products?category=Flash%20Sales" 
                className="inline-flex items-center gap-2 bg-white text-gray-900 px-6 py-3 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors font-medium"
              >
                View Deals
              </Link>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 pt-8">
              <div className="space-y-1">
                <FiShield className="w-5 h-5 text-gray-700" />
                <p className="text-xs text-gray-600 font-medium">Secure Payment</p>
              </div>
              <div className="space-y-1">
                <FiTruck className="w-5 h-5 text-gray-700" />
                <p className="text-xs text-gray-600 font-medium">Fast Delivery</p>
              </div>
              <div className="space-y-1">
                <FiRefreshCw className="w-5 h-5 text-gray-700" />
                <p className="text-xs text-gray-600 font-medium">Easy Returns</p>
              </div>
            </div>
          </div>

          {/* Right Content - Featured Product */}
          <div className="hidden lg:block">
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-50 rounded-2xl overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="text-6xl">💻</div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold text-gray-900">Latest Laptops</h3>
                      <p className="text-sm text-gray-600">Starting from KSh 45,000</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating Badge */}
              <div className="absolute -top-4 -right-4 bg-red-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
                Up to 30% OFF
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
