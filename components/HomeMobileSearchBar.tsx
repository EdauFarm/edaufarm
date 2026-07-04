"use client";
import React, { useState } from "react";
import DynamicSearch from "./DynamicSearch";

export default function HomeMobileSearchBar() {
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  return (
    <div className="w-full flex flex-col items-center justify-center py-6 md:py-10">
      {/* Desktop Search - Centered and prominent */}
      <div className="hidden md:flex w-full max-w-2xl mx-auto">
        <DynamicSearch />
      </div>
      {/* Mobile Search - Centered and prominent */}
      <div className="w-full md:hidden max-w-full px-2">
        <input
          type="text"
          style={{ fontSize: '16px' }} // Prevent iOS zoom
          placeholder="Search for products..."
          className="block w-full pl-4 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-base transition-all"
          onFocus={() => setShowMobileSearch(true)}
          readOnly
        />
        {showMobileSearch && (
          <DynamicSearch mobileOverlay onClose={() => setShowMobileSearch(false)} />
        )}
      </div>
    </div>
  );
}