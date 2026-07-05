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
  const uniqueCategories = Array.from(new Set(categories.map(c => (c || '').toLowerCase()))).map(
    c => categories.find(cat => (cat || '').toLowerCase() === c) as string
  ).filter(Boolean);
  return (
    <div className="bg-white border border-primary-200 rounded-xl shadow-md p-5">
      <h3 className="font-semibold text-lg mb-4 text-primary-800">Categories</h3>
      <div className="space-y-2">
        <button
          onClick={() => onSelectCategory(null)}
          className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-300 font-medium ${
            selectedCategory === null
              ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-md'
              : 'hover:bg-primary-50 text-primary-700 hover:text-primary-900 border border-transparent hover:border-primary-200'
          }`}
        >
          📦 All Products
        </button>
        {uniqueCategories.map((category) => {
          const icon = category === 'Honey' ? '🍯' :
                      category === 'Fruits' ? '🥭' :
                      category === 'Livestock' ? '🐑' :
                      category === 'Poultry' ? '🐔' :
                      category === 'Vegetables' ? '🥬' :
                      category === 'Dairy' ? '🥛' :
                      category === 'Eggs' ? '🥚' : '🌿';
          return (
            <button
              key={category}
              onClick={() => onSelectCategory(category)}
              className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-300 font-medium ${
                selectedCategory === category
                  ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-md'
                  : 'hover:bg-primary-50 text-primary-700 hover:text-primary-900 border border-transparent hover:border-primary-200'
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
