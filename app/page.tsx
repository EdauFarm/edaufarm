import InfiniteProductList from '@/components/InfiniteProductList';
import HeroBanner from '@/components/HeroBanner';
import ErrorBoundary from '@/components/ErrorBoundary';
import type { Metadata } from 'next';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import DynamicSearch from '@/components/DynamicSearch';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Mkulima Bora - Fresh Farm Products Direct from Farmers',
  description: 'Connect with local farmers. Buy fresh produce, livestock, seeds, and farm equipment. Quality agricultural products with fast delivery.',
};

const categoryIcons: Record<string, string> = {
  'vegetables': '🥬',
  'fruits': '🍎',
  'crops-grains': '🌾',
  'livestock': '🐄',
  'poultry': '🐔',
  'dairy': '🥛',
  'seeds-seedlings': '🌱',
  'fertilizers': '🧪',
  'farm-equipment': '🚜',
  'animal-feed': '饲料',
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
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Shop by Category</h2>
            <p className="text-gray-600 mt-1">Browse our agricultural product categories</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className="group bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl p-4 sm:p-6 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-primary-100"
              >
                <div className="text-4xl sm:text-5xl mb-2 sm:mb-3">
                  {categoryIcons[category.slug] || '🌱'}
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

        <section className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 sm:p-8 mb-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                🌾 Fresh from the Farm
              </h2>
              <p className="text-gray-600">
                Quality produce directly from local farmers. Support agriculture, eat fresh.
              </p>
            </div>
            <div className="flex gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600">500+</div>
                <div className="text-sm text-gray-600">Farmers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600">10K+</div>
                <div className="text-sm text-gray-600">Products</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600">47</div>
                <div className="text-sm text-gray-600">Counties</div>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Featured Products</h2>
              <p className="text-gray-600 mt-1">Handpicked fresh produce from trusted farmers</p>
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
            <div className="text-3xl mb-3">🚚</div>
            <h3 className="font-semibold text-gray-900 mb-2">Fast Delivery</h3>
            <p className="text-sm text-gray-600">Fresh produce delivered within 24-48 hours across Kenya</p>
          </div>
          <div className="bg-green-50 rounded-xl p-6 border border-green-100">
            <div className="text-3xl mb-3">✅</div>
            <h3 className="font-semibold text-gray-900 mb-2">Verified Farmers</h3>
            <p className="text-sm text-gray-600">All sellers are vetted for quality and authenticity</p>
          </div>
          <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
            <div className="text-3xl mb-3">💳</div>
            <h3 className="font-semibold text-gray-900 mb-2">Secure Payments</h3>
            <p className="text-sm text-gray-600">M-Pesa and card payments protected with SSL encryption</p>
          </div>
        </section>
      </div>
    </div>
  );
}
