import InfiniteProductList from '@/components/InfiniteProductList';
import HeroBanner from '@/components/HeroBanner';
import ErrorBoundary from '@/components/ErrorBoundary';
import type { Metadata } from 'next';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import DynamicSearch from '@/components/DynamicSearch';
import Image from 'next/image';

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

const testimonials = [
  {
    name: 'Sarah Cheruiyot',
    location: 'Nairobi',
    text: 'The honey is absolutely divine! You can taste the difference with raw, organic honey. My whole family loves it.',
    rating: 5,
    product: 'Acacia Honey',
  },
  {
    name: 'Michael Kipchoge',
    location: 'Eldoret',
    text: 'I bought 3 Dorper sheep for my farm. Excellent quality and the delivery was seamless. Highly recommended!',
    rating: 5,
    product: 'Dorper Sheep',
  },
  {
    name: 'Grace Mutua',
    location: 'Kitale',
    text: 'Fresh mangoes delivered right to my doorstep! The quality is amazing and the prices are fair.',
    rating: 5,
    product: 'Fresh Mangoes',
  },
];

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

async function getSeasonalProducts() {
  const { data: products } = await supabase
    .from('products')
    .select('*, categories(name, slug)')
    .eq('is_in_stock', true)
    .gt('quantity', 0)
    .order('created_at', { ascending: false })
    .limit(6);

  return products || [];
}

export default async function Home() {
  const [categories, products, seasonalProducts] = await Promise.all([
    getCategories(),
    getFeaturedProducts(),
    getSeasonalProducts(),
  ]);

  return (
    <div className="min-h-screen bg-white">
      {/* Mobile Search */}
      <ErrorBoundary>
        <div className="flex-1 mx-4 my-3 block md:hidden">
          <DynamicSearch />
        </div>
      </ErrorBoundary>

      {/* Hero Banner */}
      <ErrorBoundary>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <HeroBanner />
        </div>
      </ErrorBoundary>

      {/* Trust Badge Bar */}
      <div className="bg-primary-600 text-white py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-4 sm:gap-8 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-lg">🚚</span>
              <span>Free Delivery Over KSh 5,000</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">💯</span>
              <span>100% Organic Products</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">📱</span>
              <span>M-Pesa Payment</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">🌾</span>
              <span>Farm Fresh Since 2015</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Categories Section */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Our Farm Products</h2>
            <p className="text-gray-600">Fresh from West Pokot, Kenya</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/products?category=${category.slug}`}
                className="group bg-gradient-to-br from-primary-50 to-green-50 rounded-xl p-4 sm:p-6 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-primary-100"
              >
                <div className="text-4xl sm:text-5xl mb-2 sm:mb-3 transform group-hover:scale-110 transition-transform duration-300">
                  {categoryIcons[category.slug] || '🌿'}
                </div>
                <h3 className="font-semibold text-primary-800 text-sm sm:text-base group-hover:text-primary-600 transition-colors">
                  {category.name}
                </h3>
                {category.description && (
                  <p className="text-xs text-primary-600 mt-1 line-clamp-2 hidden sm:block">
                    {category.description}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </section>

        {/* Farm Story Section */}
        <section className="mb-16">
          <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl overflow-hidden">
            <div className="grid md:grid-cols-2">
              <div className="p-8 sm:p-12 text-white">
                <div className="inline-block bg-white/20 rounded-full px-4 py-1 text-sm font-medium mb-4">
                  Established 2015
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                  Where Tradition Meets Sustainability
                </h2>
                <p className="text-primary-100 mb-6 text-lg leading-relaxed">
                  Nestled in the heart of West Pokot, Edau Farm has been a beacon of sustainable agriculture for nearly a decade. Our commitment to organic practices and traditional farming methods ensures every product is pure, natural, and full of flavor.
                </p>
                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div className="text-center">
                    <div className="text-4xl font-bold">9+</div>
                    <div className="text-sm text-primary-200">Years</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold">100%</div>
                    <div className="text-sm text-primary-200">Organic</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold">50+</div>
                    <div className="text-sm text-primary-200">Acres</div>
                  </div>
                </div>
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 bg-white text-primary-700 px-6 py-3 rounded-xl font-semibold hover:bg-primary-50 transition-colors"
                >
                  Learn Our Story
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
              <div className="relative hidden md:block min-h-[400px]">
                <Image
                  src="https://images.unsplash.com/photo-1500651230702-0e2d8a49d4e7?w=800"
                  alt="Edau Farm"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
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

        {/* Product Highlights */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl p-6 border border-amber-100 hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-4">🍯</div>
            <h3 className="font-bold text-lg text-gray-900 mb-2">Pure Acacia Honey</h3>
            <p className="text-gray-600 mb-4">Raw, unprocessed honey from the acacia forests of West Pokot. Rich in nutrients and naturally delicious.</p>
            <Link href="/products?category=honey" className="text-primary-600 font-medium hover:text-primary-700 inline-flex items-center gap-1">
              Shop Honey <span>→</span>
            </Link>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100 hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-4">🐑</div>
            <h3 className="font-bold text-lg text-gray-900 mb-2">Quality Livestock</h3>
            <p className="text-gray-600 mb-4">Premium Dorper sheep and goats raised on natural pastures. Perfect for breeding or meat.</p>
            <Link href="/products?category=livestock" className="text-primary-600 font-medium hover:text-primary-700 inline-flex items-center gap-1">
              View Livestock <span>→</span>
            </Link>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-6 border border-orange-100 hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-4">🚚</div>
            <h3 className="font-bold text-lg text-gray-900 mb-2">Farm to Door</h3>
            <p className="text-gray-600 mb-4">Fresh products delivered across Kenya. Pay easily with M-Pesa for a seamless experience.</p>
            <Link href="/shipping" className="text-primary-600 font-medium hover:text-primary-700 inline-flex items-center gap-1">
              Delivery Info <span>→</span>
            </Link>
          </div>
        </section>

        {/* Seasonal Harvest Banner */}
        <section className="mb-16">
          <div className="bg-gradient-to-r from-orange-400 to-amber-400 rounded-2xl p-8 sm:p-12 text-center text-white">
            <div className="text-5xl mb-4">🥭</div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Seasonal Harvest Available Now!</h2>
            <p className="text-lg mb-6 max-w-2xl mx-auto text-orange-100">
              Fresh mangoes, pawpaws, and passion fruits are now in season. Order now while supplies last!
            </p>
            <Link
              href="/products?category=fruits"
              className="inline-flex items-center gap-2 bg-white text-orange-600 px-8 py-3 rounded-xl font-semibold hover:bg-orange-50 transition-colors"
            >
              Shop Fresh Fruits
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </section>

        {/* Testimonials */}
        <section className="mb-16">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">What Our Customers Say</h2>
            <p className="text-gray-600">Trusted by families across Kenya</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 border border-primary-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="text-amber-400 text-lg">★</span>
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">&ldquo;{testimonial.text}&rdquo;</p>
                <div className="border-t border-gray-100 pt-4">
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-500">{testimonial.location}</div>
                  <div className="text-sm text-primary-600 mt-1">Bought: {testimonial.product}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA - Visit the Farm */}
        <section className="mb-16">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="relative h-64 md:h-96 rounded-xl overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1587049352846-4a232e259e83?w=800"
                alt="Visit Edau Farm"
                fill
                className="object-cover"
              />
            </div>
            <div className="text-center md:text-left">
              <div className="inline-block bg-primary-100 rounded-full px-4 py-1 text-sm font-medium text-primary-700 mb-4">
                Experience Agriculture
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Visit Edau Farm
              </h2>
              <p className="text-gray-600 text-lg mb-6">
                Come experience sustainable farming in action! Walk through our acacia forests, meet our livestock, and taste the freshest honey straight from the source.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Link
                  href="/farm-visits"
                  className="inline-flex items-center justify-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-700 transition-colors"
                >
                  Book a Visit
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
                <Link
                  href="/gallery"
                  className="inline-flex items-center justify-center gap-2 border-2 border-primary-600 text-primary-600 px-6 py-3 rounded-xl font-semibold hover:bg-primary-50 transition-colors"
                >
                  View Gallery
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Newsletter */}
        <section className="mb-8">
          <div className="bg-gradient-to-br from-primary-50 to-green-50 rounded-2xl p-8 sm:p-12 text-center border border-primary-100">
            <div className="text-4xl mb-4">📬</div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Stay Updated</h2>
            <p className="text-gray-600 mb-6 max-w-xl mx-auto">
              Get notified about seasonal harvests, special offers, and farm updates. Be the first to know when fresh products are available!
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-primary-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-primary-700 transition-colors"
            >
              Subscribe for Updates
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
