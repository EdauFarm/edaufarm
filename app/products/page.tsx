'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import CategoryFilter from '@/components/CategoryFilter';
import MobileFilter from '@/components/MobileFilter';
import LoadingSpinner from '@/components/LoadingSpinner';
import { FiTrendingUp, FiDollarSign, FiStar, FiType, FiShuffle, FiPackage } from 'react-icons/fi';
import axios from 'axios';

function ProductsContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    searchParams.get('category')
  );
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || searchParams.get('search') || '');
  const [sortBy, setSortBy] = useState('createdAt');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [shuffleProducts, setShuffleProducts] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Focus search input if focus param is present (for mobile)
  useEffect(() => {
    if (searchParams.get('focus') && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [searchParams]);

  // Sync URL params with state on mount and when URL changes
  useEffect(() => {
    const category = searchParams.get('category');
    const search = searchParams.get('q') || searchParams.get('search');
    
    
    setSelectedCategory(category);
    setSearchQuery(search || '');
    setPage(1); // Reset to first page on filter change
  }, [searchParams]);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
    
    // Auto-refresh products every 30 seconds for price updates
    const interval = setInterval(() => {
      fetchProducts();
    }, 30000);

    return () => clearInterval(interval);
  }, [selectedCategory, searchQuery, sortBy, page, shuffleProducts]);

  const fetchCategories = async () => {
    try {
      const res = await axios.get('/api/products/categories');
      setCategories(res.data.categories);
    } catch (error) {
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    
    try {
      const params: any = { 
        page,
        limit: 12,
        // Force no cache
        timestamp: Date.now()
      };
      
      // Handle sorting - extract field and order from sortBy value
      if (sortBy.startsWith('-')) {
        params.sortBy = sortBy.substring(1);
        params.order = 'desc';
      } else if (sortBy === 'price-low') {
        params.sort = 'price-low';
      } else if (sortBy === 'price-high') {
        params.sort = 'price-high';
      } else if (sortBy === 'rating') {
        params.sort = 'rating';
      } else {
        params.sortBy = sortBy;
        params.order = 'desc';
      }
      
      if (selectedCategory) {
        // Normalize category - capitalize first letter
        const normalizedCategory = selectedCategory
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        params.category = normalizedCategory;
      }
      if (searchQuery) params.search = searchQuery;

      const res = await axios.get('/api/products', { 
        params,
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      
      let fetchedProducts = res.data.products || [];
      
      // Shuffle products if enabled
      if (shuffleProducts && fetchedProducts.length > 0) {
        fetchedProducts = [...fetchedProducts].sort(() => Math.random() - 0.5);
      }
      
      setProducts(fetchedProducts);
      setTotalPages(res.data.pagination?.pages || 1);
    } catch (error) {
      setProducts([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header with Search Input for Mobile */}
      <div className="mb-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">Products</h1>
            {selectedCategory && (
              <p className="text-gray-600 flex items-center gap-2">
                <span className="px-3 py-1 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-900 rounded-full text-sm font-medium border border-gray-300">
                  {selectedCategory}
                </span>
              </p>
            )}
          </div>
          {/* Search input visible on mobile */}
          <form
            className="w-full sm:w-auto mt-2 sm:mt-0 flex items-center gap-2"
            onSubmit={e => {
              e.preventDefault();
              setPage(1);
              // Optionally update URL params here
            }}
          >
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="block w-full sm:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-200 transition-all bg-white text-sm"
              style={{ fontSize: '1rem' }} // Prevent iOS zoom
            />
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-lg font-semibold text-sm hover:shadow-md transition-all"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Mobile Filter Button */}
      <div className="md:hidden mb-4">
        <MobileFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => {
            setSelectedCategory(cat);
            setPage(1);
          }}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />
      </div>

      <div className="grid md:grid-cols-4 gap-8">
        {/* Desktop Sidebar */}
        <div className="hidden md:block md:col-span-1">
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={(cat) => {
              setSelectedCategory(cat);
              setPage(1);
            }}
          />

          {/* Sort Options */}
          <div className="bg-white border border-gray-200 rounded p-5 mt-4">
            <h3 className="font-semibold text-lg mb-4 text-gray-900">Sort By</h3>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1);
              }}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-200 transition-all bg-white cursor-pointer"
            >
              <option value="createdAt">Newest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="title">Name: A to Z</option>
            </select>
            
            {/* Shuffle Toggle */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <label className="flex items-center justify-between cursor-pointer group">
                <div className="flex items-center space-x-2">
                  <FiShuffle className="w-4 h-4 text-gray-600 group-hover:text-gray-900 transition-colors" />
                  <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
                    Shuffle Results
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={shuffleProducts}
                    onChange={(e) => {
                      setShuffleProducts(e.target.checked);
                      setPage(1);
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-800"></div>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="md:col-span-3">
          {searchQuery && (
            <div className="mb-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-300 rounded-xl">
              <p className="text-gray-700">
                Search results for: <strong className="text-gray-900">&quot;{searchQuery}&quot;</strong>
                {products.length > 0 && (
                  <span className="ml-2 text-gray-600">({products.length} found)</span>
                )}
              </p>
            </div>
          )}

          {loading ? (
            <LoadingSpinner branded={true} />
          ) : products.length === 0 ? (
            <div className="text-center py-20 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
              <FiPackage className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-xl font-medium mb-2">No products found</p>
              <p className="text-gray-500 text-sm">Try adjusting your filters or search terms</p>
              {(selectedCategory || searchQuery) && (
                <button
                  onClick={() => {
                    setSelectedCategory(null);
                    setSearchQuery('');
                    setPage(1);
                  }}
                  className="mt-4 px-6 py-2 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300 font-semibold"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-3 gap-3 sm:gap-4 md:gap-6 lg:gap-8 xl:gap-10">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center space-x-4 mt-8">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="px-6 py-3 bg-white border border-gray-300 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gradient-to-r hover:from-gray-800 hover:to-gray-900 hover:text-white hover:border-transparent transition-all duration-300 font-medium shadow-sm hover:shadow-md"
                  >
                    ← Previous
                  </button>
                  <span className="text-gray-700 font-medium px-4 py-3 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 shadow-sm">
                    Page <span className="text-gray-900 font-bold">{page}</span> of {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page === totalPages}
                    className="px-6 py-3 bg-white border border-gray-300 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gradient-to-r hover:from-gray-800 hover:to-gray-900 hover:text-white hover:border-transparent transition-all duration-300 font-medium shadow-sm hover:shadow-md"
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>}>
      <ProductsContent />
    </Suspense>
  );
}

export const dynamic = 'force-dynamic';
