'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { FiTrash2, FiMinus, FiPlus, FiShoppingCart } from 'react-icons/fi';
import { useCartStore } from '@/store/cartStore';
import { useCurrency } from '@/contexts/CurrencyContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useLanguage } from '@/contexts/LanguageContext';

export default function CartPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { items, removeItem, updateQuantity, clearCart, total } = useCartStore();
  const [isClearing, setIsClearing] = useState(false);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [walletLoading, setWalletLoading] = useState(false);
  const [processingWalletCheckout, setProcessingWalletCheckout] = useState(false);
  const { t } = useLanguage();
  const { currency } = useCurrency();
  const formatCurrency = (amount: number) =>
    require('@/lib/currencyFormat').convertAndFormatPrice(amount, 'KES', currency.code);

  // Fetch wallet balance
  useEffect(() => {
    if (session?.user) {
      fetchWalletBalance();
    }
  }, [session]);

  const fetchWalletBalance = async () => {
    setWalletLoading(true);
    try {
      const response = await axios.get('/api/wallet');
      if (response.data.success) {
        setWalletBalance(response.data.wallet.balance);
      }
    } catch (error) {
      // Silent fail
    } finally {
      setWalletLoading(false);
    }
  };

  const handleWalletCheckout = async () => {
    if (!session?.user) {
      toast.error('Please sign in to complete purchase');
      router.push('/auth/signin?callbackUrl=/cart');
      return;
    }

    if (walletBalance < orderTotal) {
      toast.error('Insufficient wallet balance');
      return;
    }

    setProcessingWalletCheckout(true);

    try {
      // Create order with wallet payment
      const orderData = {
        items: items.map((item) => ({
          productId: item.productId,
          title: item.title,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
          variant: item.variant,
        })),
        shippingAddress: {
          fullName: session.user.name || '',
          phone: '',
          address: 'Quick Checkout - Will update later',
          city: '',
          county: '',
        },
        paymentMethod: 'wallet',
        walletAmount: orderTotal,
      };

      const response = await axios.post('/api/orders', orderData);

      if (response.data.success) {
        toast.success('🎉 Order placed successfully using wallet balance!');
        clearCart();
        router.push(`/orders/${response.data.order._id}`);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to complete purchase';
      toast.error(`❌ ${errorMessage}`);
    } finally {
      setProcessingWalletCheckout(false);
    }
  };

  const handleCheckout = () => {
    router.push('/checkout');
  };

  const handleWhatsAppOrder = () => {
    // Build WhatsApp message with cart details
    const productDetails = items.map((item, index) => 
      `${index + 1}. ${item.title}${item.variant ? ` (${item.variant})` : ''}\n   Qty: ${item.quantity} x ${formatCurrency(item.price)} = ${formatCurrency(item.price * item.quantity)}`
    ).join('\n\n');

    const orderSummary = `
💰 *Order Summary:*
Subtotal: ${formatCurrency(subtotal)}
Shipping: ${shipping === 0 ? 'FREE' : formatCurrency(shipping)}
*Total: ${formatCurrency(orderTotal)}*`;

    const message = `🛒 *New Order Request*

*Products:*
${productDetails}

${orderSummary}

I would like to place this order. Please confirm availability and delivery details. Thank you!`;

    const whatsappNumber = '254791792027';
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    
    window.open(whatsappUrl, '_blank');
  };

  const handleClearCart = () => {
    if (confirm(t('cart.clearConfirm'))) {
      setIsClearing(true);
      clearCart();
      setTimeout(() => setIsClearing(false), 500);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
        <div className="text-center bg-white rounded-2xl shadow-xl p-8 md:p-12 max-w-md border border-gray-200">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <FiShoppingCart className="w-12 h-12 text-gray-400" />
          </div>
          <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">{t('cart.empty')}</h1>
          <p className="text-gray-600 mb-8">
            {t('cart.emptyDesc')}
          </p>
          <Link
            href="/products"
            className="inline-block bg-gradient-to-r from-gray-800 to-gray-900 text-white px-8 py-3.5 rounded-xl hover:shadow-lg hover:scale-105 transition-all font-semibold"
          >
            {t('cart.startShopping')}
          </Link>
        </div>
      </div>
    );
  }

  const subtotal = total();
  const shipping = subtotal > 100 ? 0 : 10;
  const orderTotal = subtotal + shipping;
  const canPayWithWallet = session?.user && walletBalance >= orderTotal && orderTotal > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8 bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">{t('cart.title')}</h1>
          <button
            onClick={handleClearCart}
            disabled={isClearing}
            className="text-red-600 hover:text-red-700 font-semibold hover:bg-red-50 px-4 py-2 rounded-xl transition-all"
          >
            {t('cart.clearCart')}
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-3 sm:space-y-4">
          {items.map((item) => (
            <div
              key={`${item.productId}-${item.variant}`}
              className="bg-white border border-gray-200 rounded-2xl p-3 sm:p-4 hover:shadow-lg transition-all hover:border-gray-400"
            >
              <div className="flex gap-3 sm:gap-4">
                {/* Image */}
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 80px, 96px"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <Link
                      href={`/products/${item.productId}`}
                      className="font-semibold text-sm sm:text-base text-gray-900 hover:text-gray-700 line-clamp-2"
                    >
                      {item.title}
                    </Link>
                    {item.variant && (
                      <p className="text-xs sm:text-sm text-gray-500 mt-1">Variant: {item.variant}</p>
                    )}
                  </div>
                  <p className="text-gray-900 font-semibold text-sm sm:text-base mt-2">
                    {formatCurrency(item.price)}
                  </p>
                </div>
              </div>

              {/* Quantity and Total - Separate Row on Mobile */}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                {/* Quantity */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() =>
                      updateQuantity(item.productId, item.quantity - 1, item.variant)
                    }
                    className="p-1.5 sm:p-2 border border-gray-300 rounded-lg hover:bg-gray-100 hover:border-gray-400 active:scale-95 transition-all"
                  >
                    <FiMinus size={14} className="sm:w-4 sm:h-4 text-gray-600" />
                  </button>
                  <span className="w-10 sm:w-12 text-center font-semibold text-sm sm:text-base">{item.quantity}</span>
                  <button
                    onClick={() =>
                      updateQuantity(item.productId, item.quantity + 1, item.variant)
                    }
                    className="p-1.5 sm:p-2 border border-gray-300 rounded-lg hover:bg-gray-100 hover:border-gray-400 active:scale-95 transition-all"
                  >
                    <FiPlus size={14} className="sm:w-4 sm:h-4 text-gray-600" />
                  </button>
                </div>

                {/* Total and Remove */}
                <div className="flex items-center gap-3 sm:gap-4">
                  <p className="font-bold text-base sm:text-lg text-gray-900">
                    {formatCurrency(item.price * item.quantity)}
                  </p>
                  <button
                    onClick={() => removeItem(item.productId, item.variant)}
                    className="text-red-600 hover:text-red-700 p-1.5 hover:bg-red-50 rounded active:scale-95"
                    aria-label="Remove item"
                  >
                    <FiTrash2 size={16} className="sm:w-5 sm:h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 sticky top-24 shadow-lg">
            <h2 className="text-lg sm:text-xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">{t('cart.orderSummary')}</h2>

            <div className="space-y-2 sm:space-y-3 mb-6">
              <div className="flex justify-between text-sm sm:text-base">
                <span className="text-gray-600">{t('cart.subtotal')}</span>
                <span className="font-semibold">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm sm:text-base">
                <span className="text-gray-600">{t('cart.shipping')}</span>
                <span className="font-semibold">
                  {shipping === 0 ? t('cart.freeShipping') : formatCurrency(shipping)}
                </span>
              </div>
              {subtotal < 100 && subtotal > 0 && (
                <p className="text-xs sm:text-sm text-green-600 bg-green-50 p-2 rounded">
                  Add {formatCurrency(100 - subtotal)} more for free shipping!
                </p>
              )}

              <div className="border-t pt-3 flex justify-between text-base sm:text-lg">
                <span className="font-bold">{t('cart.total')}</span>
                <span className="font-bold text-gray-900">
                  {formatCurrency(orderTotal)}
                </span>
              </div>
            </div>

            {/* Wallet Balance Display */}
            {session?.user && walletBalance > 0 && (
              <div className="mb-4 p-3 sm:p-4 bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs sm:text-sm font-medium text-purple-700">Wallet Balance</span>
                  <span className="text-base sm:text-lg font-bold text-purple-600">{formatCurrency(walletBalance)}</span>
                </div>
                {canPayWithWallet && (
                  <div className="flex items-center gap-1 text-xs sm:text-sm text-green-700 bg-green-50 px-2 py-1 rounded mt-2">
                    <span>✓</span>
                    <span className="font-medium">Sufficient balance for full payment</span>
                  </div>
                )}
              </div>
            )}

            {/* Complete Purchase with Wallet - Shows only when wallet can cover full amount */}
            {canPayWithWallet && (
              <button
                onClick={handleWalletCheckout}
                disabled={processingWalletCheckout}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-2.5 sm:py-3 rounded-xl font-semibold hover:shadow-lg hover:scale-[1.02] transition-all text-sm sm:text-base active:scale-95 mb-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processingWalletCheckout ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  '💳 Complete Purchase with Wallet'
                )}
              </button>
            )}

            <button
              onClick={handleCheckout}
              className="w-full bg-gradient-to-r from-gray-800 to-gray-900 text-white py-2.5 sm:py-3 rounded-xl font-semibold hover:shadow-lg hover:scale-[1.02] transition-all text-sm sm:text-base active:scale-95 mb-3"
            >
              {canPayWithWallet ? 'Checkout (Other Payment Methods)' : t('cart.checkout')}
            </button>

            {/* WhatsApp Order Button - Available for all users */}
            <button
              onClick={handleWhatsAppOrder}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-2.5 sm:py-3 rounded-xl font-semibold hover:shadow-lg hover:scale-[1.02] transition-all text-sm sm:text-base active:scale-95 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Order via WhatsApp
            </button>

            <Link
              href="/products"
              className="block text-center text-gray-700 hover:text-gray-900 mt-4 text-sm sm:text-base font-semibold"
            >
              {t('cart.continueShopping')}
            </Link>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
