'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiSearch, FiX } from 'react-icons/fi';

interface DynamicSearchProps {
  mobileOverlay?: boolean;
  onClose?: () => void;
  dashboardMode?: boolean;
}

export default function DynamicSearch({
  mobileOverlay,
  onClose,
  dashboardMode,
}: DynamicSearchProps) {
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!query) {
      setResults([]);
      setShowDropdown(false);
      return;
    }
    setLoading(true);
    if (debounceTimeout) clearTimeout(debounceTimeout);
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`/api/products?search=${encodeURIComponent(query)}&limit=6`);
        const data = await res.json();
        setResults(data.products || []);
        setShowDropdown(true);
      } catch (e) {
        setResults([]);
        setShowDropdown(false);
      } finally {
        setLoading(false);
      }
    }, 300);
    setDebounceTimeout(timeout);
    // Cleanup
    return () => clearTimeout(timeout);
    // eslint-disable-next-line
  }, [query]);

  const handleSelect = (id: string) => {
    setShowDropdown(false);
    setQuery('');
    if (onClose) onClose();
    router.push(`/products/${id}`);
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setShowDropdown(false);
    inputRef.current?.focus();
  };

  return (
    <div className="relative w-full" ref={searchRef}>
      <div className="relative">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-10 pr-10 py-2 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:bg-white transition-all duration-200"
          placeholder="Search products..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
          aria-label="Search products"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FiX className="w-4 h-4" />
          </button>
        )}
        {loading && (
          <div className="absolute right-8 top-1/2 -translate-y-1/2 text-primary-600 animate-spin">⏳</div>
        )}
      </div>

      {showDropdown && results.length > 0 && (
        <div className="absolute left-0 right-0 mt-2 bg-white border border-primary-100 rounded-xl shadow-xl z-50 max-h-80 overflow-y-auto">
          {results.map((product) => (
            <button
              key={product.id || product._id}
              className="w-full text-left px-4 py-3 hover:bg-primary-50 flex items-center gap-3 transition-colors border-b border-gray-50 last:border-b-0"
              onMouseDown={() => handleSelect(product.id || product._id)}
            >
              <img
                src={product.images?.[0] || '/placeholder.png'}
                alt={product.name || product.title}
                className="w-10 h-10 object-cover rounded-lg"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{product.name || product.title}</p>
                {product.categories?.name && (
                  <p className="text-xs text-primary-600">{product.categories.name}</p>
                )}
              </div>
              <span className="text-sm font-semibold text-primary-700">
                KSh {(product.price || 0).toLocaleString()}
              </span>
            </button>
          ))}
        </div>
      )}

      {showDropdown && !loading && query && results.length === 0 && (
        <div className="absolute left-0 right-0 mt-2 bg-white border border-primary-100 rounded-xl shadow-xl z-50 px-4 py-6 text-center">
          <p className="text-gray-500 text-sm">No products found for &ldquo;{query}&rdquo;</p>
          <p className="text-xs text-gray-400 mt-1">Try a different search term</p>
        </div>
      )}
    </div>
  );
}
