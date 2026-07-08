'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { formatPrice } from '@/lib/utils';
import { isAdmin } from '@/lib/roleCheck';
import toast from 'react-hot-toast';
import Link from 'next/link';
import {
  FiPackage,
  FiLoader,
  FiSearch,
  FiFilter,
  FiEye,
  FiCheck,
  FiX,
  FiTruck,
  FiCheckCircle,
  FiXCircle,
  FiChevronLeft,
  FiClock,
  FiRefreshCw,
  FiShield,
  FiShoppingBag,
  FiDownload,
  FiPhone,
  FiMail,
  FiMapPin
} from 'react-icons/fi';

interface Order {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  orderNumber: string;
  items: Array<{
    productId: {
      _id: string;
      title: string;
    };
    quantity: number;
    price: number;
    title: string;
    buybackEligible?: boolean;
    buybackRequested?: boolean;
    buybackRequestedAt?: string;
  }>;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod: string;
  mpesaCode?: string;
  mpesaPhone?: string;
  mpesaVerified?: boolean;
  shippingAddress: {
    fullName: string;
    phone: string;
    address: string;
    city: string;
    county: string;
    postalCode?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export default function AdminOrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updating, setUpdating] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/orders');
      setOrders(response.data.orders || []);
    } catch (error) {
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      setUpdating(true);
      await axios.patch(`/api/admin/orders/${orderId}`, { status: newStatus });
      toast.success(`Order status updated to ${newStatus}`);
      fetchOrders();
      setSelectedOrder(null);
    } catch (error) {
      toast.error('Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  const verifyMpesaPayment = async (orderId: string) => {
    try {
      setUpdating(true);
      await axios.post(`/api/admin/orders/${orderId}/verify-payment`);
      toast.success('Payment verified successfully');
      fetchOrders();
    } catch (error) {
      toast.error('Failed to verify payment');
    } finally {
      setUpdating(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      (order._id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.userId?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.userId?.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.mpesaCode || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getNextStatuses = (currentStatus: string): string[] => {
    const transitions: Record<string, string[]> = {
      'pending': ['processing', 'cancelled'],
      'processing': ['shipped', 'cancelled'],
      'shipped': ['delivered', 'cancelled'],
      'delivered': [], // Final state
      'cancelled': [], // Final state
    };
    return transitions[currentStatus] || [];
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <FiPackage className="w-4 h-4" />;
      case 'processing': return <FiLoader className="w-4 h-4 animate-spin" />;
      case 'shipped': return <FiTruck className="w-4 h-4" />;
      case 'delivered': return <FiCheckCircle className="w-4 h-4" />;
      case 'cancelled': return <FiXCircle className="w-4 h-4" />;
      default: return <FiPackage className="w-4 h-4" />;
    }
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/admin/orders');
    } else if (status === 'authenticated' && !isAdmin(session?.user?.role)) {
      toast.error('Access denied. Admin privileges required.');
      router.push('/dashboard');
    } else if (status === 'authenticated' && isAdmin(session?.user?.role)) {
      fetchOrders();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, session, router]);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-primary-600 font-medium">Loading Edau Farm Orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-green-50">
      {/* Header */}
      <div className="bg-white border-b border-primary-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <Link
                href="/admin"
                className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-800 transition-colors mb-3"
              >
                <FiChevronLeft className="w-5 h-5" />
                <span className="font-medium">Back to Dashboard</span>
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl flex items-center justify-center">
                  <FiShoppingBag className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-primary-800">Order Management</h1>
                  <p className="text-primary-600 mt-1">Track and manage all customer orders</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-primary-100 px-4 py-2 rounded-xl">
                <div className="text-sm text-primary-600">Total Orders</div>
                <div className="text-2xl font-bold text-primary-800">{filteredOrders.length}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-2xl shadow-lg border border-primary-100 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by order ID, customer, or M-Pesa code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-primary-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <FiFilter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-primary-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none transition-all"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-primary-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-primary-50 border-b border-primary-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-primary-700 uppercase tracking-wider">Order ID</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-primary-700 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-primary-700 uppercase tracking-wider">Items</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-primary-700 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-primary-700 uppercase tracking-wider">Payment</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-primary-700 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-primary-700 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-primary-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary-100">
                {filteredOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-primary-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-mono font-medium text-primary-800">#{order._id.slice(-8)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{order.userId?.name || 'N/A'}</div>
                      <div className="text-xs text-gray-500">{order.userId?.email || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-medium">{order.items.length} item(s)</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-primary-800">{formatPrice(order.total)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 capitalize font-medium">{order.paymentMethod}</div>
                      {order.mpesaCode && (
                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                          <span className="font-mono">{order.mpesaCode}</span>
                          {order.mpesaVerified && <FiCheck className="w-3 h-3 text-green-600" />}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{new Date(order.createdAt).toLocaleDateString()}</div>
                      <div className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleTimeString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 text-sm font-medium transition-all shadow-sm hover:shadow-md"
                      >
                        <FiEye className="w-4 h-4" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredOrders.length === 0 && (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiPackage className="w-8 h-8 text-primary-400" />
              </div>
              <p className="text-gray-600 font-medium">No orders found</p>
              <p className="text-sm text-gray-500 mt-1">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-5 flex items-center justify-between rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <FiShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Order Details</h2>
                  <p className="text-sm text-primary-200">#{selectedOrder._id.slice(-8)}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Order Info Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-primary-50 rounded-xl p-4 border border-primary-100">
                  <div className="flex items-center gap-2 mb-2">
                    <FiClock className="w-4 h-4 text-primary-600" />
                    <label className="text-sm font-semibold text-primary-600 uppercase tracking-wide">Order Status</label>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold ${getStatusColor(selectedOrder.status)}`}>
                    {getStatusIcon(selectedOrder.status)}
                    {selectedOrder.status}
                  </span>
                </div>
                <div className="bg-primary-50 rounded-xl p-4 border border-primary-100">
                  <div className="flex items-center gap-2 mb-2">
                    <FiShield className="w-4 h-4 text-primary-600" />
                    <label className="text-sm font-semibold text-primary-600 uppercase tracking-wide">Payment Status</label>
                  </div>
                  <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold ${
                    selectedOrder.paymentStatus === 'paid'
                      ? 'bg-green-100 text-green-800 border border-green-200'
                      : selectedOrder.paymentStatus === 'failed'
                      ? 'bg-red-100 text-red-800 border border-red-200'
                      : selectedOrder.paymentStatus === 'refunded'
                      ? 'bg-blue-100 text-blue-800 border border-blue-200'
                      : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                  }`}>
                    {selectedOrder.paymentStatus || 'pending'}
                  </span>
                </div>
                <div className="bg-primary-50 rounded-xl p-4 border border-primary-100">
                  <div className="flex items-center gap-2 mb-2">
                    <FiCheckCircle className="w-4 h-4 text-primary-600" />
                    <label className="text-sm font-semibold text-primary-600 uppercase tracking-wide">Verification</label>
                  </div>
                  <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold ${
                    selectedOrder.mpesaVerified
                      ? 'bg-green-100 text-green-800 border border-green-200'
                      : 'bg-gray-100 text-gray-800 border border-gray-200'
                  }`}>
                    {selectedOrder.mpesaVerified ? '✓ Verified' : 'Not Verified'}
                  </span>
                </div>
              </div>

              {/* Customer & Payment Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-primary-50 to-white rounded-xl p-5 border border-primary-100">
                  <h3 className="font-bold text-primary-800 mb-4 flex items-center gap-2">
                    <FiMail className="w-5 h-5 text-primary-600" />
                    Customer Information
                  </h3>
                  <div className="space-y-2">
                    <p className="text-lg font-semibold text-gray-900">{selectedOrder.userId?.name || 'N/A'}</p>
                    <p className="text-sm text-gray-600">{selectedOrder.userId?.email || 'N/A'}</p>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-primary-50 to-white rounded-xl p-5 border border-primary-100">
                  <h3 className="font-bold text-primary-800 mb-4 flex items-center gap-2">
                    <FiShield className="w-5 h-5 text-primary-600" />
                    Payment Details
                  </h3>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">Method: <span className="font-semibold text-gray-900 capitalize">{selectedOrder.paymentMethod}</span></p>
                    {selectedOrder.mpesaCode && (
                      <p className="text-sm text-gray-600">M-Pesa Code: <span className="font-mono font-semibold text-gray-900">{selectedOrder.mpesaCode}</span></p>
                    )}
                  </div>
                </div>
              </div>

              {/* Items */}
              <div className="bg-gradient-to-br from-primary-50 to-white rounded-xl p-6 border border-primary-100">
                <h3 className="font-bold text-primary-800 mb-4 flex items-center gap-2">
                  <FiPackage className="w-5 h-5 text-primary-600" />
                  Order Items
                </h3>
                <div className="space-y-3">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-start p-4 bg-white rounded-xl border border-gray-200 hover:border-primary-200 transition-colors">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{item.productId?.title || item.title || 'Product'}</p>
                        <p className="text-sm text-gray-600 mt-1">Quantity: <span className="font-medium">{item.quantity}</span></p>
                        {item.buybackEligible && (
                          <div className="mt-2">
                            {item.buybackRequested ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full border border-blue-200">
                                🔄 Buyback Requested
                                {item.buybackRequestedAt && ` (${new Date(item.buybackRequestedAt).toLocaleDateString()})`}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full border border-gray-200">
                                ✓ Buyback Eligible
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <p className="font-bold text-primary-800 text-lg">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-5 pt-5 border-t border-gray-200 flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">Total Amount</span>
                  <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">{formatPrice(selectedOrder.total)}</span>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-gradient-to-br from-primary-50 to-white rounded-xl p-6 border border-primary-100">
                <h3 className="font-bold text-primary-800 mb-4 flex items-center gap-2">
                  <FiMapPin className="w-5 h-5 text-primary-600" />
                  Shipping Address
                </h3>
                <div className="space-y-2">
                  <p className="font-semibold text-gray-900 text-lg">{selectedOrder.shippingAddress.fullName}</p>
                  <div className="flex items-center gap-2 text-gray-600">
                    <FiPhone className="w-4 h-4" />
                    <p className="text-sm">{selectedOrder.shippingAddress.phone}</p>
                  </div>
                  <p className="text-sm text-gray-600">{selectedOrder.shippingAddress.address}</p>
                  <p className="text-sm text-gray-600">{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.county}</p>
                  {selectedOrder.shippingAddress.postalCode && (
                    <p className="text-sm text-gray-600">Postal Code: {selectedOrder.shippingAddress.postalCode}</p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="bg-gradient-to-br from-primary-50 to-white rounded-xl p-6 border border-primary-100">
                <h3 className="font-bold text-primary-800 mb-4 flex items-center gap-2">
                  <FiRefreshCw className="w-5 h-5 text-primary-600" />
                  Update Order Status
                </h3>
                <div className="mb-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <p className="text-sm text-blue-900">
                    <strong>Current Status:</strong> <span className="capitalize font-semibold">{selectedOrder.status}</span>
                  </p>
                  {getNextStatuses(selectedOrder.status).length > 0 && (
                    <p className="text-sm text-blue-700 mt-1">
                      <strong>Available Transitions:</strong> {getNextStatuses(selectedOrder.status).join(', ')}
                    </p>
                  )}
                  {getNextStatuses(selectedOrder.status).length === 0 && (
                    <p className="text-sm text-gray-600 mt-1">
                      This order is in a final state and cannot be updated.
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => {
                    const isCurrentStatus = selectedOrder.status === status;
                    const isValidTransition = getNextStatuses(selectedOrder.status).includes(status);
                    const isDisabled = updating || (!isValidTransition && !isCurrentStatus);

                    return (
                      <button
                        key={status}
                        onClick={() => updateOrderStatus(selectedOrder._id, status)}
                        disabled={isDisabled}
                        className={`px-4 py-3 rounded-xl font-semibold transition-all ${
                          isCurrentStatus
                            ? 'bg-primary-600 text-white shadow-md cursor-default border-2 border-primary-500'
                            : isValidTransition
                            ? 'bg-primary-500 text-white hover:bg-primary-600 shadow-sm hover:shadow-md'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                        title={
                          isCurrentStatus
                            ? 'Current status'
                            : isValidTransition
                            ? `Update to ${status}`
                            : 'Invalid transition'
                        }
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                        {isCurrentStatus && ' ✓'}
                      </button>
                    );
                  })}
                </div>

                {/* Approve Payment for non-STK methods */}
                {selectedOrder.paymentMethod !== 'stk-push' && selectedOrder.paymentStatus === 'pending' && (
                  <div className="mt-5 p-5 bg-yellow-50 border-2 border-yellow-200 rounded-xl">
                    <p className="text-sm text-yellow-900 mb-3 font-medium">
                      <strong>⚠️ Payment Not Approved</strong> - Payment method: {selectedOrder.paymentMethod}
                    </p>
                    <button
                      onClick={async () => {
                        setUpdating(true);
                        try {
                          await axios.patch(`/api/admin/orders/${selectedOrder._id}`, { paymentStatus: 'paid' });
                          toast.success('Payment approved!');
                          fetchOrders();
                          setSelectedOrder(null);
                        } catch (error) {
                          toast.error('Failed to approve payment');
                        } finally {
                          setUpdating(false);
                        }
                      }}
                      disabled={updating}
                      className="w-full px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 font-semibold disabled:bg-gray-400 transition-all shadow-sm hover:shadow-md"
                    >
                      {updating ? 'Approving...' : 'Approve Payment'}
                    </button>
                  </div>
                )}

                {selectedOrder.paymentMethod === 'mpesa' && !selectedOrder.mpesaVerified && (
                  <div className="mt-5 p-5 bg-yellow-50 border-2 border-yellow-200 rounded-xl">
                    <p className="text-sm text-yellow-900 mb-3 font-medium">
                      <strong>⚠️ Payment Not Verified</strong> - M-Pesa code: {selectedOrder.mpesaCode || 'Not provided'}
                    </p>
                    <button
                      onClick={() => verifyMpesaPayment(selectedOrder._id)}
                      disabled={updating}
                      className="w-full px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 font-semibold disabled:bg-gray-400 transition-all shadow-sm hover:shadow-md"
                    >
                      {updating ? 'Verifying...' : 'Verify M-Pesa Payment'}
                    </button>
                  </div>
                )}

                {selectedOrder.paymentMethod === 'mpesa' && selectedOrder.mpesaVerified && (
                  <div className="mt-5 p-4 bg-green-50 border-2 border-green-200 rounded-xl">
                    <p className="text-sm text-green-900 font-medium">
                      ✅ <strong>Payment Verified</strong> - M-Pesa code: {selectedOrder.mpesaCode}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
