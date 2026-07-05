'use client';

import Link from 'next/link';
import { 
  FiSmartphone, FiMonitor, FiCpu, FiShoppingBag, 
  FiHome, FiHeart, FiGrid, FiPackage, FiStar,
  FiShield, FiZap, FiBriefcase
} from 'react-icons/fi';
import { useLanguage } from '@/contexts/LanguageContext';

const categories = [
  { icon: FiStar, label: 'Official Stores', href: '/products?category=official-stores', color: 'text-yellow-600' },
  { icon: FiSmartphone, label: 'Phones & Tablets', href: '/products?category=phones-tablets', color: 'text-blue-600' },
  { icon: FiMonitor, label: 'TVs & Audio', href: '/products?category=tvs-audio', color: 'text-purple-600' },
  { icon: FiZap, label: 'Appliances', href: '/products?category=appliances', color: 'text-green-600' },
  { icon: FiHeart, label: 'Health & Beauty', href: '/products?category=health-beauty', color: 'text-pink-600' },
  { icon: FiHome, label: 'Home & Office', href: '/products?category=home-office', color: 'text-indigo-600' },
  { icon: FiShoppingBag, label: 'Fashion', href: '/products?category=fashion', color: 'text-red-600' },
  { icon: FiCpu, label: 'Computing', href: '/products?category=computing', color: 'text-gray-600' },
  { icon: FiGrid, label: 'Gaming', href: '/products?category=gaming', color: 'text-orange-600' },
  { icon: FiShoppingBag, label: 'Supermarket', href: '/products?category=supermarket', color: 'text-teal-600' },
  { icon: FiShield, label: 'Baby Products', href: '/products?category=baby-products', color: 'text-cyan-600' },
  { icon: FiPackage, label: 'Other Categories', href: '/products', color: 'text-gray-500' },
];

export default function CategorySidebar() {
  const { t } = useLanguage();

  // Deduplicate categories by label
  const uniqueCategories = Array.from(
    new Map(categories.map(cat => [(cat.label || '').toLowerCase(), cat])).values()
  );
  return (
    <aside className="w-60 bg-white rounded-lg shadow-sm overflow-hidden sticky top-20 h-[calc(100vh-6rem)] overflow-y-auto">
      {uniqueCategories.map((category, index) => (
        <Link
          key={index}
          href={category.href}
          className="flex items-center space-x-3 px-4 py-3 hover:bg-orange-50 transition-colors border-b border-gray-100 last:border-b-0 group"
        >
          <category.icon className={`w-5 h-5 ${category.color} group-hover:scale-110 transition-transform`} />
          <span className="text-sm text-gray-700 group-hover:text-orange-600 font-medium">
            {category.label}
          </span>
        </Link>
      ))}
    </aside>
  );
}
