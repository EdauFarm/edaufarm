'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiMail, FiMapPin, FiPhone } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';

export default function Footer() {
  const pathname = usePathname();

  if (pathname?.startsWith('/admin')) return null;

  return (
    <footer className="relative bg-neutral-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer */}
        <div className="py-16 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8">
            {/* Brand Column */}
            <div className="lg:col-span-4">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 bg-primary-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">EF</span>
                </div>
                <span className="text-lg font-semibold tracking-tight">Edau Farm</span>
              </div>
              <p className="text-neutral-400 text-sm leading-relaxed max-w-xs mb-6">
                West Pokot&apos;s premier sustainable farm since 2015. Premium honey, fruits, livestock, and poultry grown with care.
              </p>
              <div className="flex items-center gap-4">
                <a
                  href="https://www.facebook.com/share/1CfKA9PZjD/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neutral-500 hover:text-white transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
                <a
                  href={`https://wa.me/254727690165`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neutral-500 hover:text-green-400 transition-colors"
                >
                  <FaWhatsapp className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Links */}
            <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-8">
              {/* Products */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-4">Products</h3>
                <ul className="space-y-3">
                  <li>
                    <Link href="/products?category=honey" className="text-sm text-neutral-400 hover:text-white transition-colors">
                      Honey
                    </Link>
                  </li>
                  <li>
                    <Link href="/products?category=fruits" className="text-sm text-neutral-400 hover:text-white transition-colors">
                      Fresh Fruits
                    </Link>
                  </li>
                  <li>
                    <Link href="/products?category=livestock" className="text-sm text-neutral-400 hover:text-white transition-colors">
                      Livestock
                    </Link>
                  </li>
                  <li>
                    <Link href="/products?category=poultry" className="text-sm text-neutral-400 hover:text-white transition-colors">
                      Poultry
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Company */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-4">Company</h3>
                <ul className="space-y-3">
                  <li>
                    <Link href="/about" className="text-sm text-neutral-400 hover:text-white transition-colors">
                      About
                    </Link>
                  </li>
                  <li>
                    <Link href="/gallery" className="text-sm text-neutral-400 hover:text-white transition-colors">
                      Gallery
                    </Link>
                  </li>
                  <li>
                    <Link href="/farm-visits" className="text-sm text-neutral-400 hover:text-white transition-colors">
                      Farm Visits
                    </Link>
                  </li>
                  <li>
                    <Link href="/contact" className="text-sm text-neutral-400 hover:text-white transition-colors">
                      Contact
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Contact */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-4">Contact</h3>
                <ul className="space-y-3">
                  <li>
                    <a href="tel:+254727690165" className="flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors">
                      <FiPhone className="w-4 h-4" />
                      +254 727 690165
                    </a>
                  </li>
                  <li>
                    <a href="mailto:info@edaufarm.com" className="flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors">
                      <FiMail className="w-4 h-4" />
                      info@edaufarm.com
                    </a>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-neutral-400">
                    <FiMapPin className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>West Pokot County<br />Along Kitale-Lodwar Road</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-neutral-800 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-neutral-500">
              {new Date().getFullYear()} Edau Farm. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link href="/terms" className="text-xs text-neutral-500 hover:text-neutral-300 transition-colors">
                Terms
              </Link>
              <Link href="/privacy" className="text-xs text-neutral-500 hover:text-neutral-300 transition-colors">
                Privacy
              </Link>
              <Link href="/shipping" className="text-xs text-neutral-500 hover:text-neutral-300 transition-colors">
                Shipping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
