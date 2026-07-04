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
              <span className="text-2xl">🌾</span> EDAU FARM
            </h3>
            <p className="text-gray-400 text-sm">
              West Pokot's premier sustainable farm. Premium Acacia honey, fresh seasonal fruits, Dorper sheep, and free-range poultry. Where tradition meets sustainability.
            </p>
          </div>

          {/* Products */}
          <div>
            <h4 className="font-semibold mb-4">Our Products</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="/products?category=honey" className="hover:text-white transition-colors">
                  Acacia Honey
                </Link>
              </li>
              <li>
                <Link href="/products?category=fruits" className="hover:text-white transition-colors">
                  Fresh Fruits
                </Link>
              </li>
              <li>
                <Link href="/products?category=livestock" className="hover:text-white transition-colors">
                  Dorper Sheep
                </Link>
              </li>
              <li>
                <Link href="/products?category=poultry" className="hover:text-white transition-colors">
                  Free-Range Poultry
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
                <Link href="/about" className="hover:text-white transition-colors">
                  About Our Farm
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
                <Link href="/about" className="hover:text-white transition-colors">
                  Our Story
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="text-center text-sm text-gray-400">
            <p>&copy; {new Date().getFullYear()} Edau Farm. All rights reserved.</p>
            <p className="mt-2">
              West Pokot, Kenya | Where Tradition Meets Sustainability
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
