'use client';

import { useState, useEffect } from 'react';
import { 
  FiDollarSign, 
  FiArrowDownCircle, 
  FiArrowUpCircle, 
  FiSmartphone,
  FiCheckCircle,
  FiAlertCircle,
  FiClock,
  FiRefreshCw,
} from 'react-icons/fi';
import axios from 'axios';

interface Transaction {
  _id: string;
  type: 'deposit' | 'withdrawal' | 'buyback_credit' | 'refund';
  amount: number;
  mpesaReference?: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  description?: string;
  createdAt: string;
  completedAt?: string;
}

interface WalletData {
  balance: number;
  mpesaNumber?: string;
  mpesaVerified: boolean;
  transactions: Transaction[];
}

export default function WalletSection() {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showBindMpesa, setShowBindMpesa] = useState(false);
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  
  const [mpesaNumber, setMpesaNumber] = useState('');
  const [depositAmount, setDepositAmount] = useState('');
  const [depositPhone, setDepositPhone] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [paymentPending, setPaymentPending] = useState(false);
  const [paymentData, setPaymentData] = useState<{
    transactionId: string;
    transactionReference: string;
  } | null>(null);

  useEffect(() => {
    fetchWallet();
  }, []);

  const fetchWallet = async () => {
    try {
      const response = await axios.get('/api/wallet');
      setWallet(response.data.wallet);
      if (response.data.wallet.mpesaNumber) {
        setDepositPhone(response.data.wallet.mpesaNumber);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const handleBindMpesa = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setMessage(null);

    try {
      await axios.post('/api/wallet', { mpesaNumber });
      setMessage({ type: 'success', text: 'M-Pesa number bound successfully!' });
      setShowBindMpesa(false);
      fetchWallet();
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'Failed to bind M-Pesa number' 
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setMessage(null);

    try {
      const response = await axios.post('/api/wallet/deposit', {
        amount: parseFloat(depositAmount),
        phoneNumber: depositPhone,
      });
      
      if (response.data.success) {
        setMessage({ 
          type: 'success', 
          text: '📱 STK push sent! Please check your phone and enter your M-Pesa PIN.' 
        });
        setShowDeposit(false);
        setDepositAmount('');
        
        // Store payment data for status checking
        setPaymentData({
          transactionId: response.data.transaction.transactionId,
          transactionReference: response.data.transaction.transactionReference,
        });
        setPaymentPending(true);
        
        // Start polling for payment status
        pollPaymentStatus(
          response.data.transaction.transactionId,
          response.data.transaction.transactionReference
        );
      }
    } catch (error: any) {
      setShowDeposit(false);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'Failed to initiate deposit' 
      });
    } finally {
      setProcessing(false);
    }
  };

  // Poll payment status
  const pollPaymentStatus = async (transactionId: string, transactionReference: string) => {
    const maxAttempts = 40; // Poll for up to 2 minutes (40 * 3 seconds)
    let attempts = 0;

    const checkStatus = async () => {
      try {
        const response = await axios.get(
          `/api/wallet/status?transactionId=${transactionId}&reference=${transactionReference}`
        );

        if (response.data.transaction.status === 'completed') {
          setPaymentPending(false);
          setPaymentData(null);
          setMessage({ 
            type: 'success', 
            text: `✅ Payment successful! Your wallet has been credited with KSh ${response.data.transaction.amount.toLocaleString()}.` 
          });
          fetchWallet();
          return true;
        } else if (response.data.transaction.status === 'failed') {
          setPaymentPending(false);
          setPaymentData(null);
          setMessage({ 
            type: 'error', 
            text: `❌ Payment failed: ${response.data.transaction.description}` 
          });
          fetchWallet();
          return true;
        } else if (attempts >= maxAttempts) {
          setPaymentPending(false);
          setPaymentData(null);
          setMessage({ 
            type: 'error', 
            text: 'Payment timeout. Please check your transaction history or contact support.' 
          });
          fetchWallet();
          return true;
        }

        attempts++;
        setTimeout(checkStatus, 3000); // Check every 3 seconds
      } catch (error) {
        if (attempts >= maxAttempts) {
          setPaymentPending(false);
          setPaymentData(null);
          fetchWallet();
        } else {
          attempts++;
          setTimeout(checkStatus, 3000);
        }
      }
    };

    checkStatus();
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setMessage(null);

    try {
      const response = await axios.post('/api/wallet/withdraw', {
        amount: parseFloat(withdrawAmount),
      });
      setMessage({ 
        type: 'success', 
        text: response.data.message || 'Withdrawal request submitted! You will be notified once approved.' 
      });
      setShowWithdraw(false);
      setWithdrawAmount('');
      
      // Show success animation/feedback
      setTimeout(() => {
        setMessage({
          type: 'success',
          text: '🎉 Request submitted successfully! Check your email for updates.'
        });
      }, 100);
      
      fetchWallet();
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'Failed to process withdrawal' 
      });
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <FiRefreshCw className="animate-spin text-4xl text-gray-800" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Wallet Info Explanation */}
      <div className="bg-white rounded-xl shadow p-4 mb-2">
        <h2 className="text-lg font-bold mb-2">What is the Wallet?</h2>
        <p className="text-sm text-gray-700">
          Your wallet lets you store, earn, and spend points for purchases, refunds, and buybacks. Points are pegged to local currency (e.g., 1 point = 1 Ksh) but can be used globally for shopping, rewards, and withdrawals. You can deposit, withdraw, or receive points for completed orders and promotions.
        </p>
      </div>
      {/* Payment Pending Indicator */}
      {paymentPending && (
        <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-lg animate-pulse">
          <div className="flex items-center gap-3">
            <FiClock className="text-2xl flex-shrink-0 animate-spin" />
            <div className="flex-1">
              <p className="font-semibold">Payment in Progress</p>
              <p className="text-sm">Waiting for M-Pesa confirmation... Please complete the payment on your phone.</p>
            </div>
          </div>
        </div>
      )}

      {/* Message Alert */}
      {message && (
        <div className={`p-3 sm:p-4 rounded-lg animate-fade-in ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          <div className="flex items-center gap-2">
            {message.type === 'success' ? <FiCheckCircle className="flex-shrink-0" /> : <FiAlertCircle className="flex-shrink-0" />}
            <p className="text-sm sm:text-base">{message.text}</p>
          </div>
        </div>
      )}

      {/* Wallet Balance Card */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white shadow-lg transform transition-all hover:scale-[1.02]">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h3 className="text-base sm:text-lg font-semibold">Wallet Balance</h3>
          <FiDollarSign className="text-2xl sm:text-3xl opacity-80" />
        </div>
        <p className="text-3xl sm:text-4xl font-bold mb-4 sm:mb-6">
          KSh {wallet?.balance.toLocaleString() || '0'}
        </p>
        
        <div className="flex gap-2 sm:gap-3">
          <button
            onClick={() => setShowDeposit(true)}
            className="flex-1 bg-white text-gray-900 py-2 sm:py-2.5 px-3 sm:px-4 rounded-lg font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 flex items-center justify-center gap-1.5 sm:gap-2 text-sm sm:text-base shadow-md"
          >
            <FiArrowDownCircle className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Deposit</span>
          </button>
          <button
            onClick={() => setShowWithdraw(true)}
            disabled={!wallet?.mpesaVerified}
            className="flex-1 bg-gray-700 text-white py-2 sm:py-2.5 px-3 sm:px-4 rounded-lg font-semibold hover:bg-gray-600 transition-all transform hover:scale-105 flex items-center justify-center gap-1.5 sm:gap-2 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-md"
          >
            <FiArrowUpCircle className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Withdraw</span>
          </button>
        </div>
        {!wallet?.mpesaVerified && (
          <p className="text-xs sm:text-sm text-gray-100 mt-2 sm:mt-3 text-center">
            ℹ️ Bind M-Pesa number to enable withdrawals
          </p>
        )}
      </div>

      {/* M-Pesa Binding */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FiSmartphone className="text-gray-900" />
          M-Pesa Number
        </h3>
        
        {wallet?.mpesaNumber ? (
          <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
            <div>
              <p className="font-medium">{wallet.mpesaNumber}</p>
              {wallet.mpesaVerified && (
                <p className="text-sm text-green-600 flex items-center gap-1 mt-1">
                  <FiCheckCircle /> Verified
                </p>
              )}
            </div>
            <button
              onClick={() => setShowBindMpesa(true)}
              className="text-gray-900 hover:text-gray-700 text-sm font-medium"
            >
              Change Number
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowBindMpesa(true)}
            className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-800 hover:text-gray-900 transition"
          >
            + Bind M-Pesa Number
          </button>
        )}
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
        
        {wallet?.transactions && wallet.transactions.length > 0 ? (
          <div className="space-y-3">
            {wallet.transactions.map((transaction) => (
              <div
                key={transaction._id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${
                    transaction.type === 'deposit' || transaction.type === 'buyback_credit' || transaction.type === 'refund'
                      ? 'bg-green-100 text-green-600'
                      : 'bg-red-100 text-red-600'
                  }`}>
                    {transaction.type === 'deposit' || transaction.type === 'buyback_credit' || transaction.type === 'refund' 
                      ? <FiArrowDownCircle /> 
                      : <FiArrowUpCircle />
                    }
                  </div>
                  <div>
                    <p className="font-medium capitalize">
                      {transaction.type.replace(/_/g, ' ')}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(transaction.createdAt).toLocaleString('en-KE')}
                    </p>
                    {transaction.mpesaReference && (
                      <p className="text-xs text-gray-400">
                        Ref: {transaction.mpesaReference}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="text-right">
                  <p className={`font-semibold ${
                    transaction.type === 'deposit' || transaction.type === 'buyback_credit' || transaction.type === 'refund'
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}>
                    {transaction.type === 'withdrawal' ? '-' : '+'} 
                    KSh {transaction.amount.toLocaleString()}
                  </p>
                  <p className={`text-xs mt-1 flex items-center gap-1 justify-end ${
                    transaction.status === 'completed' ? 'text-green-600' :
                    transaction.status === 'pending' ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {transaction.status === 'pending' && <FiClock />}
                    {transaction.status === 'completed' && <FiCheckCircle />}
                    {transaction.status === 'failed' && <FiAlertCircle />}
                    {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-8">No transactions yet</p>
        )}
      </div>

      {/* Bind M-Pesa Modal */}
      {showBindMpesa && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Bind M-Pesa Number</h3>
            <form onSubmit={handleBindMpesa} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  M-Pesa Phone Number
                </label>
                <input
                  type="text"
                  value={mpesaNumber}
                  onChange={(e) => setMpesaNumber(e.target.value)}
                  placeholder="254XXXXXXXXX"
                  pattern="254\d{9}"
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Format: 254XXXXXXXXX (e.g., 254712345678)
                </p>
              </div>
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowBindMpesa(false)}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processing}
                  className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50"
                >
                  {processing ? 'Processing...' : 'Bind Number'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Deposit Modal */}
      {showDeposit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-xl sm:rounded-2xl max-w-md w-full p-4 sm:p-6 shadow-2xl transform transition-all animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg sm:text-xl font-bold">Deposit to Wallet</h3>
              <button
                onClick={() => setShowDeposit(false)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleDeposit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Amount (KSh)
                </label>
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="Enter amount"
                  min="50"
                  step="1"
                  required
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-base sm:text-lg transition-all"
                />
                <p className="text-xs sm:text-sm text-gray-500 mt-2">Minimum deposit: KSh 50 | Maximum: KSh 150,000</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  M-Pesa Number
                </label>
                <input
                  type="text"
                  value={depositPhone}
                  onChange={(e) => setDepositPhone(e.target.value)}
                  placeholder="07XXXXXXXX or 2547XXXXXXXX"
                  required
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-base sm:text-lg transition-all"
                />
                <p className="text-xs sm:text-sm text-gray-500 mt-2">
                  Safaricom number only. You'll receive an STK push to complete payment.
                </p>
              </div>
              
              <div className="p-3 sm:p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                <p className="text-xs sm:text-sm text-green-900 font-medium mb-1">
                  📱 How it works:
                </p>
                <ol className="text-xs text-green-700 space-y-1 ml-4 list-decimal">
                  <li>Enter amount and phone number</li>
                  <li>Check your phone for M-Pesa prompt</li>
                  <li>Enter your M-Pesa PIN</li>
                  <li>Funds credited instantly! 🎉</li>
                </ol>
              </div>
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowDeposit(false)}
                  className="flex-1 px-4 py-2.5 sm:py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-all text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processing}
                  className="flex-1 px-4 py-2.5 sm:py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-all transform hover:scale-105 disabled:hover:scale-100 shadow-lg text-sm sm:text-base"
                >
                  {processing ? (
                    <span className="flex items-center justify-center gap-2">
                      <FiRefreshCw className="animate-spin" />
                      Processing...
                    </span>
                  ) : (
                    '💰 Deposit Now'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Withdraw Modal */}
      {showWithdraw && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-xl sm:rounded-2xl max-w-md w-full p-4 sm:p-6 shadow-2xl transform transition-all animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg sm:text-xl font-bold">Withdraw to M-Pesa</h3>
              <button
                onClick={() => setShowWithdraw(false)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleWithdraw} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Amount (KSh)
                </label>
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="Enter amount"
                  min="100"
                  max={wallet?.balance || 0}
                  step="1"
                  required
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-base sm:text-lg transition-all"
                />
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs sm:text-sm text-gray-500">
                    Minimum: KSh 100
                  </p>
                  <p className="text-xs sm:text-sm font-medium text-orange-600">
                    Available: KSh {wallet?.balance.toLocaleString()}
                  </p>
                </div>
              </div>
              
              <div className="p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                <p className="text-xs sm:text-sm text-blue-900 font-medium mb-1">
                  📱 Withdraw to: {wallet?.mpesaNumber}
                </p>
                <p className="text-xs text-blue-700">
                  ⏱️ Processing: 1-24 hours (Admin approval required)
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  ✉️ You'll receive email confirmation once approved
                </p>
              </div>
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowWithdraw(false)}
                  className="flex-1 px-4 py-2.5 sm:py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-all text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processing}
                  className="flex-1 px-4 py-2.5 sm:py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-all transform hover:scale-105 disabled:hover:scale-100 shadow-lg text-sm sm:text-base"
                >
                  {processing ? (
                    <span className="flex items-center justify-center gap-2">
                      <FiRefreshCw className="animate-spin" />
                      Processing...
                    </span>
                  ) : (
                    '💸 Request Withdrawal'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
