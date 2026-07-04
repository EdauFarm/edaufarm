import { Suspense } from 'react';
// Force dynamic rendering for every request (no cache)
export const dynamic = "force-dynamic";
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import ProductDetailClient from './ProductDetailClient';
import LoadingSpinner from '@/components/LoadingSpinner';
import { headers } from 'next/headers';

// Enable ISR with 10-second revalidation for faster price updates
export const revalidate = 10; // Revalidate every 10 seconds

// Generate static params for popular/featured products at build time
export async function generateStaticParams() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'https://edaufarm.com'}/api/products?featured=true&limit=20`,
      { 
        next: { 
          revalidate: 600 // Cache popular products list for 10 minutes
        } 
      }
    );
    
    if (!res.ok) return [];
    
    const data = await res.json();
    const products = data.products || [];
    
    return products.map((product: any) => ({
      id: product._id,
    }));
  } catch (error) {
    return [];
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'https://edaufarm.com'}/api/products/${params.id}`,
      { 
        next: { 
          revalidate: 10 // Cache for 10 seconds
        } 
      }
    );
    
    if (!res.ok) {
      return {
        title: 'Product Not Found',
      };
    }

    const { product } = await res.json();
    
    return {
      title: `${product.title} - Edau Farm`,
      description: product.description?.substring(0, 160),
      openGraph: {
        title: product.title,
        description: product.description,
        images: product.images?.[0] ? [product.images[0]] : [],
      },
    };
  } catch (error) {
    return {
      title: 'Product - Edau Farm',
    };
  }
}


async function getProduct(id: string) {
  try {
    let baseUrl;
    try {
      const reqHeaders = await headers();
      const host = reqHeaders.get('host');
      const protocol = reqHeaders.get('x-forwarded-proto') || 'https';
      baseUrl = `${protocol}://${host}`;
    } catch (e) {
      baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://edaufarm.com';
    }
    const res = await fetch(
      `${baseUrl}/api/products/${id}`,
      { 
        next: { 
          revalidate: 10 // Cache for 10 seconds
        } 
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.product;
  } catch (error) {
    return null;
  }
}


export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  const product = await getProduct(params.id);
  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
        <p className="text-lg text-gray-600">Sorry, we couldn't find this product. It may have been removed or is unavailable.</p>
      </div>
    );
  }
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ProductDetailClient initialProduct={product} />
    </Suspense>
  );
}
