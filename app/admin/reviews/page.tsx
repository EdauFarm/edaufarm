'use client';

import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { isAdmin } from '@/lib/roleCheck';
import toast from 'react-hot-toast';
import { Star, Trash2, CreditCard as Edit, Plus, ArrowLeft, Check, Search } from 'lucide-react';
import axios from 'axios';
import Link from 'next/link';

interface Review {
  _id: string;
  productId: string;
  userName: string;
  userEmail: string;
  rating: number;
  comment: string;
  verified: boolean;
  createdAt: string;
}

interface Product {
  _id: string;
  title: string;
  category: string;
  price: number;
}

export default function AdminReviewsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [showProductDropdown, setShowProductDropdown] = useState(false);
    const [productPrefilled, setProductPrefilled] = useState(false);
    const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    productId: '',
    userName: '',
    userEmail: '',
    rating: 5,
    comment: '',
    verified: true,
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/admin/reviews');
    } else if (status === 'authenticated') {
      if (!isAdmin(session?.user?.role)) {
        toast.error('Access denied. Admin privileges required.');
        router.push('/dashboard');
      } else {
        fetchReviews();
      }
    }
  }, [status, session, router]);

  // Auto-open modal when products and searchParams are ready
  useEffect(() => {
    const add = searchParams.get('add');
    const productId = searchParams.get('productId');
    if (add === '1' && productId && products.length > 0) {
      const foundProduct = products.find(p => p._id === productId);
      if (foundProduct) {
        setFormData(f => ({
          ...f,
          productId: foundProduct._id
        }));
        setProductSearch(foundProduct.title);
        setProductPrefilled(true);
        setShowModal(true);
      }
    }
  }, [products, searchParams]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      // Fetch all products
      const productsRes = await axios.get('/api/products');
      const allProducts = productsRes.data.products || [];
      setProducts(allProducts);
      
      const allReviews: Review[] = [];
      for (const product of allProducts) {
        const reviewsRes = await axios.get(`/api/reviews?productId=${product._id}`);
        const productReviews = reviewsRes.data.reviews || [];
        allReviews.push(...productReviews);
      }

      setReviews(allReviews);
    } catch (error: any) {
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingReview) {
        // Update existing review
        await axios.put('/api/admin/reviews', {
          reviewId: editingReview._id,
          ...formData,
        });
        toast.success('Review updated successfully');
      } else {
        // Create new review
        await axios.post('/api/admin/reviews', formData);
        toast.success('Review created successfully');
      }

      setShowModal(false);
      setEditingReview(null);
      resetForm();
      fetchReviews();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to save review');
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;

    try {
      await axios.delete(`/api/admin/reviews?reviewId=${reviewId}`);
      toast.success('Review deleted successfully');
      fetchReviews();
    } catch (error: any) {
      toast.error('Failed to delete review');
    }
  };

  const openEditModal = (review: Review) => {
    setEditingReview(review);
    setFormData({
      productId: review.productId,
      userName: review.userName,
      userEmail: review.userEmail,
      rating: review.rating,
      comment: review.comment,
      verified: review.verified,
    });
    setShowModal(true);
  };

  const openCreateModal = () => {
    setEditingReview(null);
    resetForm();
    setProductSearch('');
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      productId: '',
      userName: '',
      userEmail: '',
      rating: 5,
      comment: '',
      verified: true,
    });
    setProductSearch('');
  };

  const selectProduct = (product: Product) => {
    setFormData({ ...formData, productId: product._id });
    setProductSearch(product.title);
    setShowProductDropdown(false);
    setProductPrefilled(true);
  };

  // Allow searching by product ID directly
  const handleProductSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setProductSearch(value);
    setShowProductDropdown(true);
    // If input looks like an ObjectId and not found in products, fetch directly
    if (/^[a-f\d]{24}$/i.test(value) && !products.some(p => p._id === value)) {
      try {
        const res = await axios.get(`/api/products/${value}`);
        const prod = res.data.product;
        if (prod && prod._id) {
          setProducts(prev => [...prev, prod]);
        }
      } catch {
        // ignore fetch errors
      }
    }
  };

  const filteredProducts = products.filter(product =>
    (product.title || '').toLowerCase().includes(productSearch.toLowerCase()) ||
    (product._id || '').toLowerCase().includes(productSearch.toLowerCase()) ||
    (product.category || '').toLowerCase().includes(productSearch.toLowerCase())
  );

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-primary-600 font-medium">Loading Edau Farm Reviews...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-green-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-800 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-primary-800">Manage Reviews</h1>
              <p className="text-gray-600 mt-2">
                Create, edit, or delete product reviews (for migrated manual reviews)
              </p>
            </div>
            <button
              onClick={openCreateModal}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Review
            </button>
          </div>
        </div>

        {/* Reviews List */}
        <div className="bg-white rounded-lg shadow border border-primary-100">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-primary-50 border-b border-primary-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-primary-700 uppercase">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-primary-700 uppercase">
                    Rating
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-primary-700 uppercase">
                    Comment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-primary-700 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-primary-700 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {reviews.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      No reviews found
                    </td>
                  </tr>
                ) : (
                  reviews.map((review) => (
                    <tr key={review._id} className="hover:bg-primary-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900">{review.userName}</div>
                          <div className="text-sm text-gray-500">{review.userEmail}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-900 line-clamp-2">{review.comment}</p>
                      </td>
                      <td className="px-6 py-4">
                        {review.verified ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            <Check className="w-3 h-3" />
                            Verified
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                            Unverified
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditModal(review)}
                            className="text-primary-600 hover:text-primary-800"
                            title="Edit review"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(review._id)}
                            className="text-red-600 hover:text-red-800"
                            title="Delete review"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-primary-800 mb-6">
                {editingReview ? 'Edit Review' : 'Create Review'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product *
                  </label>
                  {(editingReview || productPrefilled) ? (
                    <input
                      type="text"
                      value={products.find(p => p._id === formData.productId)?.title || formData.productId}
                      disabled
                      className="w-full px-4 py-2 border border-primary-200 rounded-lg bg-gray-100"
                    />
                  ) : (
                    <div className="relative">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="text"
                          value={productSearch}
                          onChange={handleProductSearch}
                          onFocus={() => setShowProductDropdown(true)}
                          required={!formData.productId}
                          className="w-full pl-10 pr-4 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="Search products by name, category, or ID..."
                        />
                      </div>
                      {showProductDropdown && productSearch && filteredProducts.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-primary-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                          {filteredProducts.slice(0, 10).map((product) => (
                            <button
                              key={product._id}
                              type="button"
                              onClick={() => selectProduct(product)}
                              className="w-full px-4 py-3 text-left hover:bg-primary-50 border-b last:border-b-0 transition-colors"
                            >
                              <div className="font-medium text-gray-900">{product.title}</div>
                              <div className="text-sm text-gray-500">
                                {product.category} • KSh {product.price.toLocaleString()}
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                      {formData.productId && (
                        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-700">
                          ✓ Product selected: {products.find(p => p._id === formData.productId)?.title || formData.productId}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      User Name *
                    </label>
                    <input
                      type="text"
                      value={formData.userName}
                      onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                      required
                      className="w-full px-4 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Verified Buyer"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      User Email
                    </label>
                    <input
                      type="email"
                      value={formData.userEmail}
                      onChange={(e) => setFormData({ ...formData, userEmail: e.target.value })}
                      className="w-full px-4 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="customer@edaufarm.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rating *
                  </label>
                  <select
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })}
                    required
                    className="w-full px-4 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value={5}>5 Stars</option>
                    <option value={4}>4 Stars</option>
                    <option value={3}>3 Stars</option>
                    <option value={2}>2 Stars</option>
                    <option value={1}>1 Star</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Comment *
                  </label>
                  <textarea
                    value={formData.comment}
                    onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                    required
                    rows={4}
                    className="w-full px-4 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Enter review comment"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.verified}
                      onChange={(e) => setFormData({ ...formData, verified: e.target.checked })}
                      className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">Mark as verified purchase</span>
                  </label>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 font-semibold"
                  >
                    {editingReview ? 'Update Review' : 'Create Review'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingReview(null);
                      resetForm();
                    }}
                    className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
