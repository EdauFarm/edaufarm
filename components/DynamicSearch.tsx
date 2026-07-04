"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

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
  const [query, setQuery] = useState("");
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
    setQuery("");
    if (onClose) onClose();
    router.push(`/products/${id}`);
  };

  return (
    <div className="relative w-full" ref={searchRef}>
      <input
        ref={inputRef}
        type="text"
        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
        placeholder="Search products..."
        value={query}
        onChange={e => setQuery(e.target.value)}
        onFocus={() => setShowDropdown(true)}
        onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
        aria-label="Search products"
      />
      {loading && (
        <div className="absolute right-3 top-2 text-gray-400 animate-spin">⏳</div>
      )}
      {showDropdown && results.length > 0 && (
        <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-72 overflow-y-auto">
          {results.map((product) => (
            <button
              key={product._id}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2"
              onMouseDown={() => handleSelect(product._id)}
            >
              <img src={product.images?.[0] || '/placeholder.png'} alt={product.title} className="w-8 h-8 object-cover rounded mr-2" />
              <span className="flex-1 truncate">{product.title}</span>
              <span className="text-sm text-gray-500">{product.price ? `from ${product.price}` : ''}</span>
            </button>
          ))}
        </div>
      )}
      {showDropdown && !loading && query && results.length === 0 && (
        <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 px-4 py-2 text-gray-500">
          No products found.
        </div>
      )}
    </div>
  );
}


