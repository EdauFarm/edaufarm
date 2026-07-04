'use client';


import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiHome, FiGrid, FiShoppingCart, FiUser, FiGlobe } from 'react-icons/fi';
import { useCartStore } from '@/store/cartStore';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
// Removed currency context and state


export default function BottomNav() {
  const pathname = usePathname();
  const itemCount = useCartStore((state) => state.itemCount());
  const { t } = useLanguage();
  // Removed currency switcher state and effects

  // Hide BottomNav on admin pages
  const isAdminPage = pathname?.startsWith('/admin');
  if (isAdminPage) {
    return null;
  }

  const navItems = [
    { href: '/', icon: FiHome, label: t('nav.home') },
    { href: '/products', icon: FiGrid, label: t('nav.categories') },
    { href: '/cart', icon: FiShoppingCart, label: t('nav.cart'), badge: itemCount },
    { href: '/dashboard', icon: FiUser, label: t('nav.account') },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2 relative">
        {navItems.map(({ href, icon: Icon, label, badge }) => {
          const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors relative',
                isActive ? 'text-primary-600' : 'text-gray-600'
              )}
            >
              <div className="relative">
                <Icon className="w-6 h-6" />
                {badge !== undefined && badge > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] min-w-[16px] h-4 rounded-full flex items-center justify-center font-bold px-1">
                    {badge > 99 ? '99+' : badge}
                  </span>
                )}
              </div>
              <span className="text-xs font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
