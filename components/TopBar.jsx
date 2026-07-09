'use client';

import { useState, useEffect } from 'react';
import DynamicSearch from './DynamicSearch';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { FiShoppingCart, FiUser, FiMenu, FiX, FiLogIn, FiSearch } from 'react-icons/fi';
import { useCartStore } from '@/store/cartStore';
import { motion, AnimatePresence } from 'framer-motion';

const navLinks = [
  { href: '/products', label: 'Shop' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/about', label: 'About' },
  { href: '/farm-visits', label: 'Visit' },
  { href: '/contact', label: 'Contact' },
];

export default function TopBar() {
  const { data: session } = useSession();
  const { items } = useCartStore();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const cartItemsCount = items.reduce((acc, item) => acc + item.quantity, 0);

  // All hooks MUST be called before any conditional return
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Hide TopBar on admin pages - AFTER all hooks
  const isAdminPage = pathname?.startsWith('/admin');
  if (isAdminPage) return null;

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/80 backdrop-blur-xl border-b border-neutral-200/50 shadow-soft'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-9 h-9 bg-primary-900 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
                <span className="text-white font-bold text-sm">EF</span>
              </div>
              <span className={`text-lg font-semibold tracking-tight transition-colors ${
                scrolled ? 'text-neutral-950' : 'text-neutral-900'
              }`}>
                Edau Farm
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-4 py-2 text-sm font-medium transition-colors ${
                    pathname === link.href
                      ? 'text-primary-900'
                      : scrolled
                        ? 'text-neutral-600 hover:text-neutral-900'
                        : 'text-neutral-700 hover:text-neutral-900'
                  }`}
                >
                  {link.label}
                  {pathname === link.href && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-primary-900 rounded-full"
                      transition={{ duration: 0.2 }}
                    />
                  )}
                </Link>
              ))}
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-2">
              {/* Search Toggle - Desktop */}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className={`hidden lg:flex p-2.5 rounded-full transition-all ${
                  scrolled
                    ? 'hover:bg-neutral-100 text-neutral-600'
                    : 'hover:bg-white/50 text-neutral-700'
                }`}
              >
                <FiSearch className="w-5 h-5" />
              </button>

              {/* Cart */}
              <Link
                href="/cart"
                className={`relative p-2.5 rounded-full transition-all ${
                  scrolled
                    ? 'hover:bg-neutral-100 text-neutral-600'
                    : 'hover:bg-white/50 text-neutral-700'
                }`}
              >
                <FiShoppingCart className="w-5 h-5" />
                <AnimatePresence>
                  {cartItemsCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-primary-900 text-white text-xs font-medium rounded-full flex items-center justify-center"
                    >
                      {cartItemsCount > 9 ? '9+' : cartItemsCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>

              {/* Account */}
              {session ? (
                <Link
                  href="/account"
                  className={`p-2.5 rounded-full transition-all ${
                    scrolled
                      ? 'hover:bg-neutral-100 text-neutral-600'
                      : 'hover:bg-white/50 text-neutral-700'
                  }`}
                >
                  <FiUser className="w-5 h-5" />
                </Link>
              ) : (
                <Link
                  href="/auth/signin"
                  className={`hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all rounded-full ${
                    scrolled
                      ? 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                      : 'text-neutral-700 hover:text-neutral-900 hover:bg-white/50'
                  }`}
                >
                  <FiLogIn className="w-4 h-4" />
                  <span>Sign in</span>
                </Link>
              )}

              {/* CTA Button */}
              <Link
                href="/products"
                className="hidden sm:flex items-center gap-2 bg-primary-900 hover:bg-primary-950 text-white px-5 py-2.5 rounded-full text-sm font-medium transition-all hover:shadow-lg"
              >
                Shop Now
              </Link>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`lg:hidden p-2.5 rounded-full transition-all ${
                  scrolled
                    ? 'hover:bg-neutral-100 text-neutral-600'
                    : 'hover:bg-white/50 text-neutral-700'
                }`}
              >
                {mobileMenuOpen ? (
                  <FiX className="w-5 h-5" />
                ) : (
                  <FiMenu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Search Bar - Desktop */}
          <AnimatePresence>
            {searchOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="hidden lg:block pb-4"
              >
                <DynamicSearch />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 lg:hidden"
          >
            <div
              className="absolute inset-0 bg-black/20 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-white shadow-2xl"
            >
              <div className="flex flex-col h-full pt-20">
                <div className="p-4">
                  <DynamicSearch />
                </div>
                <nav className="flex-1 px-4 py-6">
                  <div className="space-y-1">
                    {navLinks.map((link, i) => (
                      <motion.div
                        key={link.href}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                      >
                        <Link
                          href={link.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`block px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                            pathname === link.href
                              ? 'bg-primary-50 text-primary-900'
                              : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                          }`}
                        >
                          {link.label}
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </nav>
                <div className="p-4 border-t border-neutral-100">
                  <Link
                    href="/products"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 w-full bg-primary-900 text-white px-6 py-3.5 rounded-xl font-semibold hover:bg-primary-950 transition-colors"
                  >
                    Shop Now
                  </Link>
                  {!session && (
                    <Link
                      href="/auth/signin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-center gap-2 w-full mt-3 text-neutral-600 hover:text-neutral-900 font-medium py-3 transition-colors"
                    >
                      <FiLogIn className="w-4 h-4" />
                      Sign in
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacer for fixed header */}
      <div className="h-16 lg:h-20" />
    </>
  );
}
