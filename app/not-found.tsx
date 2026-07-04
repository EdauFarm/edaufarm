'use client';

import Link from 'next/link';
import { FiHome, FiSearch, FiArrowLeft } from 'react-icons/fi';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
        {/* 404 Animation */}
        <div className="mb-8">
          <h1 className="text-9xl font-bold bg-gradient-to-r from-gray-200 to-gray-300 bg-clip-text text-transparent animate-pulse">404</h1>
          <div className="relative -mt-16">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 bg-gray-100 rounded-full animate-ping" />
            </div>
            <div className="relative">
              <FiSearch className="w-24 h-24 text-gray-700 mx-auto" />
            </div>
          </div>
        </div>

        {/* Message */}
        <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3">
          Page Not Found
        </h2>
        <p className="text-gray-600 mb-8">
          Oops! The page you're looking for doesn't exist. It might have been moved or deleted.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all font-semibold"
          >
            <FiHome className="w-5 h-5" />
            Go Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium border border-gray-300 hover:border-gray-400"
          >
            <FiArrowLeft className="w-5 h-5" />
            Go Back
          </button>
        </div>

        {/* Helpful Links */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4">You might be looking for:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            <Link href="/products" className="text-sm text-gray-900 hover:text-gray-700 font-semibold hover:underline">
              Products
            </Link>
            <span className="text-gray-300">•</span>
            <Link href="/flash-sales" className="text-sm text-gray-900 hover:text-gray-700 font-semibold hover:underline">
              Flash Sales
            </Link>
            <span className="text-gray-300">•</span>
            <Link href="/help" className="text-sm text-gray-900 hover:text-gray-700 font-semibold hover:underline">
              Help Center
            </Link>
            <span className="text-gray-300">•</span>
            <Link href="/cart" className="text-sm text-gray-900 hover:text-gray-700 font-semibold hover:underline">
              Shopping Cart
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
