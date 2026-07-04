'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { FiShoppingCart, FiUser, FiHelpCircle, FiTrendingUp, FiMenu, FiX, FiSearch, FiLogOut, FiShield, FiShoppingBag } from 'react-icons/fi';
import { useCartStore } from '@/store/cartStore';
import { useLanguage } from '@/contexts/LanguageContext';
import { isAdmin } from '@/lib/roleCheck';

export default function TopBar() {
  const { data: session } = useSession();
  const { items } = useCartStore();
  const { t, language, setLanguage } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const pathname = usePathname();

  const cartItemsCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const userRole = session?.user?.role;

  // Hide TopBar on admin pages for mobile devices
  const isAdminPage = pathname?.startsWith('/admin');
  if (isAdminPage) {
    return null;
  }

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="flex items-center justify-between h-14 px-4">
          {/* Hamburger Menu */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 -ml-2 text-gray-700 hover:text-orange-600"
            aria-label="Open menu"
          >
            <FiMenu className="w-6 h-6" />
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-xl font-normal text-gray-900">Edau Farm</span>
          </Link>

          {/* Right Icons */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 text-gray-700 hover:text-orange-600"
              aria-label="Search"
            >
              <FiSearch className="w-5 h-5" />
            </button>
            <Link href="/cart" className="relative p-2">
              <FiShoppingCart className="w-5 h-5 text-gray-700" />
              {cartItemsCount > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {cartItemsCount > 9 ? '9+' : cartItemsCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:block bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Sell CTA + Logo */}
            <div className="flex items-center space-x-6">
              <Link
                href="/sell"
                className="flex items-center space-x-2 text-orange-600 hover:text-orange-700 font-medium text-sm transition-colors"
              >
                <FiTrendingUp className="w-4 h-4" />
                <span className="hidden sm:inline">{t('topbar.sellOnJumia')}</span>
              </Link>

              <Link href="/" className="flex items-center">
                <div className="text-2xl font-bold">
                  <span className="text-primary-600">EDAU FARM</span>
                </div>
              </Link>
            </div>

            {/* Center: Search Bar */}
            <div className="flex-1 max-w-2xl mx-8">
              <div className="relative">
                <input
                  type="text"
                  placeholder={t('topbar.searchPlaceholder')}
                  className="w-full px-4 py-2.5 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-1.5 rounded-md transition-colors">
                  {t('topbar.search')}
                </button>
              </div>
            </div>

            {/* Right: Account, Help, Cart */}
            <div className="flex items-center space-x-6">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as 'en' | 'fr' | 'ar')}
                className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="en">EN</option>
                <option value="fr">FR</option>
                <option value="ar">AR</option>
              </select>

              <Link href="/help" className="flex items-center space-x-1 text-gray-700 hover:text-orange-600 transition-colors">
                <FiHelpCircle className="w-5 h-5" />
                <span className="hidden lg:inline text-sm">{t('nav.help')}</span>
              </Link>

              {session ? (
                <div className="flex items-center space-x-4">
                  {/* Admin Link - Desktop */}
                  {isAdmin(userRole) && (
                    <Link href="/admin" className="flex items-center space-x-1 text-purple-600 hover:text-purple-700 transition-colors">
                      <FiShield className="w-5 h-5" />
                      <span className="hidden lg:inline text-sm font-semibold">Admin</span>
                    </Link>
                  )}
                  
                  <Link href="/dashboard" className="flex items-center space-x-1 text-gray-700 hover:text-orange-600 transition-colors">
                    <FiUser className="w-5 h-5" />
                    <span className="hidden lg:inline text-sm">{t('nav.account')}</span>
                  </Link>
                  <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="flex items-center space-x-1 text-red-600 hover:text-red-700 transition-colors"
                  >
                    <FiLogOut className="w-5 h-5" />
                    <span className="hidden lg:inline text-sm">{t('nav.signOut')}</span>
                  </button>
                </div>
              ) : (
                <Link href="/auth/signin" className="flex items-center space-x-1 text-gray-700 hover:text-orange-600 transition-colors">
                  <FiUser className="w-5 h-5" />
                  <span className="hidden lg:inline text-sm">{t('nav.signIn')}</span>
                </Link>
              )}

              <Link href="/cart" className="relative">
                <div className="flex items-center space-x-1 text-gray-700 hover:text-orange-600 transition-colors">
                  <FiShoppingCart className="w-6 h-6" />
                  {cartItemsCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                      {cartItemsCount > 9 ? '9+' : cartItemsCount}
                    </span>
                  )}
                  <span className="hidden lg:inline text-sm">{t('nav.cart')}</span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      <div
        className={`lg:hidden fixed inset-0 z-50 transition-opacity duration-300 ${
          mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Overlay */}
        <div
          className="absolute inset-0 bg-black bg-opacity-50"
          onClick={() => setMobileMenuOpen(false)}
        />

        {/* Drawer */}
        <div
          className={`absolute top-0 left-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl transform transition-transform duration-300 ${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <span className="text-2xl font-bold text-primary-600">EDAU FARM</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 -mr-2 text-gray-500 hover:text-gray-700"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            {/* Menu Items */}
            <div className="flex-1 overflow-y-auto">
              <nav className="p-4 space-y-1">
                {session ? (
                  <>
                    <Link
                      href="/dashboard"
                      className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-orange-50 text-gray-700 hover:text-orange-600"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <FiUser className="w-5 h-5" />
                      <span className="font-medium">{t('nav.myAccount')}</span>
                    </Link>

                    {/* Admin Link - Mobile */}
                    {isAdmin(userRole) && (
                      <Link
                        href="/admin"
                        className="flex items-center space-x-3 px-4 py-3 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <FiShield className="w-5 h-5" />
                        <span className="font-medium">Admin Panel</span>
                      </Link>
                    )}

                  </>
                ) : (
                  <Link
                    href="/auth/signin"
                    className="flex items-center space-x-3 px-4 py-3 rounded-lg bg-orange-600 text-white hover:bg-orange-700"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FiUser className="w-5 h-5" />
                    <span className="font-medium">{t('nav.signIn')}</span>
                  </Link>
                )}

                <Link
                  href="/sell"
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-orange-50 text-gray-700 hover:text-orange-600"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <FiTrendingUp className="w-5 h-5" />
                  <span className="font-medium">{t('topbar.sellOnJumia')}</span>
                </Link>

                <Link
                  href="/help"
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-orange-50 text-gray-700 hover:text-orange-600"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <FiHelpCircle className="w-5 h-5" />
                  <span className="font-medium">{t('topbar.helpSupport')}</span>
                </Link>

                {session && (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      signOut({ callbackUrl: '/' });
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-red-50 text-red-600 hover:text-red-700"
                  >
                    <FiLogOut className="w-5 h-5" />
                    <span className="font-medium">{t('nav.signOut')}</span>
                  </button>
                )}

                <div className="pt-4 mt-4 border-t">
                  <label className="block px-4 mb-2 text-sm font-medium text-gray-700">
                    {t('topbar.language')}
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as 'en' | 'fr' | 'ar')}
                    className="mx-4 w-[calc(100%-2rem)] px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="en">English</option>
                    <option value="fr">Français</option>
                    <option value="ar">العربية</option>
                  </select>
                </div>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Search Overlay */}
      <div
        className={`lg:hidden fixed inset-0 z-50 bg-white transition-transform duration-300 ${
          searchOpen ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="h-14 px-4 flex items-center border-b">
          <button
            onClick={() => setSearchOpen(false)}
            className="p-2 -ml-2 mr-2 text-gray-500"
          >
            <FiX className="w-6 h-6" />
          </button>
          <input
            type="text"
            placeholder={t('nav.search')}
            autoFocus
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
      </div>
    </>
  );
}
