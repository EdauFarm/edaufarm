'use client';

import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { formatPrice, formatDate } from '@/lib/utils';
import { useCurrency, currencies } from '@/contexts/CurrencyContext';
import LoadingSpinner from '@/components/LoadingSpinner';
import WalletSection from '@/components/WalletSection';
import { isAdmin } from '@/lib/roleCheck';
import axios from 'axios';
import { FiShield, FiShoppingBag, FiPackage, FiDollarSign, FiRotateCcw, FiSettings, FiUser, FiMail, FiLogOut, FiBell, FiLock, FiGlobe, FiMenu, FiX } from 'react-icons/fi';
import Image from 'next/image';

export default function DashboardContent() {
    const { currency, setCurrency } = useCurrency();
    const { data: session, status } = useSession();

    // Load currency from DB or localStorage on mount
    useEffect(() => {
      if (session?.user) {
        // Fetch user currency from backend
        axios.get('/api/user/profile').then(res => {
          if (res.data?.user?.currency) {
            setCurrency(currencies.find(c => c.code === res.data.user.currency) || currencies[0]);
          }
        });
      } else {
        // For guests, load from localStorage
        const stored = typeof window !== 'undefined' ? localStorage.getItem('preferred_currency') : null;
        if (stored) {
          setCurrency(currencies.find(c => c.code === stored) || currencies[0]);
        }
      }
      // eslint-disable-next-line
    }, [session]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState('orders');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [orders, setOrders] = useState<any[]>([]);
  const [buybacks, setBuybacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) setActiveTab(tab);
  }, [searchParams]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/dashboard');
    } else if (status === 'authenticated') {
      fetchOrders();
      if (activeTab === 'buybacks') {
        fetchBuybacks();
      }
    }
  }, [status, activeTab]);

  const fetchOrders = async () => {
    try {
      const res = await axios.get('/api/orders');
      setOrders(res.data.orders);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const fetchBuybacks = async () => {
    try {
      const res = await axios.get('/api/buyback');
      setBuybacks(res.data.buybacks);
    } catch (error) {
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      completed: 'bg-green-100 text-green-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (status === 'loading' || loading) {
    return <LoadingSpinner fullScreen branded />;
  }

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setIsSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50">
    
      <div className="flex">
        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={`fixed lg:sticky top-0 left-0 h-screen bg-white border-r border-gray-200 shadow-xl transition-transform duration-300 z-50 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } w-64 sm:w-72 flex flex-col`}>
          {/* Sidebar Header */}
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Dashboard
              </h2>
              <p className="text-xs text-gray-500 mt-1">{session?.user?.email}</p>
            </div>
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {/* User Profile Section */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center text-white font-bold text-lg">
                {session?.user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">{session?.user?.name}</p>
                <p className="text-xs text-gray-500 capitalize">{session?.user?.role}</p>
              </div>
            </div>
            {isAdmin(session?.user?.role) && (
              <Link
                href="/admin"
                className="flex items-center gap-2 bg-gradient-to-r from-gray-800 to-gray-900 text-white px-4 py-2.5 rounded-lg hover:shadow-lg transition-all text-sm font-medium"
              >
                <FiShield className="w-4 h-4" />
                Admin Panel
              </Link>
            )}
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 overflow-y-auto py-4 pb-20">
            <div className="px-3 space-y-1">
              <button
                onClick={() => handleTabChange('orders')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
                  activeTab === 'orders'
                    ? 'bg-gradient-to-r from-gray-800 to-gray-900 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <FiPackage className="w-5 h-5" />
                <span>My Orders</span>
                {orders.length > 0 && (
                  <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${
                    activeTab === 'orders' ? 'bg-white/20' : 'bg-gray-200 text-gray-700'
                  }`}>
                    {orders.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => handleTabChange('wallet')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
                  activeTab === 'wallet'
                    ? 'bg-gradient-to-r from-gray-800 to-gray-900 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <FiDollarSign className="w-5 h-5" />
                <span>Wallet</span>
              </button>

              <button
                onClick={() => handleTabChange('buybacks')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
                  activeTab === 'buybacks'
                    ? 'bg-gradient-to-r from-gray-800 to-gray-900 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <FiRotateCcw className="w-5 h-5" />
                <span>Buybacks</span>
                {buybacks.length > 0 && (
                  <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${
                    activeTab === 'buybacks' ? 'bg-white/20' : 'bg-gray-200 text-gray-700'
                  }`}>
                    {buybacks.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => handleTabChange('settings')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
                  activeTab === 'settings'
                    ? 'bg-gradient-to-r from-gray-800 to-gray-900 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <FiSettings className="w-5 h-5" />
                <span>Settings</span>
              </button>
            </div>
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t border-gray-200 mb-16 lg:mb-0">
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all font-medium"
            >
              <FiLogOut className="w-5 h-5" />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 lg:ml-0">
          {/* Mobile Header */}
          <div className="lg:hidden sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FiMenu className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              My Dashboard
            </h1>
            <div className="w-10" />
          </div>

          <div className="p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8">{/* Desktop Header */}
          <div className="hidden lg:block mb-8 bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">My Dashboard</h1>
            <p className="text-gray-700 text-lg">Welcome back, <span className="font-semibold">{session?.user?.name}</span>! 👋</p>
          </div>

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div>
          {/* Order Status Filter Tabs */}
          <div className="mb-6 bg-white rounded-2xl shadow-lg p-4 border border-gray-200">
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <button
                onClick={() => setOrderStatusFilter('all')}
                className={`px-2 sm:px-3 py-2.5 rounded-xl font-semibold whitespace-nowrap transition-all text-xs sm:text-sm text-center ${
                  orderStatusFilter === 'all'
                    ? 'bg-gradient-to-r from-gray-800 to-gray-900 text-white shadow-lg scale-[1.02]'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All ({orders.length})
              </button>
              <button
                onClick={() => setOrderStatusFilter('pending')}
                className={`px-2 sm:px-3 py-2.5 rounded-xl font-semibold whitespace-nowrap transition-all text-xs sm:text-sm text-center ${
                  orderStatusFilter === 'pending'
                    ? 'bg-yellow-500 text-white shadow-lg scale-[1.02]'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                To Pay ({orders.filter(o => o.paymentStatus === 'pending').length})
              </button>
              <button
                onClick={() => setOrderStatusFilter('processing')}
                className={`px-2 sm:px-3 py-2.5 rounded-xl font-semibold whitespace-nowrap transition-all text-xs sm:text-sm text-center ${
                  orderStatusFilter === 'processing'
                    ? 'bg-blue-500 text-white shadow-lg scale-[1.02]'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                To Ship ({orders.filter(o => o.status === 'processing').length})
              </button>
              <button
                onClick={() => setOrderStatusFilter('shipped')}
                className={`px-2 sm:px-3 py-2.5 rounded-xl font-semibold whitespace-nowrap transition-all text-xs sm:text-sm text-center ${
                  orderStatusFilter === 'shipped'
                    ? 'bg-purple-500 text-white shadow-lg scale-[1.02]'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Transit ({orders.filter(o => o.status === 'shipped').length})
              </button>
              <button
                onClick={() => setOrderStatusFilter('delivered')}
                className={`px-2 sm:px-3 py-2.5 rounded-xl font-semibold whitespace-nowrap transition-all text-xs sm:text-sm text-center ${
                  orderStatusFilter === 'delivered'
                    ? 'bg-green-500 text-white shadow-lg scale-[1.02]'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Delivered ({orders.filter(o => o.status === 'delivered').length})
              </button>
              <button
                onClick={() => setOrderStatusFilter('cancelled')}
                className={`px-2 sm:px-3 py-2.5 rounded-xl font-semibold whitespace-nowrap transition-all text-xs sm:text-sm text-center ${
                  orderStatusFilter === 'cancelled'
                    ? 'bg-red-500 text-white shadow-lg scale-[1.02]'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Cancelled ({orders.filter(o => o.status === 'cancelled').length})
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-6">
          {orderStatusFilter === 'all' ? 'All Orders' :
           orderStatusFilter === 'pending' ? 'To Be Paid' :
           orderStatusFilter === 'processing' ? 'To Be Shipped' :
           orderStatusFilter === 'shipped' ? 'On Transit' :
           orderStatusFilter === 'delivered' ? 'Delivered' : 'Orders'}
        </h2>

        {(() => {
          const filteredOrders = orderStatusFilter === 'all' 
            ? orders 
            : orderStatusFilter === 'pending'
            ? orders.filter(o => o.paymentStatus === 'pending')
            : orders.filter(o => o.status === orderStatusFilter);

          return filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <FiPackage className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-gray-600 mb-4 text-lg font-semibold">
                {orderStatusFilter === 'all' 
                  ? "You haven't placed any orders yet"
                  : `No ${orderStatusFilter === 'pending' ? 'unpaid' : orderStatusFilter} orders`}
              </p>
              {orderStatusFilter === 'all' && (
                <Link
                  href="/products"
                  className="inline-block bg-gradient-to-r from-gray-800 to-gray-900 text-white px-8 py-3 rounded-xl hover:shadow-lg hover:scale-105 transition-all font-semibold"
                >
                  Start Shopping
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <Link
                  key={order._id}
                  href={`/orders/${order._id}`}
                  className="block border border-gray-200 rounded-2xl p-4 sm:p-5 hover:border-gray-400 hover:shadow-xl transition-all bg-gradient-to-br from-white to-gray-50 hover:from-gray-50 hover:to-white"
                >
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 gap-2">
                    <div className="flex-1">
                      <p className="font-semibold text-base sm:text-lg">Order #{order.orderNumber}</p>
                      <p className="text-sm text-gray-600">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <div className="flex flex-col gap-1 items-start sm:items-end">
                      <span
                        className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                      {order.paymentStatus === 'pending' && (
                        <span className="px-2 sm:px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                          Payment Pending
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <div>
                      <p className="text-sm text-gray-600">
                        {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="font-bold text-lg sm:text-xl bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                        {formatPrice(order.total)}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          );
        })()}
      </div>
        </div>
      )}

      {/* Wallet Tab */}
      {activeTab === 'wallet' && (
        <WalletSection />
      )}

      {/* Buybacks Tab */}
      {activeTab === 'buybacks' && (
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-6">Buyback Requests</h2>
          
          {buybacks.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <FiRotateCcw className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-gray-600 mb-2 text-lg font-semibold">No buyback requests yet</p>
              <p className="text-sm text-gray-500">
                You can request buybacks for delivered orders from the order details page
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {buybacks.map((buyback) => (
                <div
                  key={buyback._id}
                  className="border border-gray-200 rounded-2xl p-4 sm:p-5 bg-gradient-to-br from-white to-gray-50 hover:shadow-xl transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 gap-2">
                    <div className="flex-1">
                      <p className="font-semibold text-base sm:text-lg">
                        Buyback Request #{buyback._id.slice(-6).toUpperCase()}
                      </p>
                      <p className="text-sm text-gray-600">
                        {formatDate(buyback.createdAt)}
                      </p>
                    </div>
                    <span
                      className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold self-start sm:self-end ${getStatusColor(
                        buyback.status
                      )}`}
                    >
                      {buyback.status.replace('_', ' ').charAt(0).toUpperCase() + 
                       buyback.status.replace('_', ' ').slice(1)}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Requested Amount:</p>
                      <p className="font-semibold">{formatPrice(buyback.requestedAmount)}</p>
                    </div>
                    {buyback.approvedAmount && (
                      <div>
                        <p className="text-gray-600">Approved Amount:</p>
                        <p className="font-semibold text-green-600">
                          {formatPrice(buyback.approvedAmount)}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-gray-600">Condition:</p>
                      <p className="font-semibold capitalize">{buyback.condition}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Reason:</p>
                      <p className="text-gray-800">{buyback.reason}</p>
                    </div>
                  </div>

                  {buyback.adminResponse?.comments && (
                    <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-sm font-semibold text-green-900">Admin Response:</p>
                      <p className="text-sm text-green-800">{buyback.adminResponse.comments}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          {/* Account Information */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-6 flex items-center gap-3">
              <FiUser className="text-gray-900" />
              Account Information
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                  {session?.user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-lg text-gray-900">{session?.user?.name}</p>
                  <p className="text-sm text-gray-500">Member since {new Date(Date.now()).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex items-center gap-3 mb-2">
                    <FiMail className="text-gray-900" />
                    <p className="text-sm font-semibold text-gray-600">Email Address</p>
                  </div>
                  <p className="text-gray-900 font-medium break-all">{session?.user?.email}</p>
                </div>

                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex items-center gap-3 mb-2">
                    <FiShield className="text-gray-900" />
                    <p className="text-sm font-semibold text-gray-600">Account Role</p>
                  </div>
                  <p className="text-gray-900 font-medium capitalize">{session?.user?.role}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-6 flex items-center gap-3">
              <FiSettings className="text-gray-900" />
              Preferences
            </h2>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-gray-400 transition-colors">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <FiBell className="text-gray-900 w-5 h-5 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900">Email Notifications</p>
                    <p className="text-sm text-gray-500">Receive order updates via email</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer ml-3">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-800"></div>
                </label>
              </div>

              {/* Currency Selection */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-gray-400 transition-colors">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <FiDollarSign className="text-gray-900 w-5 h-5 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900">Preferred Currency</p>
                    <p className="text-sm text-gray-500">Choose your display and checkout currency</p>
                  </div>
                </div>
                <select
                  className="ml-3 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent bg-white text-gray-900"
                  value={currency.code}
                  onChange={async e => {
                    const selected = currencies.find(c => c.code === e.target.value);
                    if (selected) {
                      setCurrency(selected);
                      if (session?.user) {
                        // Save to backend
                        await axios.put('/api/user/profile', { currency: selected.code });
                      } else {
                        // Save to localStorage
                        localStorage.setItem('preferred_currency', selected.code);
                      }
                    }
                  }}
                >
                  {currencies.map(c => (
                    <option key={c.code} value={c.code}>{c.symbol} - {c.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-gray-400 transition-colors">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <FiGlobe className="text-gray-900 w-5 h-5 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900">Marketing Updates</p>
                    <p className="text-sm text-gray-500">Get deals and promotions</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer ml-3">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-800"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Security & Actions */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-6 flex items-center gap-3">
              <FiLock className="text-gray-900" />
              Security & Actions
            </h2>

            <div className="space-y-3">
              <Link
                href="/account/password"
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-gray-400 hover:bg-gray-100 transition-all group"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <FiLock className="text-gray-600 group-hover:text-gray-900 w-5 h-5 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900">Change Password</p>
                    <p className="text-sm text-gray-500">Update your account password</p>
                  </div>
                </div>
                <svg className="w-5 h-5 text-gray-400 group-hover:text-primary-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>

              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="w-full flex items-center justify-between p-4 bg-red-50 rounded-xl border border-red-200 hover:border-red-300 hover:bg-red-100 transition-all group"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <FiLogOut className="text-red-600 w-5 h-5 flex-shrink-0" />
                  <div className="text-left min-w-0">
                    <p className="font-semibold text-red-900">Sign Out</p>
                    <p className="text-sm text-red-600">Log out of your account</p>
                  </div>
                </div>
                <svg className="w-5 h-5 text-red-400 group-hover:text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
          </div>
        </main>
      </div>
    </div>
  );
}
