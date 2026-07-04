import InfiniteProductList from '@/components/InfiniteProductList';
import HeroBanner from '@/components/HeroBanner';
import ErrorBoundary from '@/components/ErrorBoundary';
import type { Metadata } from 'next';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import DynamicSearch from '@/components/DynamicSearch';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Edau Farm - Premium Honey, Fruits, Livestock & Poultry from West Pokot',
  description: 'West Pokot\'s premier sustainable farm. Premium Acacia honey, fresh seasonal fruits, Dorper sheep, and free-range poultry. Order fresh farm products online.',
};

const categoryIcons: Record<string, string> = {
  'honey': '🍯',
  'fruits': '🥭',
  'livestock': '🐑',
  'poultry': '🐔',
  'vegetables': '🥬',
  'dairy': '🥛',
  'eggs': '🥚',
  'seeds': '🌱',
};

async function getCategories() {
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('display_order')
    .limit(10);

  return categories || [];
}

async function getFeaturedProducts() {
  const { data: products } = await supabase
    .from('products')
    .select('*, categories(name, slug)')
    .eq('is_featured', true)
    .eq('is_in_stock', true)
    .order('created_at', { ascending: false })
    .limit(12);

  return products || [];
}

export default async function Home() {
  const [categories, products] = await Promise.all([
    getCategories(),
    getFeaturedProducts(),
  ]);

  return (
    <div className="min-h-screen bg-white">
      <ErrorBoundary>
        <div className="flex-1 mx-6 block md:hidden lg:hidden">
          <DynamicSearch />
        </div>
      </ErrorBoundary>

      <ErrorBoundary>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <HeroBanner />
        </div>
      </ErrorBoundary>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <section className="mb-12">
          <div className="mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Our Farm Products</h2>
            <p className="text-gray-600 mt-1">Fresh from West Pokot, Kenya</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/products?category=${category.slug}`}
                className="group bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 sm:p-6 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-amber-100"
              >
                <div className="text-4xl sm:text-5xl mb-2 sm:mb-3">
                  {categoryIcons[category.slug] || '🌿'}
                </div>
                <h3 className="font-semibold text-gray-800 text-sm sm:text-base group-hover:text-primary-700 transition-colors">
                  {category.name}
                </h3>
                {category.description && (
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2 hidden sm:block">
                    {category.description}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </section>

        <section className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl p-6 sm:p-8 mb-12 border border-amber-100">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                🌾 Where Tradition Meets Sustainability
              </h2>
              <p className="text-gray-600">
                Edau Farm has been committed to sustainable agriculture since 2015, honoring our ancestral lands while embracing eco-friendly farming methods.
              </p>
            </div>
            <div className="flex gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600">9+</div>
                <div className="text-sm text-gray-600">Years</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600">100%</div>
                <div className="text-sm text-gray-600">Organic</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600">50+</div>
                <div className="text-sm text-gray-600">Acres</div>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Featured Products</h2>
              <p className="text-gray-600 mt-1">Premium quality from our farm to your table</p>
            </div>
            <Link
              href="/products"
              className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium transition-colors"
            >
              <span>View All</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          <ErrorBoundary>
            <InfiniteProductList initialProducts={products} />
          </ErrorBoundary>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-amber-50 rounded-xl p-6 border border-amber-100">
            <div className="text-3xl mb-3">🍯</div>
            <h3 className="font-semibold text-gray-900 mb-2">Pure Acacia Honey</h3>
            <p className="text-sm text-gray-600">Raw, unprocessed honey from the acacia forests of West Pokot</p>
          </div>
          <div className="bg-green-50 rounded-xl p-6 border border-green-100">
            <div className="text-3xl mb-3">🐑</div>
            <h3 className="font-semibold text-gray-900 mb-2">Quality Livestock</h3>
            <p className="text-sm text-gray-600">Premium Dorper sheep and goats raised on natural pastures</p>
          </div>
          <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-100">
            <div className="text-3xl mb-3">🚚</div>
            <h3 className="font-semibold text-gray-900 mb-2">Farm to Door</h3>
            <p className="text-sm text-gray-600">Fresh products delivered across Kenya via M-Pesa</p>
          </div>
        </section>
      </div>
    </div>
  );
}
