'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { FiShoppingCart, FiUser, FiSearch, FiMenu, FiX, FiLogIn, FiSmartphone } from 'react-icons/fi';
import { useCartStore } from '@/store/cartStore';
import { useState } from 'react';
import DynamicSearch from './DynamicSearch';

const navLinks = [
  { href: '/products', label: 'Products' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/farm-visits', label: 'Farm Visit' },
  { href: '/contact', label: 'Contact' },
];

export default function TopBar() {
  const { data: session } = useSession();
  const { items } = useCartStore();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const cartItemsCount = items.reduce((acc, item) => acc + item.quantity, 0);

  // Hide TopBar on admin pages
  const isAdminPage = pathname?.startsWith('/admin');
  if (isAdminPage) {
    return null;
  }

  return (
    <header className="bg-white border-b border-primary-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                <span className="text-white font-bold text-lg">EF</span>
              </div>
              <div className="hidden sm:block">
                <span className="text-primary-700 font-bold text-lg">Edau Farm</span>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  pathname === link.href
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:text-primary-700 hover:bg-primary-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Search */}
          <div className="hidden lg:flex flex-1 max-w-md mx-8">
            <DynamicSearch />
          </div>

          {/* Right side icons */}
          <div className="flex items-center gap-2">
            {/* Shop Button */}
            <Link
              href="/products"
              className="hidden sm:flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm hover:shadow-md"
            >
              <span>Shop</span>
            </Link>

            {/* Cart */}
            <Link href="/cart" className="relative p-2 hover:bg-primary-50 rounded-lg transition-colors" title="Cart">
              <FiShoppingCart className="w-5 h-5 text-primary-700" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {cartItemsCount > 9 ? '9+' : cartItemsCount}
                </span>
              )}
            </Link>

            {/* Login/Account */}
            {session ? (
              <Link href="/account" className="p-2 hover:bg-primary-50 rounded-lg transition-colors" title="Account">
                <FiUser className="w-5 h-5 text-primary-700" />
              </Link>
            ) : (
              <Link
                href="/auth/signin"
                className="hidden sm:flex items-center gap-2 text-primary-700 hover:text-primary-800 font-medium text-sm px-3 py-2 rounded-lg hover:bg-primary-50 transition-colors"
              >
                <FiLogIn className="w-4 h-4" />
                <span>Login</span>
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 hover:bg-primary-50 rounded-lg lg:hidden transition-colors"
              title="Menu"
            >
              {mobileMenuOpen ? (
                <FiX className="w-5 h-5 text-primary-700" />
              ) : (
                <FiMenu className="w-5 h-5 text-primary-700" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="lg:hidden py-4 border-t border-primary-100">
            {/* Mobile Search */}
            <div className="mb-4">
              <DynamicSearch />
            </div>

            {/* Nav Links */}
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    pathname === link.href
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-700 hover:bg-primary-50 hover:text-primary-700'
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              {/* Shop Button Mobile */}
              <Link
                href="/products"
                onClick={() => setMobileMenuOpen(false)}
                className="mt-2 bg-primary-600 text-white px-4 py-3 rounded-lg text-sm font-semibold text-center hover:bg-primary-700 transition-colors"
              >
                Shop Now
              </Link>

              {/* Login Mobile */}
              {!session && (
                <Link
                  href="/auth/signin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 text-primary-700 font-medium text-sm px-4 py-3 rounded-lg hover:bg-primary-50 transition-colors"
                >
                  <FiLogIn className="w-4 h-4" />
                  <span>Login</span>
                </Link>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
