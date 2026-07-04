'use client';

interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}

export default function CategoryFilter({
  categories,
  selectedCategory,
  onSelectCategory,
}: CategoryFilterProps) {
  // Deduplicate categories (case-insensitive)
  const uniqueCategories = Array.from(new Set(categories.map(c => c.toLowerCase()))).map(
    c => categories.find(cat => cat.toLowerCase() === c) as string
  );
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-md p-5">
      <h3 className="font-semibold text-lg mb-4 text-gray-800">Categories</h3>
      <div className="space-y-2">
        <button
          onClick={() => onSelectCategory(null)}
          className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-300 font-medium ${
            selectedCategory === null
              ? 'bg-gradient-to-r from-gray-800 to-gray-900 text-white shadow-md'
              : 'hover:bg-gray-50 text-gray-700 hover:text-gray-900 border border-transparent hover:border-gray-300'
          }`}
        >
          📦 All Products
        </button>
        {uniqueCategories.map((category) => {
          const icon = category === 'Electronics' ? '📱' : 
                      category === 'Fashion' ? '👔' :
                      category === 'Home & Kitchen' ? '🏠' :
                      category === 'Health & Beauty' ? '💄' :
                      category === 'Sports' ? '⚽' :
                      category === 'Books' ? '📚' : '🏷️';
          return (
            <button
              key={category}
              onClick={() => onSelectCategory(category)}
              className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-300 font-medium ${
                selectedCategory === category
                  ? 'bg-gradient-to-r from-gray-800 to-gray-900 text-white shadow-md'
                  : 'hover:bg-gray-50 text-gray-700 hover:text-gray-900 border border-transparent hover:border-gray-300'
              }`}
            >
              {icon} {category}
            </button>
          );
        })}
      </div>
    </div>
  );
}
