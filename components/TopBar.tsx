'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { FiShoppingCart, FiUser, FiSearch, FiMenu, FiX } from 'react-icons/fi';
import { useCartStore } from '@/store/cartStore';
import { useState } from 'react';
import DynamicSearch from './DynamicSearch';

const navLinks = [
  { href: '/products', label: 'Products' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/farm-visits', label: 'Farm Visits' },
  { href: '/contact', label: 'Contact' },
];

export default function TopBar() {
  const { data: session } = useSession();
  const { items } = useCartStore();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

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
          <Link href="/" className="text-lg font-semibold text-primary-700 hover:text-primary-600 transition-colors flex items-center gap-2">
            <span className="text-2xl">🌾</span>
            <span className="text-primary-700 font-bold">Edau Farm</span>
          </Link>

          {/* Desktop Navigation with Collapsed Search */}
          <div className="hidden md:flex items-center gap-4 flex-1 max-w-2xl mx-8">
            {/* Collapsible Search */}
            <div className="flex-1">
              <DynamicSearch />
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? 'text-primary-600'
                    : 'text-primary-700 hover:text-primary-600'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right side icons */}
          <div className="flex items-center gap-2">
            <Link href={session ? '/account' : '/auth/signin'} className="p-2 hover:bg-primary-50 rounded-md transition-colors" title="Account">
              <FiUser className="w-5 h-5 text-primary-700" />
            </Link>
            <Link href="/cart" className="relative p-2 hover:bg-primary-50 rounded-md transition-colors" title="Cart">
              <FiShoppingCart className="w-5 h-5 text-primary-700" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium">
                  {cartItemsCount > 9 ? '9+' : cartItemsCount}
                </span>
              )}
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 hover:bg-primary-50 rounded-md md:hidden transition-colors"
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
          <nav className="md:hidden py-4 border-t border-primary-100">
            {/* Mobile Search */}
            <div className="mb-4">
              <DynamicSearch />
            </div>
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    pathname === link.href
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-primary-700 hover:bg-primary-50'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
