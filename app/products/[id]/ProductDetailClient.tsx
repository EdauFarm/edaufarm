'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FiShoppingCart, FiMinus, FiPlus, FiPackage, FiRotateCcw, FiShield } from 'react-icons/fi';
import { formatPrice, calculateDiscount } from '@/lib/utils';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useCartStore } from '@/store/cartStore';
import toast from 'react-hot-toast';
import axios from 'axios';

interface ProductDetailClientProps {
  initialProduct: any;
}

export default function ProductDetailClient({ initialProduct }: ProductDetailClientProps) {
  // Validate and sanitize product data with state for live updates
  const [product, setProduct] = useState({
    ...initialProduct,
    images: initialProduct?.images || [],
    rating: initialProduct?.rating || { average: 0, count: 0 },
    stock: initialProduct?.stock || 0,
    price: initialProduct?.price || 0,
    title: initialProduct?.title || 'Product',
    category: initialProduct?.category || 'Uncategorized',
    description: initialProduct?.description || 'No description available',
  });
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((state) => state.addItem);

  // Auto-refresh product data every 30 seconds to get latest price/stock
  useEffect(() => {
    const refreshProduct = async () => {
      try {
        const response = await axios.get(`/api/products/${initialProduct._id}`);
        if (response.data.product) {
          const updated = response.data.product;
          setProduct({
            ...updated,
            images: updated.images || [],
            rating: updated.rating || { average: 0, count: 0 },
            stock: updated.stock || 0,
            price: updated.price || 0,
            title: updated.title || 'Product',
            category: updated.category || 'Uncategorized',
            description: updated.description || 'No description available',
          });
        }
      } catch (error) {
        // Silently fail - keep showing cached data
      }
    };

    // Refresh immediately on mount, then every 30 seconds
    refreshProduct();
    const interval = setInterval(refreshProduct, 30000);

    return () => clearInterval(interval);
  }, [initialProduct._id]);

  // Safety check
  if (!initialProduct || !initialProduct._id) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-xl text-gray-600">Product not found</p>
      </div>
    );
  }

  const handleOrderNow = () => {
    if (product.stock === 0) {
      toast.error('Product out of stock');
      return;
    }
    if (quantity > product.stock) {
      toast.error('Not enough stock available');
      return;
    }
    addItem({
      productId: product._id,
      title: product.title,
      price: product.price,
      image: product.images[0] || '',
      quantity,
    });
    toast.success(`${quantity} item(s) added! Redirecting to checkout...`);
    setTimeout(() => {
      window.location.href = '/checkout';
    }, 500);
  };

  const { currency } = useCurrency();
  const discount = calculateDiscount(product.price, product.compareAtPrice);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid md:grid-cols-2 gap-8 overflow-hidden">
        {/* Images */}
        <div>
          <div className="bg-white border border-gray-200 rounded overflow-hidden mb-4">
            <div className="relative h-96">
              {product.images[selectedImage] ? (
                <Image
                  src={product.images[selectedImage]}
                  alt={product.title}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-contain"
                />
              ) : (
                <div className="flex items-center justify-center h-full bg-gray-200">
                  <div className="text-center">
                    <svg className="w-24 h-24 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-gray-500">No image available</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Thumbnail Images */}
          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((image: string, index: number) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative h-20 bg-white rounded-lg overflow-hidden border-2 transition-colors ${
                    selectedImage === index ? 'border-slate-900' : 'border-gray-200'
                  }`}
                >
                  <Image 
                    src={image} 
                    alt={`${product.title} ${index + 1}`} 
                    fill 
                    sizes="80px"
                    className="object-cover" 
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <div className="bg-white border border-gray-200 rounded p-6">
            {/* Category */}
            <div className="text-sm text-gray-500 uppercase tracking-wide mb-2">
              {product.category}
            </div>

            {/* Title */}
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.title}</h1>

            {/* Rating */}
            {product.rating && (
              <div className="flex items-center mb-4">
                <div className="flex items-center text-yellow-400 text-lg">
                  {'★'.repeat(Math.round(product.rating.average || 0))}
                  {'☆'.repeat(5 - Math.round(product.rating.average || 0))}
                </div>
                <span className="text-gray-600 ml-2">
                  ({product.rating.count || 0} reviews)
                </span>
              </div>
            )}

            {/* Price */}
            <div className="mb-6">
              <div className="flex items-center space-x-3 mb-2">
                <div className="text-3xl font-bold text-slate-900">
                  {product.price ? formatPrice(product.price, 'KES', currency.code) : 'Price not available'}
                </div>
                {discount > 0 && (
                  <div className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded text-sm font-medium">
                    -{discount}%
                  </div>
                )}
              </div>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <div className="text-base text-gray-400 line-through">
                  {formatPrice(product.compareAtPrice, 'KES', currency.code)}
                </div>
              )}
            </div>

            {/* Stock */}
            <div className="mb-6">
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                  product.stock > 0
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
              </span>
            </div>

            {/* Quantity Selector */}
            {product.stock > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Quantity
                </label>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100"
                  >
                    <FiMinus />
                  </button>
                  <span className="text-xl font-semibold w-12 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100"
                  >
                    <FiPlus />
                  </button>
                </div>
              </div>
            )}

            {/* Order Now Button */}
            <button
              onClick={handleOrderNow}
              disabled={product.stock === 0}
              className={`w-full py-3 rounded-lg flex items-center justify-center space-x-2 font-medium transition-all ${
                product.stock === 0
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-slate-900 text-white hover:bg-slate-800'
              }`}
            >
              <FiShoppingCart size={20} />
              <span>{product.stock === 0 ? 'Out of Stock' : 'Order Now'}</span>
            </button>

            {/* Description */}
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Description</h2>
              <div className="text-gray-700 whitespace-pre-line">
                {product.description}
              </div>
            </div>

            {/* Specifications */}
            {product.specifications && Array.isArray(product.specifications) && product.specifications.length > 0 && (
              <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4">Specifications</h2>
                <div className="space-y-2">
                  {product.specifications.map((spec: any, index: number) => (
                    <div key={spec._id || index} className="flex justify-between py-2 border-b">
                      <span className="font-medium text-gray-700">{spec.key}:</span>
                      <span className="text-gray-600">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4">Tags</h2>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag: string, index: number) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Reviews Section */}
        <ReviewsSection productId={product._id} initialRating={product.rating} />

        {/* Related Products */}
        <RelatedProducts productId={product._id} category={product.category} />

        {/* Trending Products */}
        <TrendingProducts currentProductId={product._id} />

        {/* Policies */}
        <PoliciesSection />
      </div>
    </div>
  );
}

function RelatedProducts({ productId, category }: { productId: string; category: string }) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { currency } = require('@/contexts/CurrencyContext').useCurrency();

  useEffect(() => {
    async function fetchRelated() {
      try {
        const res = await fetch(`/api/products?category=${encodeURIComponent(category)}&limit=8`);
        const data = await res.json();
        const filtered = data.products?.filter((p: any) => p._id !== productId) || [];
        setProducts(filtered.slice(0, 6));
      } catch (error) {
      } finally {
        setLoading(false);
      }
    }
    fetchRelated();
  }, [productId, category]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">Related Products</h2>
        <div className="text-center py-8">Loading...</div>
      </div>
    );
  }

  if (products.length === 0) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">Related Products</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
        {products.map((product) => (
          <Link key={product._id} href={`/products/${product._id}`} className="group">
            <div className="bg-white rounded-xl border border-gray-200 hover:border-primary-200 shadow-sm hover:shadow-2xl transition-all duration-300 overflow-hidden">
              <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100">
                {product.images?.[0] ? (
                  <Image
                    src={product.images[0]}
                    alt={product.title}
                    fill
                    className="object-contain p-2 group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <FiPackage className="text-gray-300 text-3xl" />
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="text-sm font-medium line-clamp-2 mb-2 min-h-[40px] text-gray-800 group-hover:text-primary-600 transition-colors break-words">
                  {product.title}
                </h3>
                <p className="text-base font-bold text-primary-600 truncate">
                  {formatPrice(product.price, 'KES', currency.code)}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function TrendingProducts({ currentProductId }: { currentProductId: string }) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { currency } = require('@/contexts/CurrencyContext').useCurrency();

  useEffect(() => {
    async function fetchTrending() {
      try {
        const res = await fetch('/api/products?featured=true&limit=12');
        const data = await res.json();
        const filtered = data.products?.filter((p: any) => p._id !== currentProductId) || [];
        setProducts(filtered.slice(0, 6));
      } catch (error) {
      } finally {
        setLoading(false);
      }
    }
    fetchTrending();
  }, [currentProductId]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">Trending Products</h2>
        <div className="text-center py-8">Loading...</div>
      </div>
    );
  }

  if (products.length === 0) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">Trending Products</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
        {products.map((product) => (
          <Link key={product._id} href={`/products/${product._id}`} className="group">
            <div className="bg-white rounded-xl border border-gray-200 hover:border-primary-200 shadow-sm hover:shadow-2xl transition-all duration-300 overflow-hidden">
              <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100">
                {product.images?.[0] ? (
                  <Image
                    src={product.images[0]}
                    alt={product.title}
                    fill
                    className="object-contain p-2 group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <FiPackage className="text-gray-300 text-3xl" />
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="text-sm font-medium line-clamp-2 mb-2 min-h-[40px] text-gray-800 group-hover:text-primary-600 transition-colors break-words">
                  {product.title}
                </h3>
                <p className="text-base font-bold text-primary-600 truncate">
                  {formatPrice(product.price, 'KES', currency.code)}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function PoliciesSection() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 bg-gray-50 rounded-lg mb-6">
      <h2 className="text-2xl font-bold mb-6">Our Policies</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center mb-4">
            <FiPackage className="text-primary-600 text-3xl mr-3" />
            <h3 className="text-lg font-semibold">Free Delivery</h3>
          </div>
          <p className="text-gray-600 text-sm">
            Enjoy free delivery on orders above KSh 5,000 within Nairobi. 
            Fast and reliable shipping across Kenya.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center mb-4">
            <FiRotateCcw className="text-primary-600 text-3xl mr-3" />
            <h3 className="text-lg font-semibold">7-Day Returns</h3>
          </div>
          <p className="text-gray-600 text-sm">
            Changed your mind? Return your purchase within 7 days for a full refund. 
            Items must be unused and in original packaging.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center mb-4">
            <FiShield className="text-primary-600 text-3xl mr-3" />
            <h3 className="text-lg font-semibold">Secure Payment</h3>
          </div>
          <p className="text-gray-600 text-sm">
            Shop with confidence using M-Pesa. Your payment information is 
            encrypted and secure. We verify all transactions.
          </p>
        </div>
      </div>
    </div>
  );
}

function ReviewsSection({ productId, initialRating }: { productId: string; initialRating: any }) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [canReview, setCanReview] = useState(false);
  const [checkingEligibility, setCheckingEligibility] = useState(true);

  useEffect(() => {
    fetchReviews();
    checkReviewEligibility();
  }, [productId]);

  const checkReviewEligibility = async () => {
    try {
      const res = await fetch(`/api/reviews/check-eligibility?productId=${productId}`);
      const data = await res.json();
      setCanReview(data.canReview || false);
    } catch (error) {
      setCanReview(false);
    } finally {
      setCheckingEligibility(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await fetch(`/api/reviews?productId=${productId}`);
      const data = await res.json();
      setReviews(data.reviews || []);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!comment.trim()) {
      toast.error('Please write a review');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, rating, comment }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Failed to post review');
        return;
      }

      toast.success('Review posted successfully!');
      setComment('');
      setRating(5);
      fetchReviews(); // Refresh reviews
    } catch (error) {
      toast.error('Failed to post review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 mb-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">Customer Reviews</h2>
      
      {/* Rating Summary */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex items-center mb-2">
          <div className="flex items-center text-yellow-400 text-2xl mr-3">
            {'★'.repeat(Math.round(initialRating?.average || 0))}
            {'☆'.repeat(5 - Math.round(initialRating?.average || 0))}
          </div>
          <span className="text-2xl font-bold text-gray-900">
            {initialRating?.average?.toFixed(1) || '0.0'}
          </span>
          <span className="text-gray-500 ml-2">
            ({initialRating?.count || 0} {initialRating?.count === 1 ? 'review' : 'reviews'})
          </span>
        </div>
      </div>

      {/* Write Review Form - Only for eligible users */}
      {canReview && !checkingEligibility && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Write a Review</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Rating
              </label>
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="text-2xl focus:outline-none transition-colors"
                  >
                    {star <= rating ? (
                      <span className="text-yellow-400">★</span>
                    ) : (
                      <span className="text-gray-300">★</span>
                    )}
                  </button>
                ))}
                <span className="text-gray-600 ml-3 text-sm">({rating} {rating === 1 ? 'star' : 'stars'})</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Review
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                placeholder="Share your experience with this product..."
                maxLength={1000}
              />
              <div className="text-xs text-gray-500 mt-1">
                {comment.length}/1000 characters
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="bg-slate-900 text-white px-6 py-2.5 rounded-lg hover:bg-slate-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Posting...' : 'Post Review'}
            </button>
          </form>
        </div>
      )}

      {!canReview && !checkingEligibility && (
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 mb-6 text-center">
          <p className="text-gray-600 text-sm">
            📦 Only customers who have received this product can write reviews
          </p>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-slate-900 mx-auto"></div>
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <div className="text-gray-400 text-4xl mb-2">💬</div>
            <p className="text-gray-600 font-medium">No reviews yet</p>
            <p className="text-gray-500 text-sm mt-1">Be the first to review this product!</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div
              key={review._id}
              className="bg-white rounded-lg border border-gray-200 p-5"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center mb-2">
                    <span className="font-semibold text-gray-900">{review.userName}</span>
                    {review.verified && (
                      <span className="ml-2 bg-green-50 text-green-700 text-xs px-2 py-0.5 rounded font-medium">
                        ✓ Verified
                      </span>
                    )}
                  </div>
                  <div className="flex items-center text-yellow-400">
                    {'★'.repeat(review.rating)}
                    {[...Array(5 - review.rating)].map((_, i) => <span key={i} className="text-gray-300">★</span>)}
                  </div>
                </div>
                <span className="text-sm text-gray-500">
                  {new Date(review.createdAt).toLocaleDateString('en-KE', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
              <p className="text-gray-700 leading-relaxed">{review.comment}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

