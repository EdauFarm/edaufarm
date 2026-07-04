'use client';

import Link from 'next/link';
import { FiMessageCircle, FiTrendingUp, FiGift } from 'react-icons/fi';

export default function PromoColumn() {
  return (
    <aside className="w-60 space-y-4">
      {/* WhatsApp Order Card */}
      <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
        <FiMessageCircle className="w-10 h-10 mb-3" />
        <h3 className="font-bold text-lg mb-2">Order via WhatsApp</h3>
        <p className="text-sm mb-4 opacity-90">
          Chat with us to place your order
        </p>
        <Link
          href="https://wa.me/"
          className="inline-block bg-white text-green-600 px-4 py-2 rounded-full font-semibold text-sm hover:bg-gray-100 transition-colors"
        >
          Start Chat
        </Link>
      </div>

      {/* Sell on Platform Card */}
      <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
        <FiTrendingUp className="w-10 h-10 mb-3" />
        <h3 className="font-bold text-lg mb-2">Start Selling Today</h3>
        <p className="text-sm mb-4 opacity-90">
          Reach millions of customers
        </p>
        <Link
          href="/sell"
          className="inline-block bg-white text-orange-600 px-4 py-2 rounded-full font-semibold text-sm hover:bg-gray-100 transition-colors"
        >
          Learn More
        </Link>
      </div>

      {/* Seasonal Promotion Card */}
      <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
        <FiGift className="w-10 h-10 mb-3" />
        <h3 className="font-bold text-lg mb-2">Exclusive Deals</h3>
        <p className="text-sm mb-4 opacity-90">
          Save up to 50% on selected items
        </p>
        <Link
          href="/products?deals=true"
          className="inline-block bg-white text-purple-600 px-4 py-2 rounded-full font-semibold text-sm hover:bg-gray-100 transition-colors"
        >
          Shop Deals
        </Link>
      </div>
    </aside>
  );
}
