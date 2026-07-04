'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { FiAlertTriangle, FiHome, FiRefreshCw } from 'react-icons/fi';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
        {/* Error Icon */}
        <div className="mb-8 relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 bg-gray-200 rounded-full animate-pulse" />
          </div>
          <div className="relative">
            <FiAlertTriangle className="w-24 h-24 text-gray-700 mx-auto" />
          </div>
        </div>

        {/* Error Message */}
        <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3">
          Something went wrong!
        </h2>
        <p className="text-gray-600 mb-2">
          We encountered an unexpected error. Don't worry, we're working on it.
        </p>
        
        {/* Error Details (Development only) */}
        {process.env.NODE_ENV === 'development' && error.message && (
          <div className="mt-4 mb-6 p-4 bg-gray-50 border border-gray-300 rounded-lg text-left">
            <p className="text-xs font-mono text-gray-800 break-all">
              {error.message}
            </p>
            {error.digest && (
              <p className="text-xs font-mono text-gray-600 mt-2">
                Error ID: {error.digest}
              </p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all font-semibold"
          >
            <FiRefreshCw className="w-5 h-5" />
            Try Again
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium border border-gray-300 hover:border-gray-400"
          >
            <FiHome className="w-5 h-5" />
            Go Home
          </Link>
        </div>

        {/* Help Text */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            If this problem persists, please{' '}
            <Link href="/help" className="text-gray-900 hover:text-gray-700 underline font-semibold">
              contact our support team
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
