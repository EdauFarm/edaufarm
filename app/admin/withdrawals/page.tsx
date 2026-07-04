'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { formatPrice } from '@/lib/utils';
import { 
  DollarSign, 
  Loader2, 
  Check, 
  X, 
  Clock, 
  User,
  Smartphone,
  Calendar
} from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import toast from 'react-hot-toast';
import { Analytics } from '@vercel/analytics/react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

interface Withdrawal {
  _id: string;
  walletId: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  amount: number;
  mpesaNumber: string;
  mpesaReference: string;
  description: string;
  createdAt: string;
}

export default function AdminWithdrawalsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (session?.user?.role !== 'admin') {
      router.push('/');
    } else {
      fetchWithdrawals();
    }
  }, [session, status, router]);

  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/wallet/withdrawals');
      setWithdrawals(response.data.withdrawals || []);
    } catch (error) {
      toast.error('Failed to fetch withdrawals');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (withdrawalId: string) => {
    if (!confirm('Are you sure you want to approve this withdrawal?')) {
      return;
    }

    try {
      setProcessing(withdrawalId);
      await axios.patch(`/api/admin/wallet/withdrawals/${withdrawalId}`, {
        action: 'approve',
      });
      toast.success('Withdrawal approved successfully');
      fetchWithdrawals();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to approve withdrawal');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async () => {
    if (!selectedWithdrawal) return;

    try {
      setProcessing(selectedWithdrawal._id);
      await axios.patch(`/api/admin/wallet/withdrawals/${selectedWithdrawal._id}`, {
        action: 'reject',
        reason: rejectReason || 'Admin decision',
      });
      toast.success('Withdrawal rejected and amount refunded');
      setShowRejectModal(false);
      setRejectReason('');
      setSelectedWithdrawal(null);
      fetchWithdrawals();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to reject withdrawal');
    } finally {
      setProcessing(null);
    }
  };

  const openRejectModal = (withdrawal: Withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setShowRejectModal(true);
  };

  if (status === 'loading' || loading) {
    return (
      <DashboardLayout role="admin">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-slate-500" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="admin">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href="/admin"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              <span>Back to Dashboard</span>
            </Link>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
            <DollarSign className="w-7 h-7 sm:w-8 sm:h-8 text-slate-500" />
            Withdrawal Requests
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-2">
            Review and approve pending withdrawal requests
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-gradient-to-br from-slate-500 to-slate-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm sm:text-base font-medium opacity-90">Pending Withdrawals</h3>
              <Clock className="w-5 h-5 sm:w-6 sm:h-6 opacity-80" />
            </div>
            <p className="text-2xl sm:text-3xl font-bold">{withdrawals.length}</p>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm sm:text-base font-medium opacity-90">Total Amount</h3>
              <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 opacity-80" />
            </div>
            <p className="text-2xl sm:text-3xl font-bold">
              {formatPrice(withdrawals.reduce((sum, w) => sum + w.amount, 0))}
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white shadow-lg sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm sm:text-base font-medium opacity-90">Unique Users</h3>
              <User className="w-5 h-5 sm:w-6 sm:h-6 opacity-80" />
            </div>
            <p className="text-2xl sm:text-3xl font-bold">
              {new Set(withdrawals.map(w => w.user._id)).size}
            </p>
          </div>
        </div>

        {/* Withdrawals List */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Pending Requests</h2>
          </div>

          {withdrawals.length === 0 ? (
            <div className="p-8 sm:p-12 text-center">
              <DollarSign className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-base sm:text-lg text-gray-500">No pending withdrawals</p>
              <p className="text-xs sm:text-sm text-gray-400 mt-2">
                Approved withdrawals will disappear from this list
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {withdrawals.map((withdrawal) => (
                <div
                  key={withdrawal._id}
                  className="p-4 sm:p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center text-white font-bold text-base sm:text-lg">
                          {withdrawal.user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm sm:text-base font-semibold text-gray-900 truncate">
                            {withdrawal.user.name}
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-600 truncate">
                            {withdrawal.user.email}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-2 text-xs sm:text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Smartphone className="w-3 h-3 sm:w-4 sm:h-4" />
                              {withdrawal.mpesaNumber}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                              {new Date(withdrawal.createdAt).toLocaleDateString('en-KE')}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 mt-1 truncate">
                            Ref: {withdrawal.mpesaReference}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Amount & Actions */}
                    <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6">
                      <div className="text-right">
                        <p className="text-xs sm:text-sm text-gray-500 mb-1">Amount</p>
                        <p className="text-xl sm:text-2xl font-bold text-slate-600">
                          {formatPrice(withdrawal.amount)}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(withdrawal._id)}
                          disabled={processing === withdrawal._id}
                          className="p-2 sm:p-3 bg-green-500 hover:bg-green-600 text-white rounded-lg sm:rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium"
                        >
                          {processing === withdrawal._id ? (
                            <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                          ) : (
                            <>
                              <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                              <span className="hidden sm:inline">Approve</span>
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => openRejectModal(withdrawal)}
                          disabled={processing === withdrawal._id}
                          className="p-2 sm:p-3 bg-red-500 hover:bg-red-600 text-white rounded-lg sm:rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium"
                        >
                          <X className="w-4 h-4 sm:w-5 sm:h-5" />
                          <span className="hidden sm:inline">Reject</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Reject Modal */}
        {showRejectModal && selectedWithdrawal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl sm:rounded-2xl max-w-md w-full p-4 sm:p-6 shadow-2xl">
              <h3 className="text-lg sm:text-xl font-bold mb-4 text-gray-900">
                Reject Withdrawal Request
              </h3>
              
              <div className="mb-4 p-3 sm:p-4 bg-red-50 rounded-lg border border-red-200">
                <p className="text-xs sm:text-sm text-red-800">
                  <strong>User:</strong> {selectedWithdrawal.user.name}
                </p>
                <p className="text-xs sm:text-sm text-red-800 mt-1">
                  <strong>Amount:</strong> {formatPrice(selectedWithdrawal.amount)}
                </p>
                <p className="text-xs text-red-600 mt-2">
                  The amount will be refunded to the user's wallet
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Reason for Rejection (Optional)
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Enter reason for rejection..."
                  rows={3}
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 text-sm sm:text-base"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setSelectedWithdrawal(null);
                    setRejectReason('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={processing === selectedWithdrawal._id}
                  className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base font-medium"
                >
                  {processing === selectedWithdrawal._id ? 'Processing...' : 'Reject & Refund'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <Analytics />
    </DashboardLayout>
  );
}
