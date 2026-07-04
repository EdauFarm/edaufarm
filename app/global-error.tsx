'use client';

import { useEffect } from 'react';

export default function GlobalError({
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
    <html>
      <body>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
            <div className="mb-8">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-12 h-12 text-gray-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3">
                Critical Error
              </h1>
              <p className="text-gray-600 mb-6">
                A critical error occurred. Please refresh the page or try again later.
              </p>
              {process.env.NODE_ENV === 'development' && error.message && (
                <div className="mt-4 p-4 bg-gray-50 border border-gray-300 rounded-lg text-left">
                  <p className="text-xs font-mono text-gray-800 break-all">
                    {error.message}
                  </p>
                </div>
              )}
            </div>
            <button
              onClick={reset}
              className="px-6 py-3 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all font-semibold"
            >
              Try Again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
