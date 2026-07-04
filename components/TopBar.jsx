'use client';

import { useState } from 'react';
import DynamicSearch from './DynamicSearch';
import { useCurrency, currencies } from '@/contexts/CurrencyContext';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { FiShoppingCart, FiUser, FiSearch } from 'react-icons/fi';
import { useCartStore } from '@/store/cartStore';

export default function TopBar() {
  const { data: session } = useSession();
  const { items } = useCartStore();
  const pathname = usePathname();
  const cartItemsCount = items.reduce((acc, item) => acc + item.quantity, 0);
  // Currency
  const { currency, setCurrency } = useCurrency();
  const [showCurrency, setShowCurrency] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState(currency.code);
  // Hide TopBar on admin pages
  const isAdminPage = pathname?.startsWith('/admin');
  if (isAdminPage) {
    return null;
  }

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="text-lg font-normal text-gray-900 hover:text-gray-700 transition-colors">
            Edau Farm
          </Link>
          {/* Dynamic Search (center, hidden on mobile) */}
          <div className="flex-1 mx-6 hidden md:block">
            <DynamicSearch />
          </div>
          {/* Currency Switcher (desktop and mobile) */}
          <div className="flex items-center gap-2">
            <button
              className="flex items-center space-x-2 px-2 py-2 rounded-md hover:bg-gray-50 transition-colors text-gray-700"
              onClick={() => setShowCurrency(true)}
              aria-label="Change currency"
            >
              <span className="text-sm font-medium uppercase">{currency.symbol} ({currency.code})</span>
            </button>
            {showCurrency && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-xs relative">
                  <button
                    className="absolute top-2 right-2 text-gray-400 hover:text-gray-700"
                    onClick={() => setShowCurrency(false)}
                    aria-label="Close"
                  >×</button>
                  <div className="mb-2 font-semibold text-gray-700">Switch Currency</div>
                  <select
                    className="w-full mb-2 px-2 py-1 border rounded"
                    value={selectedCurrency}
                    onChange={e => setSelectedCurrency(e.target.value)}
                  >
                    {currencies.map(c => (
                      <option key={c.code} value={c.code}>{c.symbol} - {c.name}</option>
                    ))}
                  </select>
                  <button
                    className="w-full bg-primary-600 text-white py-2 rounded font-semibold hover:bg-primary-700 transition"
                    onClick={() => {
                      const selected = currencies.find(c => c.code === selectedCurrency);
                      if (selected) setCurrency(selected);
                      setShowCurrency(false);
                    }}
                  >OK</button>
                </div>
              </div>
            )}
             <Link href="/products" className="p-2 hover:bg-gray-50 rounded-md">
              <FiSearch className="w-5 h-5 text-gray-700" />
            </Link>
            <Link href="/cart" className="relative p-2 hover:bg-gray-50 rounded-md">
              <FiShoppingCart className="w-5 h-5 text-gray-700" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-black text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium">
                  {cartItemsCount > 9 ? '9+' : cartItemsCount}
                </span>
              )}
            </Link>
            <Link href={session ? "/dashboard" : "/auth/signin"} className="p-2 hover:bg-gray-50 rounded-md">
              <FiUser className="w-5 h-5 text-gray-700" />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
