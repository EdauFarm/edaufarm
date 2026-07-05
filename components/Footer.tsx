'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiFacebook, FiInstagram, FiTwitter, FiMail, FiPhone } from 'react-icons/fi';

export default function Footer() {
  const pathname = usePathname();

  // Hide Footer on admin pages
  const isAdminPage = pathname?.startsWith('/admin');
  if (isAdminPage) {
    return null;
  }

  return (
    <footer className="bg-primary-700 text-white mt-16 pb-16 md:pb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
                <span className="text-2xl">🌾</span>
              </div>
              <div>
                <h3 className="text-xl font-bold">EDAU FARM</h3>
                <p className="text-primary-200 text-xs">Est. 2015</p>
              </div>
            </div>
            <p className="text-primary-100 text-sm leading-relaxed">
              West Pokot&apos;s premier sustainable farm. Premium Acacia honey, fresh seasonal fruits, Dorper sheep, and free-range poultry. Where tradition meets sustainability.
            </p>
          </div>

          {/* Products */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Our Products</h4>
            <ul className="space-y-2 text-sm text-primary-100">
              <li>
                <Link href="/products?category=honey" className="hover:text-accent-400 transition-colors flex items-center gap-2">
                  <span>🍯</span> Acacia Honey
                </Link>
              </li>
              <li>
                <Link href="/products?category=fruits" className="hover:text-accent-400 transition-colors flex items-center gap-2">
                  <span>🥭</span> Fresh Fruits
                </Link>
              </li>
              <li>
                <Link href="/products?category=livestock" className="hover:text-accent-400 transition-colors flex items-center gap-2">
                  <span>🐑</span> Dorper Sheep
                </Link>
              </li>
              <li>
                <Link href="/products?category=poultry" className="hover:text-accent-400 transition-colors flex items-center gap-2">
                  <span>🐔</span> Free-Range Poultry
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Quick Links</h4>
            <ul className="space-y-2 text-sm text-primary-100">
              <li>
                <Link href="/products" className="hover:text-accent-400 transition-colors">
                  Shop All Products
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="hover:text-accent-400 transition-colors">
                  Gallery
                </Link>
              </li>
              <li>
                <Link href="/farm-visits" className="hover:text-accent-400 transition-colors">
                  Book a Farm Visit
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-accent-400 transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Get in Touch</h4>
            <ul className="space-y-3 text-sm text-primary-100">
              <li className="flex items-center gap-2">
                <FiPhone className="w-4 h-4" />
                <span>+254 700 000 000</span>
              </li>
              <li className="flex items-center gap-2">
                <FiMail className="w-4 h-4" />
                <span>info@edaufarm.com</span>
              </li>
              <li className="pt-2">
                <p className="text-primary-200">West Pokot County, Kenya</p>
                <p className="text-primary-200 text-xs">Along Kitale-Kapenguria Road</p>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-600 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-primary-200">
              &copy; {new Date().getFullYear()} Edau Farm. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-primary-200 hover:text-white transition-colors">
                <FiFacebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-primary-200 hover:text-white transition-colors">
                <FiInstagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-primary-200 hover:text-white transition-colors">
                <FiTwitter className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
