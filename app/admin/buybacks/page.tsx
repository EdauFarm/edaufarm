'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { formatPrice, formatDate } from '@/lib/utils';
import LoadingSpinner from '@/components/LoadingSpinner';
import axios from 'axios';
import Image from 'next/image';
import { FiRotateCcw, FiCheckCircle, FiXCircle, FiClock } from 'react-icons/fi';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default function AdminBuybacksPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [buybacks, setBuybacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending'>('pending');
  const [selectedBuyback, setSelectedBuyback] = useState<any>(null);
  const [actionModal, setActionModal] = useState<'approve' | 'reject' | null>(null);
  const [comments, setComments] = useState('');
  const [approvedAmount, setApprovedAmount] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated' && session?.user?.role !== 'admin') {
      router.push('/dashboard');
    } else if (status === 'authenticated') {
      fetchBuybacks();
    }
  }, [status, session]);

  const fetchBuybacks = async () => {
    try {
      // In production, create a dedicated admin endpoint
      const res = await axios.get('/api/buyback');
      setBuybacks(res.data.buybacks);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: 'approve' | 'reject') => {
    if (!selectedBuyback) return;

    setProcessing(true);
    try {
      await axios.patch(`/api/buyback/${selectedBuyback._id}`, {
        action: action === 'approve' ? 'approve' : 'reject',
        approvedAmount: action === 'approve' ? parseFloat(approvedAmount) : undefined,
        comments,
      });

      alert(`Buyback ${action}d successfully!`);
      setActionModal(null);
      setSelectedBuyback(null);
      setComments('');
      setApprovedAmount('');
      fetchBuybacks();
    } catch (error: any) {
      alert(error.response?.data?.error || `Failed to ${action} buyback`);
    } finally {
      setProcessing(false);
    }
  };

  const filteredBuybacks = buybacks.filter((b) => {
    if (filter === 'all') return true;
    if (filter === 'pending') return b.status === 'pending';
    return true;
  });

  if (status === 'loading' || loading) {
    return (
      <DashboardLayout role="admin">
        <LoadingSpinner />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="admin">
      <div className="flex items-center gap-4 mb-4">
        <Link
          href="/admin"
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Back to Dashboard</span>
        </Link>
      </div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Buyback Requests</h1>
        <p className="text-gray-600">Review and approve buyback requests</p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded-lg font-medium ${
            filter === 'pending'
              ? 'bg-slate-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Pending Review
        </button>
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium ${
            filter === 'all'
              ? 'bg-slate-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All Requests
        </button>
      </div>

      {/* Buybacks List */}
      <div className="bg-white rounded-lg shadow">
        {filteredBuybacks.length === 0 ? (
          <div className="text-center py-12">
            <FiRotateCcw className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No buyback requests found</p>
          </div>
        ) : (
          <div className="divide-y">
            {filteredBuybacks.map((buyback) => (
              <div key={buyback._id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start gap-4">
                  <div className="relative w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {buyback.productId?.image_url && (
                      <Image
                        src={buyback.productId.image_url}
                        alt={buyback.productId.title}
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-lg">
                          {buyback.productId?.title || 'Product'}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Order #{buyback.orderId?.orderNumber} • {formatDate(buyback.createdAt)}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          buyback.status === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : buyback.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : buyback.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {buyback.status.replace(/_/g, ' ').toUpperCase()}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                      <div>
                        <span className="text-gray-600">Customer:</span>
                        <p className="font-semibold">{buyback.userId?.name || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Requested:</span>
                        <p className="font-semibold">KSh {buyback.requestedAmount.toLocaleString()}</p>
                      </div>
                      {buyback.approvedAmount && (
                        <div>
                          <span className="text-gray-600">Approved Amount:</span>
                          <p className="font-semibold text-green-600">
                            KSh {buyback.approvedAmount.toLocaleString()}
                          </p>
                        </div>
                      )}
                      <div>
                        <span className="text-gray-600">Condition:</span>
                        <p className="font-semibold capitalize">{buyback.condition}</p>
                      </div>
                    </div>

                    <div className="mb-3">
                      <span className="text-sm text-gray-600">Reason:</span>
                      <p className="text-sm mt-1">{buyback.reason}</p>
                    </div>

                    {buyback.status === 'pending' && (
                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={() => {
                            setSelectedBuyback(buyback);
                            setApprovedAmount(buyback.approvedAmount?.toString() || buyback.requestedAmount.toString());
                            setActionModal('approve');
                          }}
                          className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                        >
                          <FiCheckCircle />
                          Approve & Credit Wallet
                        </button>
                        <button
                          onClick={() => {
                            setSelectedBuyback(buyback);
                            setActionModal('reject');
                          }}
                          className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                        >
                          <FiXCircle />
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Modal */}
      {actionModal && selectedBuyback && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">
              {actionModal === 'approve' ? 'Approve Buyback' : 'Reject Buyback'}
            </h3>

            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold">{selectedBuyback.productId?.title}</h4>
              <p className="text-sm text-gray-600 mt-1">
                Customer: {selectedBuyback.userId?.name}
              </p>
            </div>

            {actionModal === 'approve' && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Final Approved Amount (KSh)
                </label>
                <input
                  type="number"
                  value={approvedAmount}
                  onChange={(e) => setApprovedAmount(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  min="1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Requested: KSh {selectedBuyback.requestedAmount?.toLocaleString()}
                </p>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Comments (Optional)
              </label>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                rows={3}
                placeholder="Add any comments or notes..."
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setActionModal(null);
                  setSelectedBuyback(null);
                  setComments('');
                  setApprovedAmount('');
                }}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAction(actionModal)}
                disabled={processing || (actionModal === 'approve' && !approvedAmount)}
                className={`flex-1 px-4 py-2 text-white rounded-lg disabled:opacity-50 ${
                  actionModal === 'approve'
                    ? 'bg-green-500 hover:bg-green-600'
                    : 'bg-red-500 hover:bg-red-600'
                }`}
              >
                {processing ? 'Processing...' : actionModal === 'approve' ? 'Approve' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
