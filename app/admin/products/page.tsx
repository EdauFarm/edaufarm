'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { isAdmin } from '@/lib/roleCheck';
import toast from 'react-hot-toast';
import { Package, Search, ListFilter as Filter, CreditCard as Edit, Trash2, CircleCheck as CheckCircle, Circle as XCircle, Clock, Eye, ChevronLeft, ChevronRight, DollarSign, Plus } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import axios from 'axios';
import Link from 'next/link';

interface Product {
  _id: string;
  title: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  category: string;
  subcategory?: string;
  brand?: string;
  sku: string;
  stock: number;
  images: string[];
  active: boolean;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function AdminProductsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'pending' | 'featured'>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/admin/products');
    } else if (status === 'authenticated') {
      if (!isAdmin(session?.user?.role)) {
        toast.error('Access denied. Admin privileges required.');
        router.push('/dashboard');
      } else {
        fetchProducts();
      }
    }
  }, [status, session, router, page, searchTerm, statusFilter]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
      });

      if (searchTerm) params.append('search', searchTerm);
      
      // Fetch different product sets based on filter
      let endpoint = '/api/products';
      if (statusFilter === 'pending') {
        endpoint = '/api/admin/products/approve';
      } else {
        if (statusFilter === 'featured') params.append('featured', 'true');
        // For 'all' and 'active', we need to modify the API call
      }

      const response = await axios.get(endpoint, { params });
      
      let fetchedProducts = response.data.products || [];
      
      // Apply additional filtering for 'all' and 'active'
      if (statusFilter === 'all') {
        // Fetch all products (active and inactive)
        const allResponse = await axios.get('/api/products', { 
          params: { ...Object.fromEntries(params), limit: '100' } 
        });
        fetchedProducts = allResponse.data.products || [];
      } else if (statusFilter === 'active') {
        fetchedProducts = fetchedProducts.filter((p: Product) => p.active);
      }

      setProducts(fetchedProducts);
      setTotal(fetchedProducts.length);
      setTotalPages(Math.ceil(fetchedProducts.length / 12));
    } catch (error) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveProduct = async (productId: string, approved: boolean) => {
    setActionLoading(productId);
    try {
      await axios.post('/api/admin/products/approve', {
        productId,
        approved,
      });

      toast.success(`Product ${approved ? 'approved' : 'rejected'} successfully`);
      fetchProducts();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update product');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteProduct = async (productId: string, productTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${productTitle}"? This action cannot be undone.`)) {
      return;
    }

    setActionLoading(productId);
    try {
      await axios.delete(`/api/products/${productId}`);
      toast.success('Product deleted successfully');
      fetchProducts();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete product');
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleFeatured = async (productId: string, currentFeatured: boolean) => {
    setActionLoading(productId);
    try {
      await axios.put(`/api/products/${productId}`, {
        featured: !currentFeatured,
      });
      toast.success(`Product ${!currentFeatured ? 'featured' : 'unfeatured'} successfully`);
      fetchProducts();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update product');
    } finally {
      setActionLoading(null);
    }
  };

  const handleAutoInactive = async () => {
    try {
      toast.loading('Analyzing product visibility...');
      const response = await axios.post('/api/admin/products/auto-inactive');
      toast.dismiss();
      
      const { updated, reactivated, details } = response.data;
      
      toast.success(
        `Visibility updated! Deactivated: ${updated}, Reactivated: ${reactivated}`,
        { duration: 5000 }
      );
      
      fetchProducts();
    } catch (error: any) {
      toast.dismiss();
      toast.error(error.response?.data?.error || 'Failed to update visibility');
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-primary-600 font-medium">Loading Edau Farm Products...</p>
        </div>
      </div>
    );
  }

  const stats = {
    total: total,
    active: products.filter(p => p.active).length,
    inactive: products.filter(p => !p.active).length,
    featured: products.filter(p => p.featured).length,
    pending: products.filter(p => !p.active && p.stock > 0).length, // Products that are inactive but have stock
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-green-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href="/admin"
              className="flex items-center gap-2 text-primary-600 hover:text-primary-800 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              <span>Back to Dashboard</span>
            </Link>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary-700 to-primary-600 bg-clip-text text-transparent mb-2">
                Product Management
              </h1>
              <p className="text-gray-600">Manage all farm products in your catalog</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleAutoInactive}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg hover:shadow-lg hover:shadow-primary-500/30 transition-all font-semibold"
              >
                <Eye className="w-5 h-5" />
                Auto-Hide Inactive
              </button>
              <Link
                href="/admin/products/new"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:shadow-lg hover:shadow-green-500/30 transition-all font-semibold"
              >
                <Package className="w-5 h-5" />
                Add Product
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-primary-100 p-6 hover:shadow-xl transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl flex items-center justify-center shadow-lg shadow-gray-500/30 group-hover:scale-110 transition-transform">
                <Package className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-semibold text-gray-600 bg-gray-50 px-3 py-1 rounded-full">
                Total
              </span>
            </div>
            <div>
              <p className="text-gray-500 text-sm font-medium mb-1">Total Products</p>
              <h3 className="text-3xl font-bold text-primary-800">{stats.total.toLocaleString()}</h3>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-primary-100 p-6 hover:shadow-xl transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/30 group-hover:scale-110 transition-transform">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full">
                Active
              </span>
            </div>
            <div>
              <p className="text-gray-500 text-sm font-medium mb-1">Active Products</p>
              <h3 className="text-3xl font-bold text-green-600">{stats.active.toLocaleString()}</h3>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-primary-100 p-6 hover:shadow-xl transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-500/30 group-hover:scale-110 transition-transform">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-semibold text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full">
                Pending
              </span>
            </div>
            <div>
              <p className="text-gray-500 text-sm font-medium mb-1">Pending Approval</p>
              <h3 className="text-3xl font-bold text-yellow-600">{stats.pending.toLocaleString()}</h3>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-primary-100 p-6 hover:shadow-xl transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/30 group-hover:scale-110 transition-transform">
                <Package className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-semibold text-primary-600 bg-primary-50 px-3 py-1 rounded-full">
                Featured
              </span>
            </div>
            <div>
              <p className="text-gray-500 text-sm font-medium mb-1">Featured</p>
              <h3 className="text-3xl font-bold text-primary-600">{stats.featured.toLocaleString()}</h3>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow border border-primary-100 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Search className="w-4 h-4 inline mr-2" />
                Search
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                placeholder="Search by title, SKU, or category..."
                className="w-full px-4 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Filter className="w-4 h-4 inline mr-2" />
                Status Filter
              </label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as any);
                  setPage(1);
                }}
                className="w-full px-4 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">All Products</option>
                <option value="active">Active Only</option>
                <option value="pending">Pending Approval</option>
                <option value="featured">Featured</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600">
              {statusFilter === 'pending' 
                ? 'No products are currently pending approval' 
                : 'Try adjusting your search or filters'}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              {products.map((product) => (
                <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  {/* Product Image */}
                  <div className="relative h-48 bg-gray-200">
                    {product.images && product.images[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-16 h-16 text-gray-400" />
                      </div>
                    )}
                    {product.featured && (
                      <span className="absolute top-2 right-2 bg-purple-600 text-white text-xs px-2 py-1 rounded-full">
                        Featured
                      </span>
                    )}
                    {!product.active && (
                      <span className="absolute top-2 left-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">
                        Pending
                      </span>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{product.title}</h3>
                    <p className="text-sm text-gray-500 mb-2">{product.category}</p>
                    
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <span className="text-lg font-bold text-gray-900">{formatPrice(product.price)}</span>
                        {product.compareAtPrice && (
                          <span className="text-sm text-gray-500 line-through ml-2">
                            {formatPrice(product.compareAtPrice)}
                          </span>
                        )}
                      </div>
                      <span className={`text-sm ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        Stock: {product.stock}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2">
                      {!product.active && (
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => handleApproveProduct(product._id, true)}
                            disabled={actionLoading === product._id}
                            className="flex items-center justify-center gap-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm disabled:opacity-50"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleApproveProduct(product._id, false)}
                            disabled={actionLoading === product._id}
                            className="flex items-center justify-center gap-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm disabled:opacity-50"
                          >
                            <XCircle className="w-4 h-4" />
                            Reject
                          </button>
                        </div>
                      )}

                      <div className="grid grid-cols-5 gap-3">
                        <Link
                          href={`/products/${product._id}`}
                          className="flex items-center justify-center gap-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm"
                          title="View Product"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/admin/products/${product._id}`}
                          className="flex items-center justify-center gap-1 px-3 py-2 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 text-sm"
                          title="Edit Product"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/admin/reviews?add=1&productId=${product._id}`}
                          className="flex items-center justify-center gap-1 px-3 py-2 border border-green-300 text-green-700 rounded-lg hover:bg-green-50 text-sm"
                          title="Add Review"
                        >
                          <Plus className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleToggleFeatured(product._id, product.featured)}
                          disabled={actionLoading === product._id}
                          className={`flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-sm disabled:opacity-50 ${
                            product.featured
                              ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                              : 'border border-purple-300 text-purple-700 hover:bg-purple-50'
                          }`}
                          title={product.featured ? 'Unfeature' : 'Feature'}
                        >
                          ★
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product._id, product.title)}
                          disabled={actionLoading === product._id}
                          className="flex items-center justify-center gap-1 px-3 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 text-sm disabled:opacity-50"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-white rounded-lg shadow p-4 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Page {page} of {totalPages}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
