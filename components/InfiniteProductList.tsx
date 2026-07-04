'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import ProductCard from './ProductCard';
import LoadingSpinner from './LoadingSpinner';
import ErrorBoundary from './ErrorBoundary';
import axios from 'axios';
import { FiAlertCircle } from 'react-icons/fi';

interface Product {
  id?: string;
  _id?: string;
  name?: string;
  title?: string;
  description?: string;
  price: number;
  compare_at_price?: number;
  images: string[];
  category?: string;
  category_id?: string;
  unit_type?: string;
  is_organic?: boolean;
  rating_avg?: number;
  rating_count?: number;
  quantity?: number;
  rating?: {
    average: number;
    count: number;
  };
  stock?: number;
  categories?: { name: string; slug: string } | null;
}

interface InfiniteProductListProps {
  initialProducts?: Product[];
  category?: string;
  searchQuery?: string;
  sortBy?: string;
}

export default function InfiniteProductList({
  initialProducts = [],
  category,
  searchQuery,
  sortBy = 'createdAt',
}: InfiniteProductListProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const observerTarget = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  // Set mounted on client-side to prevent hydration issues
  useEffect(() => {
    setMounted(true);
    // Shuffle initial products
    setProducts(initialProducts.sort(() => Math.random() - 0.5));
  }, [initialProducts]);

  const loadMoreProducts = useCallback(async () => {
    if (loading || !hasMore || !mounted) return;

    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: (page + 1).toString(),
        limit: '12',
        sortBy,
      });

      if (category) params.append('category', category);
      if (searchQuery) params.append('search', searchQuery);

      const response = await axios.get(`/api/products?${params.toString()}`, {
        timeout: 10000, // 10 second timeout
      });
      
      let newProducts = response.data.products || [];
      // Shuffle new products
      newProducts = newProducts.sort(() => Math.random() - 0.5);

      if (newProducts.length === 0) {
        setHasMore(false);
      } else {
        setProducts((prev) => [...prev, ...newProducts]);
        setPage((prev) => prev + 1);
      }
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to load products. Please try again.');
      // Don't set hasMore to false on error, allow retry
    } finally {
      setLoading(false);
    }
  }, [page, loading, hasMore, category, searchQuery, sortBy, mounted]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (!mounted) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMoreProducts();
        }
      },
      {
        root: null,
        rootMargin: '200px', // Load 200px before reaching the bottom
        threshold: 0.1,
      }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [loadMoreProducts, hasMore, loading, mounted]);

  // Reset when filters change
  useEffect(() => {
    if (mounted) {
      setProducts(initialProducts);
      setPage(1);
      setHasMore(true);
      setError(null);
    }
  }, [category, searchQuery, sortBy, initialProducts, mounted]);

  if (!mounted) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 mb-8">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl h-80 animate-pulse"></div>
        ))}
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div>
        {/* Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 mb-8">
          {products.map((product) => (
            <ErrorBoundary
              key={product.id || product._id}
              fallback={
                <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 flex flex-col items-center justify-center aspect-square">
                  <FiAlertCircle className="w-8 h-8 text-gray-400 mb-2" />
                  <p className="text-xs text-gray-500 text-center">Unable to load product</p>
                </div>
              }
            >
              <ProductCard
                product={{
                  id: product.id || product._id || '',
                  name: product.name || product.title || 'Product',
                  price: product.price,
                  compare_at_price: product.compare_at_price,
                  images: product.images || [],
                  category_id: product.category_id,
                  unit_type: product.unit_type,
                  is_organic: product.is_organic,
                  rating_avg: product.rating_avg || product.rating?.average || 0,
                  rating_count: product.rating_count || product.rating?.count || 0,
                  quantity: product.quantity ?? product.stock ?? 0,
                  categories: product.categories,
                }}
              />
            </ErrorBoundary>
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex flex-col items-center justify-center py-8 px-4 bg-red-50 border border-red-200 rounded-xl mb-8">
            <FiAlertCircle className="w-8 h-8 text-red-600 mb-2" />
            <p className="text-sm text-red-800 text-center mb-3">{error}</p>
            <button
              onClick={() => {
                setError(null);
                loadMoreProducts();
              }}
              className="px-4 py-2 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-lg hover:shadow-lg transition-all text-sm font-medium"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Loading Indicator */}
        {loading && (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        )}

        {/* Intersection Observer Target */}
        <div ref={observerTarget} className="h-10" />

        {/* No Products Found */}
        {products.length === 0 && !loading && !error && (
          <div className="text-center py-16">
            <p className="text-xl text-gray-600">No products found</p>
            <p className="text-sm text-gray-500 mt-2">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}
