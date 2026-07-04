import FlashSales from '@/components/FlashSales';
import InfiniteProductList from '@/components/InfiniteProductList';
import HeroBanner from '@/components/HeroBanner';
import ErrorBoundary from '@/components/ErrorBoundary';
import type { Metadata } from 'next';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import Link from 'next/link';
import LoadingSpinnerHome from '@/components/LoadingSpinnerHome';
import HomeMobileSearchBar from '@/components/HomeMobileSearchBar';
import React from 'react';
import DynamicSearch from '@/components/DynamicSearch';

// Enable ISR (Incremental Static Regeneration) with 5-minute revalidation
export const revalidate = 300; // Revalidate every 5 minutes

export const metadata: Metadata = {
  title: 'Gadget World - Best Electronics Shopping Online',
  description: 'Shop the best deals on electronics, fashion, phones, computers, and more. Fast delivery, secure payment, and great customer service.',
};

async function getFeaturedProducts() {
  try {
    // Direct database query for better performance and reliability
    await dbConnect();
    
    const products = await Product.find({
      $or: [
        { active: true },
        { active: { $exists: false } }
      ],
      featured: true
    })
    .select('title price compareAtPrice images category subcategory brand stock rating featured active tags buybackEnabled createdAt')
    .sort({ createdAt: -1 })
    .limit(12)
    .lean();

    
    // Convert MongoDB documents to plain objects
    const serializedProducts = products.map(product => ({
      ...product,
      _id: product._id.toString(),
      createdAt: product.createdAt ? new Date(product.createdAt).toISOString() : undefined,
      updatedAt: product.updatedAt ? new Date(product.updatedAt).toISOString() : undefined,
    }));

    return { products: serializedProducts };
  } catch (error) {
    return { products: [] };
  }
}

export default async function Home() {
  const { products } = await getFeaturedProducts();


  return (
    <div className="min-h-screen bg-white">
      {/* Sticky Search Bar removed as requested */}
      <ErrorBoundary>
         {/* Dynamic Search (center, hidden on PC) */}
          <div className="flex-1 mx-6 block md:hidden lg:hidden">
            <DynamicSearch />
          </div>
      </ErrorBoundary>
      {/* Hero Carousel */}
      <ErrorBoundary>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <HeroBanner />
        </div>
      </ErrorBoundary>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Flash Sales Section */}
        <ErrorBoundary>
          <div className="mb-8">
            <FlashSales />
          </div>
        </ErrorBoundary>

        {/* Products Grid */}
        <section>
          <div className="mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Featured Products</h2>
            <p className="text-gray-600 mt-1">Discover our handpicked selection</p>
          </div>
          <ErrorBoundary>
            <InfiniteProductList initialProducts={products} />
          </ErrorBoundary>
        </section>

        {/* All Products Section */}
        <section className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">All Products</h2>
              <p className="text-gray-600 mt-1">Browse our complete catalog</p>
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
        </section>
      </div>
    </div>
  );
}
