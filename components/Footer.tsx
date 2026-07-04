'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();

  // Hide Footer on admin pages
  const isAdminPage = pathname?.startsWith('/admin');
  if (isAdminPage) {
    return null;
  }

  return (
    <footer className="bg-gray-900 text-white mt-16 pb-16 md:pb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="text-2xl">🌱</span> MKULIMA BORA
            </h3>
            <p className="text-gray-400 text-sm">
              Connecting farmers directly with buyers. Fresh produce, quality livestock, and farm products delivered to your doorstep.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Categories</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="/categories/vegetables" className="hover:text-white transition-colors">
                  Vegetables
                </Link>
              </li>
              <li>
                <Link href="/categories/fruits" className="hover:text-white transition-colors">
                  Fruits
                </Link>
              </li>
              <li>
                <Link href="/categories/livestock" className="hover:text-white transition-colors">
                  Livestock
                </Link>
              </li>
              <li>
                <Link href="/categories/seeds-seedlings" className="hover:text-white transition-colors">
                  Seeds & Seedlings
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="/help" className="hover:text-white transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="hover:text-white transition-colors">
                  Delivery Info
                </Link>
              </li>
              <li>
                <Link href="/returns" className="hover:text-white transition-colors">
                  Returns & Refunds
                </Link>
              </li>
              <li>
                <Link href="/market-prices" className="hover:text-white transition-colors">
                  Market Prices
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/seller-agreement" className="hover:text-white transition-colors">
                  Seller Agreement
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="text-center text-sm text-gray-400">
            <p>&copy; {new Date().getFullYear()} Mkulima Bora. All rights reserved.</p>
            <p className="mt-2">
              From Farm to Table | Supporting Local Farmers
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
