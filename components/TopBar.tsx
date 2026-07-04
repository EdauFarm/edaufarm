'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { FiShoppingCart, FiUser, FiSearch } from 'react-icons/fi';
import { useCartStore } from '@/store/cartStore';

export default function TopBar() {
  const { data: session } = useSession();
  const { items } = useCartStore();
  // Removed search state
  const pathname = usePathname();

  const cartItemsCount = items.reduce((acc, item) => acc + item.quantity, 0);

  // Hide TopBar on admin pages
  const isAdminPage = pathname?.startsWith('/admin');
  if (isAdminPage) {
    return null;
  }

  // Removed search handler

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="text-lg font-normal text-gray-900 hover:text-gray-700 transition-colors">
            Gadget world
          </Link>
          {/* ...existing code... */}
          <div className="flex items-center gap-2">
            <Link href="/products" className="p-2 hover:bg-gray-50 rounded-md">
              <FiSearch className="w-5 h-5 text-gray-700" />
            </Link>
            <Link href={session ? '/account' : '/auth/signin'} className="p-2 hover:bg-gray-50 rounded-md">
              <FiUser className="w-5 h-5 text-gray-700" />
            </Link>
            <Link href="/cart" className="relative p-2 hover:bg-gray-50 rounded-md">
              <FiShoppingCart className="w-5 h-5 text-gray-700" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-black text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium">
                  {cartItemsCount > 9 ? '9+' : cartItemsCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
