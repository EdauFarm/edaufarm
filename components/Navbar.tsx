'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { FiShoppingCart, FiUser, FiSearch, FiMenu, FiX, FiGlobe } from 'react-icons/fi';
import { useCartStore } from '@/store/cartStore';
import { useLanguage } from '@/contexts/LanguageContext';
import DynamicSearch from './DynamicSearch';
import { useState } from 'react';
import { useCurrency, currencies } from '@/contexts/CurrencyContext';

export default function Navbar() {
    const { currency, setCurrency } = useCurrency();
    const [switching, setSwitching] = useState(false);
    const [selectedCurrency, setSelectedCurrency] = useState(currency.code);
    const [showConfirm, setShowConfirm] = useState(false);
    const { data: session, status } = useSession();
    const itemCount = useCartStore((state) => state.itemCount());
    const { language, setLanguage, t } = useLanguage();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [showLangMenu, setShowLangMenu] = useState(false);

  return (
    <>
      {/* ...existing code... */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 backdrop-blur-md bg-white/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent group-hover:from-primary-700 group-hover:to-primary-800 transition-all duration-300">EDAU FARM</div>
          </Link>

          {/* Dynamic Search - single input for all devices, desktop width reduced */}
          <div className="flex-1 flex justify-center mx-2">
            <div className="w-full md:w-1/3">
              <DynamicSearch />
            </div>
          </div>

          {/* Desktop Menu - Rearranged: Home, Products, Categories, Cart, Currency, Account */}
          <div className="hidden md:flex items-center space-x-6">
            {/* Home */}
            <Link href="/" className="text-gray-700 hover:text-primary-600 transition-colors duration-300 font-medium flex items-center space-x-1">
              <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-home"><path d="M3 9.5L12 4l9 5.5V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9.5z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              <span>Home</span>
            </Link>
            {/* Products */}
            <Link href="/products" className="text-gray-700 hover:text-primary-600 transition-colors duration-300 font-medium relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-primary-600 after:transition-all after:duration-300 hover:after:w-full pb-1">
              Products
            </Link>
            {/* Categories */}
            <Link href="/categories" className="text-gray-700 hover:text-primary-600 transition-colors duration-300 font-medium relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-primary-600 after:transition-all after:duration-300 hover:after:w-full pb-1">
              Categories
            </Link>
            {/* Cart */}
            <Link href="/cart" className="relative text-gray-700 hover:text-primary-600 transition-all duration-300 p-2 rounded-lg hover:bg-gray-50 group">
              <FiShoppingCart size={24} className="group-hover:scale-110 transition-transform duration-300" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-lg animate-pulse">
                  {itemCount}
                </span>
              )}
            </Link>
            {/* Currency Switcher - spaced far from Cart and Account */}
            <div className="relative mx-8">
              <button
                className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors duration-300 text-gray-700 hover:text-primary-600"
                tabIndex={-1}
                onClick={() => setShowConfirm(true)}
              >
                <span className="text-sm font-medium uppercase">{currency.symbol} ({currency.code})</span>
              </button>
              {showConfirm && (
                <div className="absolute left-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 px-3 py-2 text-gray-900 focus:outline-none">
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
                    disabled={switching || status === 'loading'}
                    onClick={async () => {
                      setSwitching(true);
                      if (status === 'authenticated') {
                        await fetch('/api/user/settings', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ currency: selectedCurrency }),
                        });
                      }
                      const selected = currencies.find(c => c.code === selectedCurrency);
                      if (selected) setCurrency(selected);
                      setSwitching(false);
                      setShowConfirm(false);
                    }}
                  >
                    {switching || status === 'loading' ? 'Switching...' : 'OK'}
                  </button>
                  <button
                    className="w-full mt-2 bg-gray-200 text-gray-700 py-1 rounded hover:bg-gray-300 transition"
                    onClick={() => setShowConfirm(false)}
                  >Cancel</button>
                </div>
              )}
            </div>
            {/* User Menu / Account */}
            {session ? (
              <Link href="/dashboard" className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition-colors duration-300 px-3 py-2 rounded-lg hover:bg-gray-50 font-medium">
                <FiUser size={20} />
                <span className="text-sm">{session.user?.name}</span>
              </Link>
            ) : (
              <Link href="/auth/signin" className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition-colors duration-300 px-3 py-2 rounded-lg hover:bg-gray-50 font-medium">
                <FiUser size={20} />
                <span className="text-sm">Account</span>
              </Link>
            )}

            {/* User Menu */}
            {session ? (
              <div className="flex items-center space-x-3">
                <Link href="/dashboard" className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition-colors duration-300 px-3 py-2 rounded-lg hover:bg-gray-50 font-medium">
                  <FiUser size={20} />
                  <span className="text-sm">{session.user?.name}</span>
                </Link>
                <button
                  onClick={() => signOut()}
                  className="text-sm text-gray-700 hover:text-red-600 transition-colors duration-300 px-3 py-2 rounded-lg hover:bg-red-50 font-medium"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  href="/auth/signin"
                  className="text-gray-700 hover:text-primary-600 transition-colors duration-300 px-4 py-2 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-5 py-2 rounded-xl hover:from-primary-700 hover:to-primary-800 shadow-md hover:shadow-xl transition-all duration-300 font-medium active:scale-95"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Currency Switcher and Search Icon for mobile (visible in mobile menu bar) */}
          <div className="md:hidden flex items-center mx-2 gap-2">
            <button
              className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors duration-300 text-gray-700 hover:text-primary-600"
              tabIndex={-1}
              onClick={() => setShowConfirm(true)}
            >
              <span className="text-sm font-medium uppercase">{currency.symbol} ({currency.code})</span>
            </button>
            <Link href="/products" className="p-2 rounded-lg hover:bg-gray-100 text-gray-700 hover:text-primary-600 transition-colors duration-300">
              <FiSearch size={22} />
            </Link>
            {showConfirm && (
              <div className="absolute left-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 px-3 py-2 text-gray-900 focus:outline-none">
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
                  disabled={switching || status === 'loading'}
                  onClick={async () => {
                    setSwitching(true);
                    if (status === 'authenticated') {
                      await fetch('/api/user/settings', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ currency: selectedCurrency }),
                      });
                    }
                    const selected = currencies.find(c => c.code === selectedCurrency);
                    if (selected) setCurrency(selected);
                    setSwitching(false);
                    setShowConfirm(false);
                  }}
                >
                  {switching || status === 'loading' ? 'Switching...' : 'OK'}
                </button>
                <button
                  className="w-full mt-2 bg-gray-200 text-gray-700 py-1 rounded hover:bg-gray-300 transition"
                  onClick={() => setShowConfirm(false)}
                >Cancel</button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-gray-700 hover:text-primary-600 transition-colors duration-300 p-2 rounded-lg hover:bg-gray-50"
          >
            {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        <div className={`md:hidden overflow-hidden transition-all duration-500 ease-in-out ${mobileMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="pb-4 space-y-2 bg-gradient-to-b from-gray-50 to-white rounded-b-xl px-2 pt-4">
            {/* ...existing code... */}
            </div>

            <Link
              href="/products"
              className="block text-gray-700 hover:text-primary-600 hover:bg-gray-100 transition-all duration-300 px-4 py-3 rounded-lg font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Products
            </Link>
            <Link
              href="/categories"
              className="block text-gray-700 hover:text-primary-600 hover:bg-gray-100 transition-all duration-300 px-4 py-3 rounded-lg font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Categories
            </Link>
            <Link
              href="/cart"
              className="block text-gray-700 hover:text-primary-600 hover:bg-gray-100 transition-all duration-300 px-4 py-3 rounded-lg font-medium flex items-center justify-between"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span>Cart</span>
              {itemCount > 0 && (
                <span className="bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* Language Switcher Mobile */}
            <div className="border-t border-gray-200 pt-3 mt-3">
              <p className="text-xs text-gray-500 px-4 mb-2 font-semibold">LANGUAGE</p>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setLanguage('en');
                    setMobileMenuOpen(false);
                  }}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${language === 'en' ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  🇬🇧 EN
                </button>
                <button
                  onClick={() => {
                    setLanguage('fr');
                    setMobileMenuOpen(false);
                  }}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${language === 'fr' ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  🇫🇷 FR
                </button>
                <button
                  onClick={() => {
                    setLanguage('ar');
                    setMobileMenuOpen(false);
                  }}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${language === 'ar' ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  🇸🇦 AR
                </button>
              </div>
            </div>

            {session ? (
              <div className="border-t border-gray-200 pt-3 mt-3 space-y-2">
                <Link
                  href="/dashboard"
                  className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 hover:bg-gray-100 transition-all duration-300 px-4 py-3 rounded-lg font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <FiUser size={18} />
                  <span>{session.user?.name}</span>
                </Link>
                <button
                  onClick={() => {
                    signOut();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left text-red-600 hover:bg-red-50 transition-all duration-300 px-4 py-3 rounded-lg font-medium"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="border-t border-gray-200 pt-3 mt-3 space-y-2">
                <Link
                  href="/auth/signin"
                  className="block text-gray-700 hover:text-primary-600 hover:bg-gray-100 transition-all duration-300 px-4 py-3 rounded-lg font-medium text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="block bg-gradient-to-r from-primary-600 to-primary-700 text-white px-4 py-3 rounded-xl hover:from-primary-700 hover:to-primary-800 shadow-md hover:shadow-xl transition-all duration-300 font-medium text-center active:scale-95"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
    </nav>
    </>
  );
}
