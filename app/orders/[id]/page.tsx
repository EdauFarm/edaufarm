'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { formatPrice, formatDate } from '@/lib/utils';
import axios from 'axios';
import Image from 'next/image';
import LoadingSpinner from '@/components/LoadingSpinner';
import { FiRotateCcw, FiDownload, FiFileText } from 'react-icons/fi';

export default function OrderDetailPage() {
  const params = useParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showBuybackModal, setShowBuybackModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [buybackForm, setBuybackForm] = useState({
    requestedAmount: '',
    reason: '',
    condition: 'good',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [params.id]);

  const fetchOrder = async () => {
    try {
      const res = await axios.get(`/api/orders/${params.id}`);
      setOrder(res.data.order);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const handleBuybackRequest = (item: any) => {
    setSelectedProduct(item);
    setBuybackForm({
      requestedAmount: (item.price * 0.5).toString(),
      reason: '',
      condition: 'good',
    });
    setShowBuybackModal(true);
  };

  const submitBuyback = async () => {
    if (!selectedProduct) return;
    
    setSubmitting(true);
    try {
      await axios.post('/api/buyback', {
        orderId: order._id,
        productId: selectedProduct.productId,
        requestedAmount: parseFloat(buybackForm.requestedAmount),
        reason: buybackForm.reason,
        condition: buybackForm.condition,
      });
      
      alert('Buyback request submitted successfully! We\'ll review it within 24-48 hours.');
      setShowBuybackModal(false);
      
      // Refresh order data to show updated buyback status
      await fetchOrder();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to submit buyback request');
    } finally {
      setSubmitting(false);
    }
  };

  const downloadReceipt = async () => {
    try {
      const response = await axios.get(`/api/orders/${order._id}/receipt`);
      
      
      // Create a Blob from HTML and trigger download
      const blob = new Blob([response.data], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `receipt-${order.orderNumber}.html`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      alert(`Failed to download receipt: ${error.response?.data?.error || error.message}`);
    }
  };

  const viewReceipt = async () => {
    try {
      // Open receipt in new tab
      window.open(`/api/orders/${order._id}/receipt`, '_blank');
    } catch (error: any) {
      alert(`Failed to view receipt: ${error.message}`);
    }
  };

  const canRequestBuyback = (item: any, orderDate: string) => {
    // Check if the item is buyback eligible
    if (!item.buybackEligible) return false;
    
    // Check if already requested buyback
    if (item.buybackRequested) return false;
    
    // Check if order status is shipped or delivered
    if (order.status !== 'shipped' && order.status !== 'delivered') return false;
    
    // For delivered orders, require at least 2 days
    if (order.status === 'delivered') {
      const orderAge = Date.now() - new Date(orderDate).getTime();
      const minAge = 2 * 24 * 60 * 60 * 1000;
      return orderAge >= minAge;
    }
    
    // For shipped orders, allow immediate buyback request
    return true;
  };

  const getBuybackStatusText = (item: any) => {
    if (!item.buybackEligible) return null;
    
    if (item.buybackRequested) {
      return {
        type: 'requested',
        text: `Buyback Requested${item.buybackRequestedAt ? ' on ' + formatDate(item.buybackRequestedAt) : ''}`,
        icon: FiRotateCcw,
        className: 'bg-blue-50 text-blue-700'
      };
    }
    
    if (order.status === 'pending' || order.status === 'processing') {
      return {
        type: 'pending',
        text: 'Buyback available after shipping',
        icon: FiRotateCcw,
        className: 'text-gray-500'
      };
    }
    
    if (order.status === 'shipped') {
      return {
        type: 'available',
        text: 'Buyback Available',
        icon: FiRotateCcw,
        className: 'text-orange-600'
      };
    }
    
    if (order.status === 'delivered') {
      const orderAge = Date.now() - new Date(order.createdAt).getTime();
      const minAge = 2 * 24 * 60 * 60 * 1000;
      const daysRemaining = Math.ceil((minAge - orderAge) / (24 * 60 * 60 * 1000));
      
      if (orderAge < minAge) {
        return {
          type: 'waiting',
          text: `Buyback available in ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''}`,
          icon: FiRotateCcw,
          className: 'text-gray-500'
        };
      }
      
      return {
        type: 'available',
        text: 'Buyback Available',
        icon: FiRotateCcw,
        className: 'text-orange-600'
      };
    }
    
    return null;
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
        <h1 className="text-2xl font-bold">Order not found</h1>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
        <p className="text-sm text-green-700">
          <strong>Whatsapp | Number | 25431419320</strong><br />
          <strong>Email:</strong> support@edaufarm.com
        </p>
      </div>
      <div className="bg-white border border-gray-200 rounded p-6 mb-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-2">Order Details</h1>
            <p className="text-gray-600">Order #{order.orderNumber}</p>
            <p className="text-gray-600">Placed on {formatDate(order.createdAt)}</p>
          </div>
          <span
            className={`px-4 py-2 rounded-full font-semibold ${getStatusColor(
              order.status
            )}`}
          >
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </span>
        </div>

        {/* Order Items */}
        <div className="border-t pt-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Items Ordered</h2>
          <div className="space-y-4">
            {order.items.map((item: any) => (
              <div
                key={`${item.productId}-${item.variant}`}
                className="flex items-center space-x-4 pb-4 border-b last:border-b-0"
              >
                <div className="relative w-20 h-20 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{item.title}</h3>
                  {item.variant && (
                    <p className="text-sm text-gray-500">Variant: {item.variant}</p>
                  )}
                  <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                  
                  {/* Buyback Status or Action for Individual Item */}
                  {(() => {
                    const buybackStatus = getBuybackStatusText(item);
                    if (!buybackStatus) return null;

                    if (buybackStatus.type === 'requested') {
                      return (
                        <div className="mt-2 inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
                          <FiRotateCcw className="text-sm" />
                          {buybackStatus.text}
                        </div>
                      );
                    }

                    if (buybackStatus.type === 'available' && canRequestBuyback(item, order.createdAt)) {
                      return (
                        <button
                          onClick={() => handleBuybackRequest(item)}
                          className="mt-2 text-sm bg-gray-50 hover:bg-gray-100 text-gray-900 hover:text-gray-900 font-medium flex items-center gap-1 px-3 py-1.5 rounded transition-all border border-gray-200"
                        >
                          <FiRotateCcw className="text-sm" />
                          Request Buyback
                        </button>
                      );
                    }

                    return (
                      <div className={`mt-2 text-xs flex items-center gap-1 ${buybackStatus.className}`}>
                        <FiRotateCcw className="text-sm" />
                        {buybackStatus.text}
                      </div>
                    );
                  })()}
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatPrice(item.price)}</p>
                  <p className="text-sm text-gray-600">
                    Total: {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Shipping Address */}
        <div className="border-t pt-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Shipping Address</h2>
          <div className="text-gray-700">
            <p className="font-semibold">{order.shippingAddress.fullName}</p>
            <p>{order.shippingAddress.phone}</p>
            <p>{order.shippingAddress.address}</p>
            <p>
              {order.shippingAddress.city}, {order.shippingAddress.county}
              {order.shippingAddress.postalCode && ` ${order.shippingAddress.postalCode}`}
            </p>
          </div>
        </div>

        {/* Delivered Order Actions */}
        {order.status === 'delivered' && (
          <div className="border-t pt-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Order Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={viewReceipt}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                <FiFileText className="text-lg" />
                View Receipt
              </button>
              <button
                onClick={downloadReceipt}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
              >
                <FiDownload className="text-lg" />
                Download Receipt
              </button>
            </div>
          </div>
        )}

        {/* Order Summary */}
        <div className="border-t pt-6">
          <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-semibold">{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Shipping</span>
              <span className="font-semibold">
                {order.shipping === 0 ? 'FREE' : formatPrice(order.shipping)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tax</span>
              <span className="font-semibold">{formatPrice(order.tax)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t pt-2">
              <span>Total</span>
              <span className="text-primary-600">{formatPrice(order.total)}</span>
            </div>
          </div>

          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Payment Method</span>
              <span className="font-semibold capitalize">{order.paymentMethod}</span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-gray-700">Payment Status</span>
              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  order.paymentStatus === 'paid'
                    ? 'bg-green-100 text-green-800'
                    : order.paymentStatus === 'pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {order.paymentStatus.charAt(0).toUpperCase() +
                  order.paymentStatus.slice(1)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Buyback Request Modal */}
      {showBuybackModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Request Buyback</h3>
            
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="relative w-16 h-16 bg-gray-200 rounded-lg overflow-hidden">
                  <Image
                    src={selectedProduct.image}
                    alt={selectedProduct.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-semibold">{selectedProduct.title}</h4>
                  <p className="text-sm text-gray-600">
                    Original Price: {formatPrice(selectedProduct.price)}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Product Condition
                </label>
                <select
                  value={buybackForm.condition}
                  onChange={(e) => setBuybackForm({ ...buybackForm, condition: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="excellent">Excellent - Like new, no defects</option>
                  <option value="good">Good - Minor wear, fully functional</option>
                  <option value="fair">Fair - Visible wear, fully functional</option>
                  <option value="poor">Poor - Significant wear or defects</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Requested Buyback Amount (KSh)
                </label>
                <input
                  type="number"
                  value={buybackForm.requestedAmount}
                  onChange={(e) => setBuybackForm({ ...buybackForm, requestedAmount: e.target.value })}
                  min="1"
                  max={selectedProduct.price}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Typical range: 30-70% of original price
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Reason for Buyback
                </label>
                <textarea
                  value={buybackForm.reason}
                  onChange={(e) => setBuybackForm({ ...buybackForm, reason: e.target.value })}
                  rows={4}
                  maxLength={500}
                  placeholder="Please explain why you want to sell this product back..."
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  {buybackForm.reason.length}/500 characters
                </p>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  <strong>How it works:</strong>
                </p>
                <ol className="text-sm text-blue-700 mt-2 space-y-1 list-decimal list-inside">
                  <li>Admin reviews your request (24-48 hours)</li>
                  <li>Amount credited to your wallet upon approval</li>
                  <li>Withdraw to M-Pesa anytime</li>
                </ol>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowBuybackModal(false)}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={submitBuyback}
                disabled={submitting || !buybackForm.reason.trim()}
                className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
