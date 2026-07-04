'use client';

import { useState } from 'react';
import { Filter, X, ChevronDown } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface MobileFilterProps {
  categories: string[];
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  priceRange?: { min: number; max: number };
  onPriceChange?: (min: number, max: number) => void;
}

export default function MobileFilter({
  categories,
  selectedCategory,
  onSelectCategory,
  sortBy,
  onSortChange,
  priceRange,
  onPriceChange,
}: MobileFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'category' | 'sort' | 'price'>('category');
  const { t } = useLanguage();

  return (
    <>
      {/* Filter Button - Mobile Only */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed bottom-20 right-4 z-40 bg-gradient-to-r from-gray-800 to-gray-900 text-white p-4 rounded-full shadow-lg flex items-center gap-2 hover:shadow-xl hover:scale-105 transition-all"
      >
        <Filter className="w-5 h-5" />
        <span className="font-semibold">Filters</span>
      </button>

      {/* Filter Modal */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50">
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[80vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-bold">Filters</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b">
              <button
                onClick={() => setActiveTab('category')}
                className={`flex-1 py-3 font-medium ${
                  activeTab === 'category'
                    ? 'border-b-2 border-gray-900 text-gray-900'
                    : 'text-gray-600'
                }`}
              >
                Category
              </button>
              <button
                onClick={() => setActiveTab('sort')}
                className={`flex-1 py-3 font-medium ${
                  activeTab === 'sort'
                    ? 'border-b-2 border-gray-900 text-gray-900'
                    : 'text-gray-600'
                }`}
              >
                Sort
              </button>
              {onPriceChange && (
                <button
                  onClick={() => setActiveTab('price')}
                  className={`flex-1 py-3 font-medium ${
                    activeTab === 'price'
                      ? 'border-b-2 border-gray-900 text-gray-900'
                      : 'text-gray-600'
                  }`}
                >
                  Price
                </button>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {/* Category Tab */}
              {activeTab === 'category' && (
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      onSelectCategory(null);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-lg ${
                      !selectedCategory
                        ? 'bg-gray-800 text-white font-semibold'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    All Categories
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => {
                        onSelectCategory(category);
                        setIsOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 rounded-lg ${
                        selectedCategory === category
                          ? 'bg-gray-800 text-white font-semibold'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              )}

              {/* Sort Tab */}
              {activeTab === 'sort' && (
                <div className="space-y-2">
                  {[
                    { value: 'createdAt', label: '🆕 Newest First' },
                    { value: 'price-low', label: '💰 Price: Low to High' },
                    { value: 'price-high', label: '💎 Price: High to Low' },
                    { value: 'rating', label: '⭐ Highest Rated' },
                    { value: 'title', label: '🔤 Name: A to Z' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        onSortChange(option.value);
                        setIsOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-300 ${
                        sortBy === option.value
                          ? 'bg-gradient-to-r from-gray-800 to-gray-900 text-white font-semibold shadow-md'
                          : 'hover:bg-gray-50 border border-transparent hover:border-gray-300'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Price Tab */}
              {activeTab === 'price' && onPriceChange && priceRange && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Min Price: ${priceRange.min}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="10000"
                      step="10"
                      value={priceRange.min}
                      onChange={(e) => onPriceChange(Number(e.target.value), priceRange.max)}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Price: ${priceRange.max}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="10000"
                      step="10"
                      value={priceRange.max}
                      onChange={(e) => onPriceChange(priceRange.min, Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="w-full py-3 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                  >
                    Apply Price Filter
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
