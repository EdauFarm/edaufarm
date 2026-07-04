# Jumia Parity Upgrade - Complete Implementation Specification

**Version:** 2.0  
**Target:** 99% Behavioral & Visual Parity with Jumia  
**Estimated Timeline:** 2-3 weeks  
**Current Status:** ~60% → Target: ~99%

---

## 📊 CURRENT STATE AUDIT

### ✅ What We Have (60% Parity)
- [x] Authentication & user management
- [x] Product catalog with MongoDB integration
- [x] Product detail pages (PDP)
- [x] Shopping cart (Zustand state)
- [x] Basic checkout flow
- [x] M-Pesa STK Push payment integration
- [x] Order creation & tracking
- [x] Seller onboarding
- [x] Admin panel basics
- [x] Email notifications (Resend)
- [x] Buyback system foundation
- [x] Wallet system
- [x] Saved addresses & Kenya locations API
- [x] Basic skeleton loaders

### ❌ Critical Gaps (40% Missing)
- [ ] Advanced search (typo tolerance, synonyms, ranking)
- [ ] Multi-select filters with persistence
- [ ] Flash sale countdown timers
- [ ] Voucher/coupon system
- [ ] Campaign engine
- [ ] Full order state machine (7 states)
- [ ] Order timeline UI
- [ ] Returns & refunds workflow
- [ ] Dispute resolution system
- [ ] Seller analytics dashboard
- [ ] Performance score tracking
- [ ] Fraud prevention layer
- [ ] Redis caching
- [ ] Analytics telemetry
- [ ] Comprehensive testing

---

## 🎯 PHASE 1: UI/UX PARITY (Week 1 - Days 1-3)

### 1.1 Skeleton Loaders Integration ✅ DONE
**Status:** Completed  
**Files Modified:** `components/SkeletonLoader.tsx`, `tailwind.config.ts`

### 1.2 Integrate Skeletons Across Platform
**Priority:** HIGH  
**Effort:** 4 hours  

**Files to Update:**
```
app/page.tsx                      - Home page loading states
app/products/page.tsx             - Product listing with skeleton grid
app/products/[id]/page.tsx        - PDP skeleton integration
app/cart/page.tsx                 - Cart items skeleton
app/orders/page.tsx               - Order cards skeleton
app/flash-sales/page.tsx          - Flash sale grid skeleton
components/CategoryGrid.tsx       - Category loading state
components/FlashSales.tsx         - Flash sale skeleton
components/SponsoredProducts.tsx  - Sponsored skeleton
```

**Implementation Pattern:**
```tsx
// Before
{loading && <LoadingSpinner />}

// After
{loading && <ProductListSkeleton count={12} />}
```

**Acceptance Criteria:**
- [ ] Zero instances of generic LoadingSpinner on product pages
- [ ] All async data fetches show contextual skeletons
- [ ] Skeleton matches final content layout pixel-perfect
- [ ] Shimmer animation runs at 60fps

---

### 1.3 Micro-Interactions & Hover States
**Priority:** HIGH  
**Effort:** 6 hours  

**Component Updates:**

#### ProductCard Enhancements
**File:** `components/ProductCard.tsx`

```tsx
// Add these interactions:
1. Hover Scale Effect
   - Image: scale(1.05) on hover
   - Shadow: elevation increase
   - Border: primary-200 highlight

2. Button Press Delay (150ms)
   - "Add to Cart" disabled during async
   - Optimistic UI update
   - Success animation (scale bounce)

3. Wishlist Heart Animation
   - Outline → Filled transition
   - Scale pulse on click
   - Persist state in localStorage

4. Stock Indicator
   - Low stock warning (< 5 items)
   - "Only X left" badge
   - Pulsing animation for urgency
```

#### Cart Operations (Optimistic UI)
**File:** `app/cart/page.tsx`

```tsx
// Implement optimistic updates:
1. Add to Cart
   - Instant UI update before API call
   - Rollback on error
   - Toast notification sequence

2. Quantity Change
   - Debounced API call (500ms)
   - Immediate visual feedback
   - Disable controls during update

3. Remove Item
   - Fade-out animation (300ms)
   - Undo toast (3s window)
   - API call on undo timeout
```

#### Button States
**Global Pattern:**

```tsx
// All CTAs should follow this pattern:
<button
  disabled={loading}
  onClick={handleClick}
  className={cn(
    "transition-all duration-200",
    "active:scale-95",
    "disabled:opacity-50 disabled:cursor-not-allowed",
    loading && "animate-pulse"
  )}
>
  {loading ? <Spinner /> : children}
</button>
```

**Files to Update:**
- `components/ProductCard.tsx`
- `app/cart/page.tsx`
- `app/checkout/page.tsx`
- `app/products/[id]/ProductDetailClient.tsx`

**Acceptance Criteria:**
- [ ] All buttons have 150-250ms press delay
- [ ] Disabled states during async operations
- [ ] Hover states match Jumia exactly
- [ ] Optimistic UI for all cart operations
- [ ] Animations run at 60fps on mobile

---

### 1.4 Scroll Position Memory
**Priority:** MEDIUM  
**Effort:** 3 hours  

**Implementation:**
```tsx
// Create scroll restoration hook
// File: lib/hooks/useScrollRestoration.ts

export function useScrollRestoration(key: string) {
  useEffect(() => {
    // Save scroll on unmount
    return () => {
      sessionStorage.setItem(
        `scroll-${key}`,
        window.scrollY.toString()
      );
    };
  }, [key]);

  useEffect(() => {
    // Restore scroll on mount
    const saved = sessionStorage.getItem(`scroll-${key}`);
    if (saved) {
      window.scrollTo(0, parseInt(saved));
    }
  }, [key]);
}
```

**Files to Update:**
- `lib/hooks/useScrollRestoration.ts` (new)
- `app/products/page.tsx`
- `app/products/[id]/page.tsx`

**User Flow:**
1. User scrolls to product #20 on PLP
2. Clicks product to view PDP
3. Clicks back button
4. Page restores to product #20 position

**Acceptance Criteria:**
- [ ] PLP → PDP → back restores position
- [ ] Search results restore position
- [ ] Category filter changes reset scroll
- [ ] Works on both browser back and custom back buttons

---

### 1.5 Mobile Responsiveness Polish
**Priority:** HIGH  
**Effort:** 4 hours  

**Touch Targets:**
- Minimum 44x44px for all interactive elements
- Increase button padding on mobile
- Larger tap areas for small icons

**Responsive Grid Optimization:**
```tsx
// Product Grid Breakpoints (match Jumia)
xs: 2 columns  // 320px+
sm: 2 columns  // 640px+
md: 3 columns  // 768px+
lg: 4 columns  // 1024px+
xl: 5 columns  // 1280px+ (Jumia uses 5 on desktop)
```

**Files to Update:**
- `app/products/page.tsx`
- `app/page.tsx`
- `components/ProductCard.tsx`

**Acceptance Criteria:**
- [ ] Touch targets >= 44x44px
- [ ] Grid matches Jumia at all breakpoints
- [ ] No horizontal scroll on any device
- [ ] Text remains readable at all sizes

---

## 🔍 PHASE 2: SEARCH & DISCOVERY INTELLIGENCE (Week 1 - Days 4-5)

### 2.1 Fuzzy Search with Typo Tolerance
**Priority:** CRITICAL  
**Effort:** 8 hours  

**Technology:** Use `fuse.js` for fuzzy matching

**Installation:**
```bash
npm install fuse.js
```

**Implementation:**
**File:** `lib/search.ts` (new)

```typescript
import Fuse from 'fuse.js';

interface SearchOptions {
  threshold?: number;
  keys: string[];
  includeScore?: boolean;
}

export class ProductSearchEngine {
  private fuse: Fuse<any>;

  constructor(products: any[]) {
    this.fuse = new Fuse(products, {
      keys: [
        { name: 'title', weight: 0.7 },
        { name: 'description', weight: 0.2 },
        { name: 'tags', weight: 0.1 },
        { name: 'brand', weight: 0.3 },
        { name: 'category', weight: 0.2 },
      ],
      threshold: 0.4, // 0.0 = perfect match, 1.0 = match anything
      includeScore: true,
      ignoreLocation: true,
      minMatchCharLength: 2,
    });
  }

  search(query: string): any[] {
    // Apply synonyms
    query = this.applySynonyms(query);
    
    const results = this.fuse.search(query);
    return results.map(r => r.item);
  }

  private applySynonyms(query: string): string {
    const synonymMap = {
      'phone': 'smartphone|mobile|cellphone',
      'laptop': 'notebook|computer',
      'earphones': 'earbuds|headphones',
      'tv': 'television',
      'fridge': 'refrigerator',
      'shoes': 'sneakers|footwear',
      'shirt': 'top|blouse',
      // Add 50+ common synonyms
    };

    let processed = query.toLowerCase();
    Object.entries(synonymMap).forEach(([key, value]) => {
      if (processed.includes(key)) {
        processed = processed.replace(key, `(${key}|${value})`);
      }
    });

    return processed;
  }
}
```

**API Integration:**
**File:** `app/api/products/search/route.ts` (new)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import { ProductSearchEngine } from '@/lib/search';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q') || '';
  
  await dbConnect();
  
  // Fetch all active products (cache this!)
  const products = await Product.find({ active: true }).lean();
  
  // Initialize search engine
  const searchEngine = new ProductSearchEngine(products);
  
  // Get fuzzy results
  const results = searchEngine.search(query);
  
  // Apply additional ranking
  const ranked = rankResults(results, query);
  
  return NextResponse.json({
    success: true,
    query,
    results: ranked,
    count: ranked.length,
  });
}

function rankResults(results: any[], query: string) {
  return results.sort((a, b) => {
    // Priority 1: Sponsored products
    if (a.sponsored && !b.sponsored) return -1;
    if (!a.sponsored && b.sponsored) return 1;
    
    // Priority 2: In stock
    if (a.stock > 0 && b.stock === 0) return -1;
    if (a.stock === 0 && b.stock > 0) return 1;
    
    // Priority 3: High rating
    const ratingDiff = (b.rating?.average || 0) - (a.rating?.average || 0);
    if (Math.abs(ratingDiff) > 0.5) return ratingDiff;
    
    // Priority 4: Sales velocity (if tracked)
    // Priority 5: Recently added
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}
```

**Frontend Integration:**
**File:** `components/DynamicSearch.tsx`

```tsx
// Add debounced search
const [results, setResults] = useState([]);
const [loading, setLoading] = useState(false);

const debouncedSearch = useMemo(
  () => debounce(async (query: string) => {
    if (query.length < 2) return;
    
    setLoading(true);
    const res = await axios.get(`/api/products/search?q=${query}`);
    setResults(res.data.results);
    setLoading(false);
  }, 300),
  []
);
```

**Test Cases:**
```
Input: "samsng phone"      → Output: Samsung phones
Input: "lafptop"           → Output: Laptops
Input: "earpones"          → Output: Earphones/Earbuds
Input: "snickers"          → Output: Sneakers
Input: "iphone 13"         → Output: iPhone 13 variants (exact first)
```

**Acceptance Criteria:**
- [ ] Handles 1-2 character typos
- [ ] Synonym matching works
- [ ] Results ranked by: sponsored → stock → rating → freshness
- [ ] Search responds < 300ms
- [ ] Highlights matched terms
- [ ] "Did you mean?" suggestions for 0 results

---

### 2.2 Multi-Select Filters
**Priority:** HIGH  
**Effort:** 6 hours  

**UI Component:**
**File:** `components/ProductFilters.tsx` (new)

```tsx
interface FilterState {
  categories: string[];
  brands: string[];
  priceRange: [number, number];
  rating: number | null;
  inStock: boolean;
  onSale: boolean;
}

export function ProductFilters({ onFilterChange }: Props) {
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    brands: [],
    priceRange: [0, 100000],
    rating: null,
    inStock: false,
    onSale: false,
  });

  // Multi-select category checkboxes
  const handleCategoryToggle = (category: string) => {
    setFilters(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category],
    }));
  };

  // Price range slider with debounce
  const handlePriceChange = useMemo(
    () => debounce((range: [number, number]) => {
      setFilters(prev => ({ ...prev, priceRange: range }));
    }, 500),
    []
  );

  return (
    <div className="space-y-6">
      {/* Categories */}
      <FilterSection title="Categories">
        {categories.map(cat => (
          <Checkbox
            key={cat}
            checked={filters.categories.includes(cat)}
            onChange={() => handleCategoryToggle(cat)}
            label={cat}
          />
        ))}
      </FilterSection>

      {/* Price Range Slider */}
      <FilterSection title="Price Range">
        <PriceRangeSlider
          min={0}
          max={100000}
          value={filters.priceRange}
          onChange={handlePriceChange}
        />
        <div className="flex justify-between text-sm">
          <span>KSh {formatPrice(filters.priceRange[0])}</span>
          <span>KSh {formatPrice(filters.priceRange[1])}</span>
        </div>
      </FilterSection>

      {/* Brand Multi-Select */}
      <FilterSection title="Brand">
        <BrandFilter
          brands={availableBrands}
          selected={filters.brands}
          onChange={(brands) => setFilters(prev => ({ ...prev, brands }))}
        />
      </FilterSection>

      {/* Rating Filter */}
      <FilterSection title="Minimum Rating">
        <RatingFilter
          value={filters.rating}
          onChange={(rating) => setFilters(prev => ({ ...prev, rating }))}
        />
      </FilterSection>

      {/* Quick Filters */}
      <FilterSection title="Quick Filters">
        <Toggle
          checked={filters.inStock}
          onChange={(checked) => setFilters(prev => ({ ...prev, inStock: checked }))}
          label="In Stock Only"
        />
        <Toggle
          checked={filters.onSale}
          onChange={(checked) => setFilters(prev => ({ ...prev, onSale: checked }))}
          label="On Sale"
        />
      </FilterSection>

      {/* Active Filters Summary */}
      <ActiveFilters filters={filters} onClear={clearFilters} />
    </div>
  );
}
```

**Filter Persistence:**
**File:** `lib/hooks/useFilterPersistence.ts` (new)

```typescript
export function useFilterPersistence(key: string) {
  const [filters, setFilters] = useState(() => {
    // Load from URL params first
    const params = new URLSearchParams(window.location.search);
    const urlFilters = Object.fromEntries(params);
    
    // Fallback to localStorage
    const saved = localStorage.getItem(`filters-${key}`);
    return urlFilters || (saved ? JSON.parse(saved) : {});
  });

  useEffect(() => {
    // Persist to localStorage
    localStorage.setItem(`filters-${key}`, JSON.stringify(filters));
    
    // Update URL params
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value.length > 0) {
        params.set(key, Array.isArray(value) ? value.join(',') : value);
      }
    });
    
    window.history.replaceState({}, '', `?${params.toString()}`);
  }, [filters, key]);

  return [filters, setFilters];
}
```

**API Support:**
**File:** `app/api/products/route.ts`

```typescript
// Add filter support
const query: any = { active: true };

// Multi-category filter
if (categories) {
  query.category = { $in: categories.split(',') };
}

// Multi-brand filter
if (brands) {
  query.brand = { $in: brands.split(',') };
}

// Price range
if (minPrice || maxPrice) {
  query.price = {};
  if (minPrice) query.price.$gte = parseFloat(minPrice);
  if (maxPrice) query.price.$lte = parseFloat(maxPrice);
}

// Rating filter
if (minRating) {
  query['rating.average'] = { $gte: parseFloat(minRating) };
}

// Stock filter
if (inStock === 'true') {
  query.stock = { $gt: 0 };
}

// On sale filter
if (onSale === 'true') {
  query.compareAtPrice = { $exists: true, $ne: null };
}
```

**Acceptance Criteria:**
- [ ] Multiple categories selectable
- [ ] Price range slider with debounce
- [ ] Filters persist in URL and localStorage
- [ ] Back button restores filter state
- [ ] Filter count badges
- [ ] "Clear all" functionality
- [ ] Mobile filter drawer

---

### 2.3 Dynamic Filter Generation
**Priority:** MEDIUM  
**Effort:** 4 hours  

**Auto-generate filters based on products in result set:**

```typescript
// File: lib/utils/generateFilters.ts

export function generateDynamicFilters(products: any[]) {
  const filters = {
    categories: new Set<string>(),
    brands: new Set<string>(),
    priceRange: { min: Infinity, max: 0 },
    availableRatings: new Set<number>(),
  };

  products.forEach(product => {
    if (product.category) filters.categories.add(product.category);
    if (product.brand) filters.brands.add(product.brand);
    if (product.price) {
      filters.priceRange.min = Math.min(filters.priceRange.min, product.price);
      filters.priceRange.max = Math.max(filters.priceRange.max, product.price);
    }
    if (product.rating?.average) {
      filters.availableRatings.add(Math.floor(product.rating.average));
    }
  });

  return {
    categories: Array.from(filters.categories).sort(),
    brands: Array.from(filters.brands).sort(),
    priceRange: [
      Math.floor(filters.priceRange.min / 100) * 100, // Round down to nearest 100
      Math.ceil(filters.priceRange.max / 100) * 100,   // Round up to nearest 100
    ],
    ratings: Array.from(filters.availableRatings).sort().reverse(),
  };
}
```

**Usage:**
```tsx
// In ProductListingPage
const dynamicFilters = generateDynamicFilters(products);

// Show only relevant filters (hide categories with 0 products)
```

**Acceptance Criteria:**
- [ ] Filters update based on current result set
- [ ] Show product count next to each filter option
- [ ] Disable unavailable filter combinations
- [ ] Gray out filters with 0 products

---

## 💰 PHASE 3: PRICING ENGINE & CAMPAIGNS (Week 2 - Days 1-3)

### 3.1 Flash Sale Countdown Timer
**Priority:** HIGH  
**Effort:** 5 hours  

**Database Schema:**
**File:** `models/FlashSale.ts` (new)

```typescript
import mongoose from 'mongoose';

const FlashSaleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  products: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    originalPrice: Number,
    salePrice: Number,
    stockLimit: Number, // Limited quantity for sale
    soldCount: { type: Number, default: 0 },
  }],
  active: { type: Boolean, default: true },
  bannerImage: String,
  priority: { type: Number, default: 0 }, // For ordering multiple sales
}, { timestamps: true });

export default mongoose.models.FlashSale || mongoose.model('FlashSale', FlashSaleSchema);
```

**Countdown Component:**
**File:** `components/CountdownTimer.tsx` (new)

```tsx
'use client';

import { useState, useEffect } from 'react';

interface CountdownTimerProps {
  endTime: Date;
  onExpire?: () => void;
}

export function CountdownTimer({ endTime, onExpire }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(endTime));

  useEffect(() => {
    const timer = setInterval(() => {
      const left = calculateTimeLeft(endTime);
      setTimeLeft(left);

      if (left.total <= 0) {
        clearInterval(timer);
        onExpire?.();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime, onExpire]);

  if (timeLeft.total <= 0) {
    return <div className="text-red-600 font-bold">EXPIRED</div>;
  }

  return (
    <div className="flex items-center gap-2">
      <div className="bg-red-600 text-white px-3 py-1 rounded font-mono">
        {String(timeLeft.hours).padStart(2, '0')}
      </div>
      <span className="text-xl font-bold">:</span>
      <div className="bg-red-600 text-white px-3 py-1 rounded font-mono">
        {String(timeLeft.minutes).padStart(2, '0')}
      </div>
      <span className="text-xl font-bold">:</span>
      <div className="bg-red-600 text-white px-3 py-1 rounded font-mono">
        {String(timeLeft.seconds).padStart(2, '0')}
      </div>
    </div>
  );
}

function calculateTimeLeft(endTime: Date) {
  const total = new Date(endTime).getTime() - Date.now();
  
  return {
    total,
    days: Math.floor(total / (1000 * 60 * 60 * 24)),
    hours: Math.floor((total / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((total / 1000 / 60) % 60),
    seconds: Math.floor((total / 1000) % 60),
  };
}
```

**Flash Sale API:**
**File:** `app/api/flash-sales/route.ts` (new)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import FlashSale from '@/models/FlashSale';

export async function GET(req: NextRequest) {
  await dbConnect();

  const now = new Date();
  
  // Get active flash sales
  const sales = await FlashSale.find({
    active: true,
    startTime: { $lte: now },
    endTime: { $gte: now },
  })
  .populate('products.productId')
  .sort({ priority: -1, startTime: 1 })
  .lean();

  return NextResponse.json({
    success: true,
    sales,
  });
}
```

**Integration:**
**File:** `components/FlashSales.tsx`

```tsx
// Add countdown to each product
<div className="flex items-center justify-between mb-2">
  <CountdownTimer endTime={sale.endTime} />
  <div className="text-sm text-gray-600">
    {sale.products[0].stockLimit - sale.products[0].soldCount} left
  </div>
</div>
```

**Acceptance Criteria:**
- [ ] Countdown updates every second
- [ ] Shows hours:minutes:seconds format
- [ ] Auto-expires when time reaches 0
- [ ] Stock counter decrements on purchase
- [ ] "Sold Out" badge when stock = 0
- [ ] Multiple simultaneous flash sales supported

---

### 3.2 Voucher & Coupon System
**Priority:** CRITICAL  
**Effort:** 10 hours  

**Database Schema:**
**File:** `models/Voucher.ts` (new)

```typescript
import mongoose from 'mongoose';

const VoucherSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true },
  type: { 
    type: String, 
    enum: ['percentage', 'fixed', 'free_shipping'],
    required: true 
  },
  value: { type: Number, required: true }, // Percentage or fixed amount
  minPurchase: { type: Number, default: 0 },
  maxDiscount: Number, // Cap for percentage vouchers
  
  // Restrictions
  applicableCategories: [String], // Empty = all categories
  applicableSellers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  excludedProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  
  // Usage limits
  usageLimit: { type: Number, default: null }, // null = unlimited
  usageCount: { type: Number, default: 0 },
  perUserLimit: { type: Number, default: 1 },
  
  // Validity
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  active: { type: Boolean, default: true },
  
  // User targeting
  firstTimeOnly: { type: Boolean, default: false },
  eligibleUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Empty = all users
  
  // Metadata
  description: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

// Index for fast code lookups
VoucherSchema.index({ code: 1 });
VoucherSchema.index({ active: 1, startDate: 1, endDate: 1 });

export default mongoose.models.Voucher || mongoose.model('Voucher', VoucherSchema);
```

**Voucher Validation Engine:**
**File:** `lib/voucher.ts` (new)

```typescript
import Voucher from '@/models/Voucher';
import Order from '@/models/Order';

interface CartItem {
  productId: string;
  price: number;
  quantity: number;
  sellerId?: string;
  category?: string;
}

export class VoucherValidator {
  async validateAndApply(
    code: string,
    userId: string,
    cartItems: CartItem[]
  ): Promise<{
    valid: boolean;
    discount: number;
    message: string;
    voucher?: any;
  }> {
    // 1. Find voucher
    const voucher = await Voucher.findOne({
      code: code.toUpperCase(),
      active: true,
    });

    if (!voucher) {
      return { valid: false, discount: 0, message: 'Invalid voucher code' };
    }

    // 2. Check date validity
    const now = new Date();
    if (now < voucher.startDate || now > voucher.endDate) {
      return { valid: false, discount: 0, message: 'Voucher has expired' };
    }

    // 3. Check usage limits
    if (voucher.usageLimit && voucher.usageCount >= voucher.usageLimit) {
      return { valid: false, discount: 0, message: 'Voucher usage limit reached' };
    }

    // 4. Check per-user limit
    const userUsageCount = await Order.countDocuments({
      userId,
      'voucher.code': code.toUpperCase(),
    });

    if (userUsageCount >= voucher.perUserLimit) {
      return { valid: false, discount: 0, message: 'You have already used this voucher' };
    }

    // 5. Check first-time user restriction
    if (voucher.firstTimeOnly) {
      const hasOrders = await Order.exists({ userId });
      if (hasOrders) {
        return { valid: false, discount: 0, message: 'Voucher is for first-time users only' };
      }
    }

    // 6. Check user eligibility
    if (voucher.eligibleUsers.length > 0) {
      if (!voucher.eligibleUsers.includes(userId)) {
        return { valid: false, discount: 0, message: 'You are not eligible for this voucher' };
      }
    }

    // 7. Calculate applicable subtotal
    const applicableItems = cartItems.filter(item => {
      // Category restriction
      if (voucher.applicableCategories.length > 0) {
        if (!voucher.applicableCategories.includes(item.category)) {
          return false;
        }
      }

      // Seller restriction
      if (voucher.applicableSellers.length > 0) {
        if (!voucher.applicableSellers.includes(item.sellerId)) {
          return false;
        }
      }

      // Excluded products
      if (voucher.excludedProducts.includes(item.productId)) {
        return false;
      }

      return true;
    });

    const applicableSubtotal = applicableItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // 8. Check minimum purchase
    if (applicableSubtotal < voucher.minPurchase) {
      return {
        valid: false,
        discount: 0,
        message: `Minimum purchase of KSh ${voucher.minPurchase} required`,
      };
    }

    // 9. Calculate discount
    let discount = 0;
    
    switch (voucher.type) {
      case 'percentage':
        discount = (applicableSubtotal * voucher.value) / 100;
        if (voucher.maxDiscount) {
          discount = Math.min(discount, voucher.maxDiscount);
        }
        break;
      
      case 'fixed':
        discount = Math.min(voucher.value, applicableSubtotal);
        break;
      
      case 'free_shipping':
        discount = 200; // Shipping cost
        break;
    }

    return {
      valid: true,
      discount: Math.round(discount),
      message: `Voucher applied! You saved KSh ${Math.round(discount)}`,
      voucher,
    };
  }

  async incrementUsage(code: string) {
    await Voucher.findOneAndUpdate(
      { code: code.toUpperCase() },
      { $inc: { usageCount: 1 } }
    );
  }
}
```

**Auto-Apply Best Coupon:**
**File:** `lib/voucher.ts`

```typescript
export async function findBestVoucher(
  userId: string,
  cartItems: CartItem[]
): Promise<{ code: string; discount: number } | null> {
  const validator = new VoucherValidator();
  
  // Get all active vouchers user might be eligible for
  const now = new Date();
  const vouchers = await Voucher.find({
    active: true,
    startDate: { $lte: now },
    endDate: { $gte: now },
    $or: [
      { eligibleUsers: { $size: 0 } },
      { eligibleUsers: userId },
    ],
  });

  // Test each voucher
  const results = await Promise.all(
    vouchers.map(async (v) => {
      const result = await validator.validateAndApply(v.code, userId, cartItems);
      return { code: v.code, ...result };
    })
  );

  // Find voucher with highest discount
  const validVouchers = results.filter(r => r.valid);
  if (validVouchers.length === 0) return null;

  const best = validVouchers.reduce((prev, curr) =>
    curr.discount > prev.discount ? curr : prev
  );

  return { code: best.code, discount: best.discount };
}
```

**Checkout Integration:**
**File:** `app/checkout/page.tsx`

```tsx
// Add voucher input
const [voucherCode, setVoucherCode] = useState('');
const [appliedVoucher, setAppliedVoucher] = useState(null);
const [voucherDiscount, setVoucherDiscount] = useState(0);

const applyVoucher = async () => {
  const res = await axios.post('/api/vouchers/validate', {
    code: voucherCode,
    cartItems: items,
  });

  if (res.data.valid) {
    setAppliedVoucher(res.data.voucher);
    setVoucherDiscount(res.data.discount);
    toast.success(res.data.message);
  } else {
    toast.error(res.data.message);
  }
};

// Auto-apply best voucher on load
useEffect(() => {
  const autoapply = async () => {
    const best = await axios.post('/api/vouchers/auto-apply', {
      cartItems: items,
    });
    
    if (best.data.code) {
      setVoucherCode(best.data.code);
      setAppliedVoucher(best.data);
      setVoucherDiscount(best.data.discount);
      toast.success(`Best voucher auto-applied: ${best.data.code}`);
    }
  };
  
  autoapply();
}, [items]);
```

**Acceptance Criteria:**
- [ ] Voucher code validation API
- [ ] Auto-apply best voucher at checkout
- [ ] Category/seller restrictions work
- [ ] Usage limits enforced
- [ ] First-time user vouchers work
- [ ] Percentage vs fixed amount logic correct
- [ ] Max discount cap enforced
- [ ] Minimum purchase validation
- [ ] Voucher expiry checked
- [ ] Admin UI to create/manage vouchers

---

### 3.3 Strike-Through Pricing
**Priority:** MEDIUM  
**Effort:** 2 hours  

**Implementation:**
**File:** `components/ProductCard.tsx`

```tsx
// Show original price if compareAtPrice exists
{product.compareAtPrice && (
  <div className="flex items-center gap-2">
    <span className="text-gray-400 line-through text-sm">
      {formatPrice(product.compareAtPrice)}
    </span>
    <span className="text-red-600 font-bold text-lg">
      {formatPrice(product.price)}
    </span>
    <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded text-xs font-bold">
      SAVE {calculateDiscount(product.price, product.compareAtPrice)}%
    </span>
  </div>
)}
```

**Acceptance Criteria:**
- [ ] Strike-through shown only when compareAtPrice exists
- [ ] Discount percentage calculated correctly
- [ ] "SAVE X%" badge prominent
- [ ] Works on PLP and PDP

---

## 📦 PHASE 4: ORDER LIFECYCLE REALISM (Week 2 - Days 4-5)

### 4.1 Full Order State Machine
**Priority:** CRITICAL  
**Effort:** 8 hours  

**Order States:**
```typescript
type OrderStatus = 
  | 'pending-payment'     // Awaiting payment confirmation
  | 'confirmed'           // Payment received
  | 'processing'          // Being prepared
  | 'packed'              // Ready for pickup
  | 'shipped'             // In transit
  | 'out-for-delivery'    // With local courier
  | 'delivered'           // Successfully delivered
  | 'completed'           // Confirmed by customer
  | 'cancelled'           // Cancelled by user/admin
  | 'refunded';           // Refund processed
```

**State Transitions:**
**File:** `lib/orderStateMachine.ts` (new)

```typescript
const STATE_TRANSITIONS = {
  'pending-payment': ['confirmed', 'cancelled'],
  'confirmed': ['processing', 'cancelled'],
  'processing': ['packed', 'cancelled'],
  'packed': ['shipped', 'cancelled'],
  'shipped': ['out-for-delivery', 'delivered'],
  'out-for-delivery': ['delivered', 'shipped'], // Can go back if failed delivery
  'delivered': ['completed', 'refunded'],
  'completed': [],
  'cancelled': ['refunded'],
  'refunded': [],
};

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return STATE_TRANSITIONS[from]?.includes(to) || false;
}

export function getNextStates(current: OrderStatus): OrderStatus[] {
  return STATE_TRANSITIONS[current] || [];
}
```

**Update Order Model:**
**File:** `models/Order.ts`

```typescript
// Add to schema
statusHistory: [{
  status: {
    type: String,
    enum: ['pending-payment', 'confirmed', 'processing', 'packed', 'shipped', 'out-for-delivery', 'delivered', 'completed', 'cancelled', 'refunded'],
  },
  timestamp: { type: Date, default: Date.now },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  note: String,
}],

// Shipping tracking
trackingNumber: String,
carrier: String,
estimatedDelivery: Date,
actualDelivery: Date,

// Delivery proof
deliveryProof: {
  signedBy: String,
  photoUrl: String,
  timestamp: Date,
},

// Multi-seller support
sellers: [{
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  items: [/* subset of order items */],
  fulfillmentStatus: String,
  trackingNumber: String,
}],
```

**State Update API:**
**File:** `app/api/orders/[id]/status/route.ts` (new)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
import { canTransition } from '@/lib/orderStateMachine';
import { sendStatusUpdateEmail } from '@/lib/email';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { newStatus, note } = await req.json();

  await dbConnect();
  const order = await Order.findById(params.id);

  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  // Check if user is authorized (seller or admin)
  const isSeller = order.sellers?.some(s => s.sellerId.toString() === session.user.id);
  const isAdmin = session.user.role === 'admin';
  
  if (!isSeller && !isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Validate state transition
  if (!canTransition(order.status, newStatus)) {
    return NextResponse.json({
      error: `Cannot transition from ${order.status} to ${newStatus}`,
    }, { status: 400 });
  }

  // Update status
  order.status = newStatus;
  order.statusHistory.push({
    status: newStatus,
    timestamp: new Date(),
    updatedBy: session.user.id,
    note,
  });

  // Update specific fields based on status
  if (newStatus === 'delivered') {
    order.actualDelivery = new Date();
  }

  await order.save();

  // Send notification email
  await sendStatusUpdateEmail(order, newStatus);

  return NextResponse.json({
    success: true,
    order,
  });
}
```

**Acceptance Criteria:**
- [ ] All 10 states implemented
- [ ] Invalid transitions rejected
- [ ] Status history tracked
- [ ] Email sent on each status change
- [ ] Admin can override any transition
- [ ] Seller can only update their portion

---

### 4.2 Order Timeline UI
**Priority:** HIGH  
**Effort:** 6 hours  

**Component:**
**File:** `components/OrderTimeline.tsx` (new)

```tsx
'use client';

interface TimelineEvent {
  status: string;
  timestamp: Date;
  note?: string;
  updatedBy?: string;
}

export function OrderTimeline({ events }: { events: TimelineEvent[] }) {
  const statusConfig = {
    'confirmed': { icon: '✓', color: 'green', label: 'Order Confirmed' },
    'processing': { icon: '📦', color: 'blue', label: 'Processing' },
    'packed': { icon: '✅', color: 'blue', label: 'Packed' },
    'shipped': { icon: '🚚', color: 'blue', label: 'Shipped' },
    'out-for-delivery': { icon: '🏍️', color: 'blue', label: 'Out for Delivery' },
    'delivered': { icon: '🎉', color: 'green', label: 'Delivered' },
    'cancelled': { icon: '❌', color: 'red', label: 'Cancelled' },
  };

  return (
    <div className="relative">
      {events.map((event, index) => {
        const config = statusConfig[event.status];
        const isLast = index === events.length - 1;

        return (
          <div key={index} className="flex gap-4 pb-8 relative">
            {/* Timeline Line */}
            {!isLast && (
              <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-gray-200" />
            )}

            {/* Icon */}
            <div className={`
              w-12 h-12 rounded-full flex items-center justify-center
              bg-${config.color}-100 text-2xl z-10
            `}>
              {config.icon}
            </div>

            {/* Content */}
            <div className="flex-1">
              <div className="font-semibold text-lg">{config.label}</div>
              <div className="text-sm text-gray-600">
                {new Date(event.timestamp).toLocaleString('en-KE', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}
              </div>
              {event.note && (
                <div className="mt-1 text-sm text-gray-700 italic">
                  {event.note}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
```

**Integration:**
**File:** `app/orders/[id]/page.tsx`

```tsx
<OrderTimeline events={order.statusHistory} />
```

**Acceptance Criteria:**
- [ ] Vertical timeline with icons
- [ ] Timeline line connects events
- [ ] Timestamps formatted correctly
- [ ] Notes displayed if present
- [ ] Mobile responsive
- [ ] Icons match Jumia style

---

### 4.3 Delivery ETA Calculation
**Priority:** MEDIUM  
**Effort:** 4 hours  

**ETA Calculator:**
**File:** `lib/delivery.ts` (new)

```typescript
interface Location {
  county: string;
  city: string;
}

export function calculateDeliveryETA(
  from: Location,
  to: Location,
  shippingMethod: 'standard' | 'express'
): Date {
  const baseHours = shippingMethod === 'express' ? 24 : 48;
  
  // Add distance-based hours
  const distanceHours = calculateDistanceHours(from, to);
  
  // Add processing time
  const processingHours = 4;
  
  // Calculate delivery date (skip weekends)
  let totalHours = baseHours + distanceHours + processingHours;
  const eta = new Date();
  eta.setHours(eta.getHours() + totalHours);
  
  // Skip to next Monday if lands on weekend
  if (eta.getDay() === 0) eta.setDate(eta.getDate() + 1); // Sunday -> Monday
  if (eta.getDay() === 6) eta.setDate(eta.getDate() + 2); // Saturday -> Monday
  
  return eta;
}

function calculateDistanceHours(from: Location, to: Location): number {
  // Same county: 0 hours
  if (from.county === to.county) return 0;
  
  // Major cities: 12 hours
  const majorCities = ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru'];
  if (majorCities.includes(to.county)) return 12;
  
  // Remote areas: 24 hours
  const remoteCities = ['Turkana', 'Mandera', 'Wajir', 'Marsabit'];
  if (remoteCities.includes(to.county)) return 24;
  
  // Default: 18 hours
  return 18;
}
```

**Display ETA:**
```tsx
<div className="bg-blue-50 p-4 rounded-lg">
  <div className="flex items-center gap-2">
    <FiClock className="text-blue-600" />
    <div>
      <div className="font-semibold">Estimated Delivery</div>
      <div className="text-sm text-gray-600">
        {order.estimatedDelivery.toLocaleDateString('en-KE', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
        })}
      </div>
    </div>
  </div>
</div>
```

**Acceptance Criteria:**
- [ ] ETA calculated on order creation
- [ ] Updates when shipped
- [ ] Skips weekends
- [ ] Considers county distance
- [ ] Express vs standard differentiated

---

## 🔁 PHASE 5: RETURNS, REFUNDS & DISPUTES (Week 3 - Days 1-2)

### 5.1 Returns System
**Priority:** CRITICAL  
**Effort:** 10 hours  

**Database Schema:**
**File:** `models/Return.ts` (new)

```typescript
import mongoose from 'mongoose';

const ReturnSchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    quantity: Number,
    reason: {
      type: String,
      enum: [
        'defective',
        'wrong_item',
        'not_as_described',
        'size_issue',
        'no_longer_needed',
        'damaged_in_shipping',
        'quality_issue',
        'other',
      ],
    },
    condition: {
      type: String,
      enum: ['unopened', 'opened', 'used', 'damaged'],
    },
    description: String,
    images: [String],
  }],
  
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'received', 'refunded'],
    default: 'pending',
  },
  
  refundMethod: {
    type: String,
    enum: ['wallet', 'original_payment', 'bank_transfer'],
  },
  refundAmount: Number,
  
  // Logistics
  pickupScheduled: Date,
  pickupCompleted: Date,
  returnTracking: String,
  
  // Admin review
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewedAt: Date,
  rejectionReason: String,
  
  // Seller response
  sellerResponse: String,
  sellerResponseAt: Date,
  
}, { timestamps: true });

export default mongoose.models.Return || mongoose.model('Return', ReturnSchema);
```

**Return Eligibility Check:**
**File:** `lib/returns.ts` (new)

```typescript
export async function checkReturnEligibility(
  orderId: string
): Promise<{
  eligible: boolean;
  reason?: string;
  daysLeft?: number;
}> {
  const order = await Order.findById(orderId);
  
  if (!order) {
    return { eligible: false, reason: 'Order not found' };
  }

  // Must be delivered
  if (order.status !== 'delivered') {
    return { eligible: false, reason: 'Order not yet delivered' };
  }

  // Check return window (14 days default)
  const deliveredDate = order.actualDelivery || order.updatedAt;
  const daysSinceDelivery = Math.floor(
    (Date.now() - new Date(deliveredDate).getTime()) / (1000 * 60 * 60 * 24)
  );

  const returnWindowDays = 14; // Make this configurable per category
  
  if (daysSinceDelivery > returnWindowDays) {
    return {
      eligible: false,
      reason: `Return window expired (${returnWindowDays} days from delivery)`,
    };
  }

  // Check if already returned
  const existingReturn = await Return.findOne({ orderId });
  if (existingReturn) {
    return { eligible: false, reason: 'Return already initiated' };
  }

  return {
    eligible: true,
    daysLeft: returnWindowDays - daysSinceDelivery,
  };
}
```

**Return Request UI:**
**File:** `app/orders/[id]/return/page.tsx` (new)

```tsx
'use client';

export default function ReturnRequestPage({ params }: { params: { id: string } }) {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [returnReasons, setReturnReasons] = useState<Record<string, any>>({});
  const [images, setImages] = useState<Record<string, File[]>>({});

  const handleSubmitReturn = async () => {
    const formData = new FormData();
    formData.append('orderId', params.id);
    formData.append('items', JSON.stringify(
      selectedItems.map(itemId => ({
        productId: itemId,
        ...returnReasons[itemId],
      }))
    ));

    // Append images
    Object.entries(images).forEach(([itemId, files]) => {
      files.forEach(file => {
        formData.append(`images_${itemId}`, file);
      });
    });

    const res = await axios.post('/api/returns', formData);
    
    if (res.data.success) {
      toast.success('Return request submitted');
      router.push(`/returns/${res.data.returnId}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Request Return</h1>

      {/* Item Selection */}
      <div className="space-y-4">
        {order.items.map(item => (
          <div key={item.productId} className="border rounded-lg p-4">
            <div className="flex items-start gap-4">
              <input
                type="checkbox"
                checked={selectedItems.includes(item.productId)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedItems([...selectedItems, item.productId]);
                  } else {
                    setSelectedItems(selectedItems.filter(id => id !== item.productId));
                  }
                }}
              />
              
              <img src={item.image} className="w-20 h-20 object-cover" />
              
              <div className="flex-1">
                <h3 className="font-semibold">{item.title}</h3>
                <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                
                {selectedItems.includes(item.productId) && (
                  <div className="mt-4 space-y-3">
                    {/* Reason Dropdown */}
                    <select
                      onChange={(e) => setReturnReasons({
                        ...returnReasons,
                        [item.productId]: {
                          ...returnReasons[item.productId],
                          reason: e.target.value,
                        },
                      })}
                      className="w-full border rounded p-2"
                    >
                      <option value="">Select reason...</option>
                      <option value="defective">Defective/Damaged</option>
                      <option value="wrong_item">Wrong Item Sent</option>
                      <option value="not_as_described">Not as Described</option>
                      <option value="size_issue">Size/Fit Issue</option>
                      <option value="no_longer_needed">No Longer Needed</option>
                      <option value="quality_issue">Quality Issue</option>
                      <option value="other">Other</option>
                    </select>

                    {/* Condition */}
                    <select
                      onChange={(e) => setReturnReasons({
                        ...returnReasons,
                        [item.productId]: {
                          ...returnReasons[item.productId],
                          condition: e.target.value,
                        },
                      })}
                      className="w-full border rounded p-2"
                    >
                      <option value="">Item condition...</option>
                      <option value="unopened">Unopened/Unused</option>
                      <option value="opened">Opened but Unused</option>
                      <option value="used">Used</option>
                      <option value="damaged">Damaged</option>
                    </select>

                    {/* Description */}
                    <textarea
                      placeholder="Please describe the issue..."
                      onChange={(e) => setReturnReasons({
                        ...returnReasons,
                        [item.productId]: {
                          ...returnReasons[item.productId],
                          description: e.target.value,
                        },
                      })}
                      className="w-full border rounded p-2"
                      rows={3}
                    />

                    {/* Image Upload */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Upload Photos (Optional but recommended)
                      </label>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files) {
                            setImages({
                              ...images,
                              [item.productId]: Array.from(e.target.files),
                            });
                          }
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSubmitReturn}
        disabled={selectedItems.length === 0}
        className="mt-6 w-full bg-primary-600 text-white py-3 rounded-lg disabled:opacity-50"
      >
        Submit Return Request
      </button>
    </div>
  );
}
```

**Acceptance Criteria:**
- [ ] 14-day return window enforced
- [ ] Multi-item returns supported
- [ ] Reason codes required
- [ ] Image upload works
- [ ] Email confirmation sent
- [ ] Admin review workflow
- [ ] Seller notification

---

### 5.2 Refund Processing
**Priority:** HIGH  
**Effort:** 6 hours  

**Refund Methods:**
```typescript
enum RefundMethod {
  WALLET = 'wallet',           // Instant refund to user wallet
  ORIGINAL_PAYMENT = 'original_payment', // Refund to M-Pesa
  BANK_TRANSFER = 'bank_transfer',       // Manual bank transfer
}
```

**Refund API:**
**File:** `app/api/returns/[id]/refund/route.ts` (new)

```typescript
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { method, amount } = await req.json();

  await dbConnect();
  const returnRequest = await Return.findById(params.id).populate('orderId userId');

  if (!returnRequest) {
    return NextResponse.json({ error: 'Return not found' }, { status: 404 });
  }

  switch (method) {
    case 'wallet':
      // Instant wallet credit
      await Wallet.findOneAndUpdate(
        { userId: returnRequest.userId },
        { $inc: { balance: amount } },
        { upsert: true }
      );
      
      await WalletTransaction.create({
        userId: returnRequest.userId,
        type: 'credit',
        amount,
        description: `Refund for return #${returnRequest._id}`,
        reference: returnRequest._id,
      });
      break;

    case 'original_payment':
      // Initiate M-Pesa reversal (if applicable)
      // For now, credit to wallet as fallback
      break;

    case 'bank_transfer':
      // Mark for manual processing
      // Admin will handle offline
      break;
  }

  returnRequest.status = 'refunded';
  returnRequest.refundAmount = amount;
  returnRequest.refundMethod = method;
  await returnRequest.save();

  // Send refund confirmation email
  await sendRefundConfirmation(returnRequest);

  return NextResponse.json({ success: true });
}
```

**Acceptance Criteria:**
- [ ] Wallet refunds instant
- [ ] Partial refunds supported
- [ ] Refund amount calculated (deduct shipping if applicable)
- [ ] Email confirmation sent
- [ ] Transaction history updated

---

### 5.3 Dispute Resolution
**Priority:** MEDIUM  
**Effort:** 8 hours  

**Database Schema:**
**File:** `models/Dispute.ts` (new)

```typescript
const DisputeSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['order', 'return', 'refund', 'product_quality', 'delivery', 'other'],
  },
  relatedOrder: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  relatedReturn: { type: mongoose.Schema.Types.ObjectId, ref: 'Return' },
  
  // Parties
  buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  // Issue
  subject: String,
  description: String,
  evidence: [{
    type: { type: String, enum: ['image', 'document', 'message'] },
    url: String,
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    uploadedAt: { type: Date, default: Date.now },
  }],
  
  // Resolution
  status: {
    type: String,
    enum: ['open', 'under_review', 'awaiting_response', 'resolved', 'closed'],
    default: 'open',
  },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Admin
  resolution: String,
  resolvedAt: Date,
  
  // Communication
  messages: [{
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    message: String,
    timestamp: { type: Date, default: Date.now },
  }],
  
}, { timestamps: true });
```

**Dispute UI:**
**File:** `app/disputes/[id]/page.tsx` (new)

```tsx
export default function DisputePage({ params }: { params: { id: string } }) {
  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Dispute Header */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">Dispute #{dispute._id.slice(-6)}</h1>
            <p className="text-gray-600">{dispute.subject}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm ${statusColors[dispute.status]}`}>
            {dispute.status}
          </span>
        </div>
      </div>

      {/* Evidence Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="font-semibold mb-4">Evidence</h2>
        <div className="grid grid-cols-3 gap-4">
          {dispute.evidence.map((item, i) => (
            <img key={i} src={item.url} className="w-full h-32 object-cover rounded" />
          ))}
        </div>
      </div>

      {/* Conversation Thread */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="font-semibold mb-4">Conversation</h2>
        <div className="space-y-4">
          {dispute.messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.senderId === session.user.id ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-md p-3 rounded-lg ${
                msg.senderId === session.user.id ? 'bg-blue-500 text-white' : 'bg-gray-100'
              }`}>
                <p>{msg.message}</p>
                <span className="text-xs opacity-75">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Message Input */}
        <div className="mt-4 flex gap-2">
          <input
            type="text"
            placeholder="Type your message..."
            className="flex-1 border rounded-lg p-2"
          />
          <button className="bg-blue-500 text-white px-4 py-2 rounded-lg">
            Send
          </button>
        </div>
      </div>

      {/* Admin Resolution (if admin) */}
      {session?.user?.role === 'admin' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="font-semibold mb-4">Admin Resolution</h2>
          <textarea
            placeholder="Resolution details..."
            className="w-full border rounded p-2 mb-4"
            rows={4}
          />
          <div className="flex gap-2">
            <button className="bg-green-500 text-white px-6 py-2 rounded-lg">
              Resolve in Favor of Buyer
            </button>
            <button className="bg-blue-500 text-white px-6 py-2 rounded-lg">
              Resolve in Favor of Seller
            </button>
            <button className="bg-gray-500 text-white px-6 py-2 rounded-lg">
              Close Dispute
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
```

**Acceptance Criteria:**
- [ ] Buyer can open dispute
- [ ] Seller gets notification
- [ ] Both parties can upload evidence
- [ ] Admin can arbitrate
- [ ] Chat functionality works
- [ ] Email notifications on updates
- [ ] Resolution enforced (refund/replacement)

---

## 📊 PHASE 6: SELLER EXPERIENCE (Week 3 - Days 3-4)

### 6.1 Seller Analytics Dashboard
**Priority:** HIGH  
**Effort:** 10 hours  

**Analytics Data Model:**
**File:** `models/SellerAnalytics.ts` (new)

```typescript
const SellerAnalyticsSchema = new mongoose.Schema({
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true }, // Daily snapshot
  
  // Sales metrics
  revenue: { type: Number, default: 0 },
  orders: { type: Number, default: 0 },
  units: { type: Number, default: 0 },
  avgOrderValue: { type: Number, default: 0 },
  
  // Fulfillment metrics
  onTimeDeliveries: { type: Number, default: 0 },
  lateDeliveries: { type: Number, default: 0 },
  cancelledOrders: { type: Number, default: 0 },
  
  // Customer satisfaction
  positiveReviews: { type: Number, default: 0 },
  negativeReviews: { type: Number, default: 0 },
  avgRating: { type: Number, default: 0 },
  
  // Product performance
  topProducts: [{ productId: mongoose.Schema.Types.ObjectId, sales: Number }],
  
}, { timestamps: true });

// Index for fast date range queries
SellerAnalyticsSchema.index({ sellerId: 1, date: -1 });
```

**Analytics Calculation Job:**
**File:** `lib/jobs/calculateSellerAnalytics.ts` (new)

```typescript
export async function calculateDailySellerAnalytics(date: Date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  // Get all sellers
  const sellers = await User.find({ role: 'seller' });

  for (const seller of sellers) {
    // Get orders for this seller on this date
    const orders = await Order.find({
      'sellers.sellerId': seller._id,
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    });

    const analytics = {
      sellerId: seller._id,
      date: startOfDay,
      revenue: orders.reduce((sum, o) => sum + o.total, 0),
      orders: orders.length,
      units: orders.reduce((sum, o) => sum + o.items.length, 0),
      avgOrderValue: orders.length > 0 
        ? orders.reduce((sum, o) => sum + o.total, 0) / orders.length 
        : 0,
      onTimeDeliveries: orders.filter(o => 
        o.actualDelivery && o.actualDelivery <= o.estimatedDelivery
      ).length,
      lateDeliveries: orders.filter(o => 
        o.actualDelivery && o.actualDelivery > o.estimatedDelivery
      ).length,
      cancelledOrders: orders.filter(o => o.status === 'cancelled').length,
    };

    await SellerAnalytics.findOneAndUpdate(
      { sellerId: seller._id, date: startOfDay },
      analytics,
      { upsert: true }
    );
  }
}
```

**Dashboard UI:**
**File:** `app/seller/dashboard/page.tsx`

```tsx
export default function SellerDashboardPage() {
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [analytics, setAnalytics] = useState(null);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Seller Dashboard</h1>

      {/* Period Selector */}
      <div className="flex gap-2 mb-6">
        <button onClick={() => setPeriod('daily')}>Daily</button>
        <button onClick={() => setPeriod('weekly')}>Weekly</button>
        <button onClick={() => setPeriod('monthly')}>Monthly</button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <KPICard
          title="Revenue"
          value={`KSh ${formatPrice(analytics?.revenue || 0)}`}
          change="+12.5%"
          icon={FiDollarSign}
        />
        <KPICard
          title="Orders"
          value={analytics?.orders || 0}
          change="+8.3%"
          icon={FiPackage}
        />
        <KPICard
          title="Avg Order Value"
          value={`KSh ${formatPrice(analytics?.avgOrderValue || 0)}`}
          change="+5.1%"
          icon={FiTrendingUp}
        />
        <KPICard
          title="Performance Score"
          value={`${analytics?.performanceScore || 0}%`}
          change="-2.1%"
          icon={FiStar}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold mb-4">Sales Trend</h3>
          {/* Line chart component */}
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold mb-4">Top Products</h3>
          {/* Bar chart component */}
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h3 className="font-semibold mb-4">Fulfillment Performance</h3>
        <div className="grid grid-cols-3 gap-6">
          <Metric
            label="On-Time Delivery Rate"
            value={`${analytics?.onTimeRate || 0}%`}
            target="95%"
            status={analytics?.onTimeRate >= 95 ? 'good' : 'warning'}
          />
          <Metric
            label="Cancellation Rate"
            value={`${analytics?.cancellationRate || 0}%`}
            target="<2%"
            status={analytics?.cancellationRate < 2 ? 'good' : 'warning'}
          />
          <Metric
            label="Customer Rating"
            value={analytics?.avgRating || 0}
            target="4.5+"
            status={analytics?.avgRating >= 4.5 ? 'good' : 'warning'}
          />
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-semibold mb-4">Recent Orders</h3>
        {/* Orders table */}
      </div>
    </div>
  );
}
```

**Acceptance Criteria:**
- [ ] Daily/weekly/monthly views
- [ ] Revenue and order trends
- [ ] Performance score calculation
- [ ] SLA timer warnings
- [ ] Top products ranking
- [ ] Exportable reports
- [ ] Real-time updates

---

### 6.2 Performance Score System
**Priority:** MEDIUM  
**Effort:** 6 hours  

**Score Calculation:**
```typescript
// File: lib/sellerPerformance.ts

export function calculatePerformanceScore(seller: any, analytics: any): number {
  const weights = {
    onTimeDelivery: 0.3,
    cancellationRate: 0.2,
    customerRating: 0.25,
    responseTime: 0.15,
    productQuality: 0.1,
  };

  const scores = {
    onTimeDelivery: Math.min(analytics.onTimeRate / 95 * 100, 100),
    cancellationRate: Math.max((1 - analytics.cancellationRate / 2) * 100, 0),
    customerRating: (analytics.avgRating / 5) * 100,
    responseTime: calculateResponseScore(seller.avgResponseTime),
    productQuality: (analytics.positiveReviews / (analytics.positiveReviews + analytics.negativeReviews)) * 100,
  };

  const weightedScore = Object.entries(weights).reduce((total, [key, weight]) => {
    return total + (scores[key] * weight);
  }, 0);

  return Math.round(weightedScore);
}

function calculateResponseScore(avgMinutes: number): number {
  // < 1 hour = 100, 1-6 hours = 80, 6-24 hours = 60, > 24 hours = 40
  if (avgMinutes < 60) return 100;
  if (avgMinutes < 360) return 80;
  if (avgMinutes < 1440) return 60;
  return 40;
}
```

**Penalties for Late Shipping:**
```typescript
// File: models/Seller.ts

sellerMetrics: {
  performanceScore: { type: Number, default: 100 },
  lateShipmentPenalties: { type: Number, default: 0 },
  autoSuspendThreshold: { type: Number, default: 50 }, // Score below 50 = suspended
},
```

**Automated Actions:**
```typescript
// File: lib/jobs/enforceSellerPenalties.ts

export async function checkAndEnforcePenalties() {
  const sellers = await User.find({ role: 'seller' });

  for (const seller of sellers) {
    const score = await calculatePerformanceScore(seller);

    if (score < 70) {
      // Warning email
      await sendPerformanceWarning(seller, score);
    }

    if (score < 50) {
      // Auto-suspend
      seller.status = 'suspended';
      await seller.save();
      await sendSuspensionNotice(seller, score);
    }
  }
}
```

**Acceptance Criteria:**
- [ ] Score updates daily
- [ ] Weighted scoring algorithm
- [ ] Penalties for late shipments
- [ ] Warning emails at score < 70
- [ ] Auto-suspension at score < 50
- [ ] Appeal process for suspended sellers

---

## 🛡️ PHASE 7: FRAUD & ABUSE PREVENTION (Week 3 - Day 5)

### 7.1 Return Abuse Detection
**Priority:** HIGH  
**Effort:** 6 hours  

**Detection Rules:**
```typescript
// File: lib/fraud/returnAbuse.ts

export async function detectReturnAbuse(userId: string): Promise<{
  flagged: boolean;
  reasons: string[];
  riskScore: number;
}> {
  const flags: string[] = [];
  let riskScore = 0;

  // Rule 1: Excessive return rate
  const last90DaysOrders = await Order.countDocuments({
    userId,
    createdAt: { $gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) },
  });

  const last90DaysReturns = await Return.countDocuments({
    userId,
    createdAt: { $gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) },
  });

  const returnRate = last90DaysOrders > 0 ? (last90DaysReturns / last90DaysOrders) * 100 : 0;

  if (returnRate > 50) {
    flags.push(`High return rate: ${returnRate}%`);
    riskScore += 30;
  }

  // Rule 2: Wardrobing pattern (returns after 7+ days, "used" condition)
  const wardrobingReturns = await Return.countDocuments({
    userId,
    'items.condition': 'used',
    createdAt: {
      $gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
    },
  });

  if (wardrobingReturns > 3) {
    flags.push('Wardrobing pattern detected');
    riskScore += 25;
  }

  // Rule 3: Same product returned multiple times
  const products = await Return.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    { $unwind: '$items' },
    { $group: { _id: '$items.productId', count: { $sum: 1 } } },
    { $match: { count: { $gt: 2 } } },
  ]);

  if (products.length > 0) {
    flags.push('Same products returned repeatedly');
    riskScore += 20;
  }

  // Rule 4: Returns expensive items frequently
  const expensiveReturns = await Return.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    { $lookup: { from: 'orders', localField: 'orderId', foreignField: '_id', as: 'order' } },
    { $match: { 'order.total': { $gt: 10000 } } },
    { $count: 'total' },
  ]);

  if (expensiveReturns[0]?.total > 3) {
    flags.push('Frequently returns high-value items');
    riskScore += 15;
  }

  return {
    flagged: riskScore >= 50,
    reasons: flags,
    riskScore,
  };
}
```

**Auto-Actions:**
```typescript
// Require photo proof for flagged users
if (abuseDetection.flagged) {
  return NextResponse.json({
    error: 'Photo evidence required for return',
    requirePhotos: true,
  }, { status: 400 });
}

// Limit return window for high-risk users
if (abuseDetection.riskScore > 70) {
  returnWindowDays = 7; // Reduce from 14 to 7 days
}
```

**Acceptance Criteria:**
- [ ] Return rate tracking
- [ ] Wardrobing detection
- [ ] Repeat offender flagging
- [ ] Auto-require photos for flagged users
- [ ] Admin review dashboard
- [ ] Account suspension for confirmed abuse

---

### 7.2 Voucher Farming Prevention
**Priority:** MEDIUM  
**Effort:** 4 hours  

**Detection:**
```typescript
// File: lib/fraud/voucherAbuse.ts

export async function detectVoucherFarming(userId: string, ip: string): Promise<boolean> {
  // Check for multiple accounts from same IP
  const usersFromIP = await User.find({ lastLoginIP: ip }).countDocuments();
  
  if (usersFromIP > 3) {
    // Possible account farming
    return true;
  }

  // Check for rapid account creation + voucher usage pattern
  const user = await User.findById(userId);
  const accountAge = Date.now() - new Date(user.createdAt).getTime();
  
  if (accountAge < 24 * 60 * 60 * 1000) { // Less than 24 hours old
    const voucherUsage = await Order.countDocuments({
      userId,
      'voucher.code': { $exists: true },
    });

    if (voucherUsage > 0) {
      // New account immediately using vouchers = suspicious
      return true;
    }
  }

  return false;
}
```

**Mitigation:**
```typescript
// Require phone verification for first-time vouchers
if (!user.phoneVerified && hasVoucher) {
  return NextResponse.json({
    error: 'Phone verification required to use vouchers',
  }, { status: 400 });
}

// Rate limit voucher usage per IP
// Max 3 voucher uses per IP per day
```

**Acceptance Criteria:**
- [ ] IP-based duplicate detection
- [ ] Phone verification requirement
- [ ] Rate limiting per IP
- [ ] Admin flagging dashboard

---

### 7.3 Idempotent Payments
**Priority:** CRITICAL  
**Effort:** 4 hours  

**Implementation:**
```typescript
// File: app/api/orders/stk-push/route.ts

// Add idempotency key to prevent duplicate orders
const idempotencyKey = `${session.user.id}-${JSON.stringify(orderData.items)}-${amount}`;
const hashedKey = crypto.createHash('sha256').update(idempotencyKey).digest('hex');

// Check if order with this key exists (created in last 10 minutes)
const existingOrder = await Order.findOne({
  idempotencyKey: hashedKey,
  createdAt: { $gte: new Date(Date.now() - 10 * 60 * 1000) },
});

if (existingOrder) {
  return NextResponse.json({
    success: true,
    message: 'Order already exists',
    transactionId: existingOrder._id,
    orderId: existingOrder._id,
  });
}

// Create order with idempotency key
const order = await Order.create({
  ...orderData,
  idempotencyKey: hashedKey,
});
```

**Acceptance Criteria:**
- [ ] Duplicate payment prevention
- [ ] Idempotency window = 10 minutes
- [ ] Race condition safe
- [ ] Returns existing order on duplicate

---

## ⚡ PHASE 8: PERFORMANCE & SCALE (Week 4 - Days 1-2)

### 8.1 Redis Caching
**Priority:** HIGH  
**Effort:** 8 hours  

**Setup:**
```bash
npm install ioredis
```

**Redis Client:**
**File:** `lib/redis.ts` (new)

```typescript
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

export class CacheService {
  private static instance: CacheService;
  private client: Redis;

  private constructor() {
    this.client = redis;
  }

  static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  async get<T>(key: string): Promise<T | null> {
    const data = await this.client.get(key);
    return data ? JSON.parse(data) : null;
  }

  async set(key: string, value: any, ttlSeconds: number = 300): Promise<void> {
    await this.client.setex(key, ttlSeconds, JSON.stringify(value));
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async flush(pattern: string): Promise<void> {
    const keys = await this.client.keys(pattern);
    if (keys.length > 0) {
      await this.client.del(...keys);
    }
  }
}

export default CacheService.getInstance();
```

**Cache Implementation:**
```typescript
// File: app/api/products/route.ts

import cache from '@/lib/redis';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const cacheKey = `products:${searchParams.toString()}`;

  // Try cache first
  const cached = await cache.get(cacheKey);
  if (cached) {
    return NextResponse.json(cached);
  }

  // Fetch from DB
  await dbConnect();
  const products = await Product.find(query).lean();

  const response = {
    success: true,
    products,
    pagination,
  };

  // Cache for 5 minutes
  await cache.set(cacheKey, response, 300);

  return NextResponse.json(response);
}
```

**Cache Invalidation:**
```typescript
// When product updated, invalidate related caches
await cache.flush('products:*');
await cache.flush('flash-sales:*');
```

**Acceptance Criteria:**
- [ ] Redis integration
- [ ] Home page cached
- [ ] PLP cached (5 min TTL)
- [ ] Flash sales cached
- [ ] Cache invalidation on product update
- [ ] API response < 100ms for cached

---

### 8.2 Database Indexing
**Priority:** HIGH  
**Effort:** 3 hours  

**Indexes to Add:**
```typescript
// File: models/Product.ts

ProductSchema.index({ active: 1, createdAt: -1 });
ProductSchema.index({ category: 1, active: 1 });
ProductSchema.index({ 'rating.average': -1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ stock: 1 });
ProductSchema.index({ seller: 1 });
ProductSchema.index({ featured: 1 });

// Text search index
ProductSchema.index({
  title: 'text',
  description: 'text',
  tags: 'text',
}, {
  weights: {
    title: 10,
    tags: 5,
    description: 1,
  },
});
```

**File:** `models/Order.ts`
```typescript
OrderSchema.index({ userId: 1, createdAt: -1 });
OrderSchema.index({ orderNumber: 1 }, { unique: true });
OrderSchema.index({ status: 1 });
OrderSchema.index({ 'sellers.sellerId': 1 });
```

**Compound Indexes:**
```typescript
ProductSchema.index({ category: 1, price: 1 }); // Category + price range queries
ProductSchema.index({ active: 1, featured: 1, createdAt: -1 }); // Featured products
```

**Acceptance Criteria:**
- [ ] All indexes created
- [ ] Query performance improved (< 100ms)
- [ ] Explain plan shows index usage
- [ ] No collection scans on common queries

---

### 8.3 Image Optimization & CDN
**Priority:** MEDIUM  
**Effort:** 4 hours  

**Next.js Image Optimization:**
```tsx
// Already using Next/Image, but optimize further

<Image
  src={product.images[0]}
  alt={product.title}
  fill
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
  quality={75} // Reduce from default 85
  loading="lazy"
  placeholder="blur"
  blurDataURL={getBlurDataURL(product.images[0])}
/>
```

**Generate Blur Placeholders:**
```typescript
// File: lib/imageOptimization.ts

export function getBlurDataURL(imageUrl: string): string {
  // Generate base64 blur placeholder
  // Use plaiceholder library or create manually
  return `data:image/svg+xml;base64,${btoa(`
    <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="400" fill="#f0f0f0"/>
    </svg>
  `)}`;
}
```

**CDN Configuration:**
```javascript
// next.config.js

module.exports = {
  images: {
    domains: ['m.media-amazon.com', 'your-cdn.com'],
    loader: 'cloudinary', // Or imgix, cloudflare
    path: 'https://your-cdn.com/',
  },
};
```

**Acceptance Criteria:**
- [ ] All images use Next/Image
- [ ] Blur placeholders generated
- [ ] Images served from CDN
- [ ] Lazy loading implemented
- [ ] LCP < 2.5s

---

## 📈 PHASE 9: ANALYTICS & TELEMETRY (Week 4 - Days 3-4)

### 9.1 User Funnel Tracking
**Priority:** HIGH  
**Effort:** 8 hours  

**Events to Track:**
```typescript
enum TrackingEvent {
  // Product Discovery
  SEARCH_PERFORMED = 'search_performed',
  PRODUCT_VIEWED = 'product_viewed',
  PRODUCT_CLICKED = 'product_clicked',
  
  // Cart Events
  ADD_TO_CART = 'add_to_cart',
  REMOVE_FROM_CART = 'remove_from_cart',
  CART_VIEWED = 'cart_viewed',
  
  // Checkout Events
  CHECKOUT_STARTED = 'checkout_started',
  PAYMENT_METHOD_SELECTED = 'payment_method_selected',
  ORDER_PLACED = 'order_placed',
  
  // Campaign Events
  VOUCHER_APPLIED = 'voucher_applied',
  FLASH_SALE_VIEWED = 'flash_sale_viewed',
}
```

**Analytics Service:**
**File:** `lib/analytics.ts` (new)

```typescript
interface EventData {
  userId?: string;
  sessionId: string;
  event: string;
  properties: Record<string, any>;
  timestamp: Date;
}

class AnalyticsService {
  async track(event: string, properties: Record<string, any> = {}) {
    const sessionId = this.getSessionId();
    const userId = this.getUserId();

    const eventData: EventData = {
      userId,
      sessionId,
      event,
      properties,
      timestamp: new Date(),
    };

    // Send to backend
    await fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData),
    });

    // Also send to Google Analytics / Mixpanel if configured
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', event, properties);
    }
  }

  private getSessionId(): string {
    if (typeof window === 'undefined') return '';
    let sessionId = sessionStorage.getItem('analytics_session');
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      sessionStorage.setItem('analytics_session', sessionId);
    }
    return sessionId;
  }

  private getUserId(): string | undefined {
    // Get from auth session
    return undefined;
  }
}

export const analytics = new AnalyticsService();
```

**Database Schema:**
**File:** `models/AnalyticsEvent.ts` (new)

```typescript
const AnalyticsEventSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  sessionId: { type: String, required: true, index: true },
  event: { type: String, required: true, index: true },
  properties: mongoose.Schema.Types.Mixed,
  timestamp: { type: Date, default: Date.now, index: true },
  
  // Geo data
  country: String,
  city: String,
  
  // Device data
  device: String,
  browser: String,
  os: String,
}, { timestamps: true });

// TTL index - auto-delete after 90 days
AnalyticsEventSchema.index({ timestamp: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });
```

**Usage in Components:**
```tsx
// In ProductCard
import { analytics } from '@/lib/analytics';

const handleClick = () => {
  analytics.track('product_clicked', {
    productId: product._id,
    productName: product.title,
    price: product.price,
    category: product.category,
  });
};

// In checkout
analytics.track('checkout_started', {
  cartTotal: total,
  itemCount: items.length,
  paymentMethod: formData.paymentMethod,
});
```

**Acceptance Criteria:**
- [ ] All funnel events tracked
- [ ] Session tracking works
- [ ] Analytics dashboard
- [ ] Conversion funnel visualization
- [ ] Drop-off point identification

---

### 9.2 Funnel Analysis Dashboard
**Priority:** MEDIUM  
**Effort:** 6 hours  

**Funnel Calculation:**
```typescript
// File: lib/analytics/funnel.ts

export async function calculateFunnel(startDate: Date, endDate: Date) {
  const stages = [
    'search_performed',
    'product_clicked',
    'product_viewed',
    'add_to_cart',
    'checkout_started',
    'order_placed',
  ];

  const results = await Promise.all(
    stages.map(async (stage) => {
      const count = await AnalyticsEvent.countDocuments({
        event: stage,
        timestamp: { $gte: startDate, $lte: endDate },
      });

      const uniqueUsers = await AnalyticsEvent.distinct('userId', {
        event: stage,
        timestamp: { $gte: startDate, $lte: endDate },
      });

      return {
        stage,
        totalEvents: count,
        uniqueUsers: uniqueUsers.length,
      };
    })
  );

  // Calculate drop-off rates
  const withDropoff = results.map((stage, index) => {
    const previous = results[index - 1];
    const dropoff = previous 
      ? ((previous.uniqueUsers - stage.uniqueUsers) / previous.uniqueUsers) * 100
      : 0;

    return {
      ...stage,
      dropoffRate: dropoff,
      conversionRate: (stage.uniqueUsers / results[0].uniqueUsers) * 100,
    };
  });

  return withDropoff;
}
```

**Dashboard UI:**
```tsx
// app/admin/analytics/page.tsx

<div className="bg-white rounded-lg shadow p-6">
  <h2 className="text-xl font-bold mb-6">Conversion Funnel</h2>
  
  <div className="space-y-4">
    {funnelData.map((stage, index) => (
      <div key={stage.stage} className="relative">
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium">{formatStageName(stage.stage)}</span>
          <span className="text-gray-600">{stage.uniqueUsers} users</span>
        </div>
        
        {/* Funnel Bar */}
        <div className="h-12 bg-gray-100 rounded overflow-hidden">
          <div
            className="h-full bg-blue-500 flex items-center justify-end px-4 text-white font-semibold"
            style={{ width: `${stage.conversionRate}%` }}
          >
            {stage.conversionRate.toFixed(1)}%
          </div>
        </div>
        
        {/* Drop-off indicator */}
        {stage.dropoffRate > 0 && (
          <div className="mt-1 text-sm text-red-600">
            ↓ {stage.dropoffRate.toFixed(1)}% drop-off
          </div>
        )}
      </div>
    ))}
  </div>
</div>
```

**Acceptance Criteria:**
- [ ] Funnel visualization
- [ ] Drop-off rates calculated
- [ ] Date range selector
- [ ] Exportable reports
- [ ] Actionable insights highlighted

---

## ✅ PHASE 10: TESTING & DOCUMENTATION (Week 4 - Day 5)

### 10.1 Unit Testing
**Priority:** HIGH  
**Effort:** 8 hours  

**Setup:**
```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom
```

**Test Coverage Requirements:**
- Utils/helpers: 90%+
- API routes: 80%+
- Components: 70%+

**Example Tests:**
```typescript
// __tests__/lib/voucher.test.ts

import { VoucherValidator } from '@/lib/voucher';

describe('VoucherValidator', () => {
  it('validates percentage voucher correctly', async () => {
    const result = await validator.validateAndApply('SAVE10', userId, cartItems);
    
    expect(result.valid).toBe(true);
    expect(result.discount).toBe(1000); // 10% of 10000
  });

  it('rejects expired vouchers', async () => {
    const result = await validator.validateAndApply('EXPIRED', userId, cartItems);
    
    expect(result.valid).toBe(false);
    expect(result.message).toContain('expired');
  });
});
```

**Acceptance Criteria:**
- [ ] All utils have tests
- [ ] Critical API routes tested
- [ ] Edge cases covered
- [ ] CI/CD integration

---

### 10.2 Integration Testing
**Priority:** MEDIUM  
**Effort:** 6 hours  

**E2E Test Scenarios:**
```typescript
// __tests__/e2e/checkout.test.ts

describe('Complete Checkout Flow', () => {
  it('completes order with voucher and STK push', async () => {
    // 1. Add products to cart
    await addToCart(product1);
    await addToCart(product2);
    
    // 2. Go to checkout
    await navigateToCheckout();
    
    // 3. Apply voucher
    await applyVoucher('SAVE20');
    expect(getOrderTotal()).toBe(8000); // 10000 - 20%
    
    // 4. Fill shipping info
    await fillShippingForm(mockAddress);
    
    // 5. Select STK push
    await selectPaymentMethod('stk-push');
    
    // 6. Submit order
    await submitOrder();
    
    // 7. Verify order created
    expect(getCurrentUrl()).toContain('/orders/');
    expect(getOrderStatus()).toBe('pending-payment');
  });
});
```

**Acceptance Criteria:**
- [ ] Happy path tested
- [ ] Error scenarios tested
- [ ] Payment flow tested
- [ ] Tests run in CI

---

### 10.3 Documentation
**Priority:** LOW  
**Effort:** 4 hours  

**API Documentation:**
- Swagger/OpenAPI spec (already started)
- Endpoint examples
- Authentication guide
- Error codes

**Developer Docs:**
- Architecture overview
- Database schema diagrams
- State machine diagrams
- Deployment guide

**User Guides:**
- Seller onboarding
- Return process
- Voucher usage
- FAQ

**Acceptance Criteria:**
- [ ] API docs complete
- [ ] README updated
- [ ] Deployment guide written
- [ ] Seller manual created

---

## 📋 IMPLEMENTATION CHECKLIST

### Week 1: UI/UX & Discovery
- [ ] Day 1-2: Skeleton loaders integration
- [ ] Day 3: Micro-interactions & optimistic UI
- [ ] Day 4: Fuzzy search implementation
- [ ] Day 5: Multi-select filters

### Week 2: Pricing & Orders
- [ ] Day 1: Flash sale countdown timers
- [ ] Day 2-3: Voucher system
- [ ] Day 4: Order state machine
- [ ] Day 5: Order timeline UI

### Week 3: Returns & Sellers
- [ ] Day 1-2: Returns & refunds system
- [ ] Day 3: Dispute resolution
- [ ] Day 4: Seller analytics dashboard
- [ ] Day 5: Fraud prevention

### Week 4: Performance & Launch
- [ ] Day 1-2: Redis caching & optimization
- [ ] Day 3: Analytics & telemetry
- [ ] Day 4: Testing
- [ ] Day 5: Documentation & launch prep

---

## 🚀 ROLLOUT STRATEGY

### Phase 1: Internal Testing (Days 1-7)
- Deploy to staging
- Test all features
- Fix critical bugs
- Performance tuning

### Phase 2: Beta Launch (Days 8-14)
- Limited seller onboarding (10-20)
- Invite-only buyers (100)
- Monitor analytics
- Gather feedback

### Phase 3: Public Launch (Day 15+)
- Full seller onboarding
- Marketing campaign
- Customer support team ready
- Scale infrastructure

---

## 📊 SUCCESS METRICS

### Technical KPIs
- API response time < 300ms (95th percentile)
- Page load time < 2s
- Search results < 500ms
- Zero critical bugs in production

### Business KPIs
- Seller onboarding: 50+ in month 1
- GMV: KSh 1M+ in month 1
- Conversion rate: > 2%
- Return rate: < 10%
- Customer satisfaction: > 4.5/5

### Operational KPIs
- On-time delivery: > 95%
- Payment success rate: > 98%
- Support response time: < 2 hours
- Uptime: > 99.9%

---

## 🔧 INFRASTRUCTURE REQUIREMENTS

### Current Stack
- Next.js 14 (App Router)
- MongoDB
- NextAuth.js
- Vercel hosting
- Resend (email)

### Additional Requirements
- **Redis:** For caching (Upstash recommended)
- **CDN:** Cloudflare or Cloudinary for images
- **File Storage:** AWS S3 for uploads
- **Job Queue:** Bull/BullMQ for background jobs
- **Monitoring:** Sentry for error tracking
- **Analytics:** Mixpanel or PostHog

### Estimated Monthly Costs
- Hosting (Vercel Pro): $20
- Database (MongoDB Atlas): $57
- Redis (Upstash): $10
- CDN (Cloudflare): $20
- Email (Resend): $20
- Storage (S3): $10
- **Total:** ~$137/month

---

## 🎓 LEARNING & REFERENCES

### Jumia Analysis
- Study Jumia Kenya website/app
- Document UX flows
- Screenshot key interactions
- Note micro-animations

### Technical Resources
- Next.js docs: https://nextjs.org/docs
- MongoDB best practices
- Redis caching patterns
- Stripe/M-Pesa integration guides

### Compliance
- Kenya Data Protection Act
- Consumer Protection Act
- Payment regulations

---

## ✨ CONCLUSION

This spec provides a complete roadmap to 99% Jumia parity. The implementation is broken into:

1. **Manageable phases** (4 weeks)
2. **Clear acceptance criteria** for each feature
3. **Realistic effort estimates**
4. **Prioritized by impact**

**Next Steps:**
1. Review and approve this spec
2. Set up project tracking (Jira/Linear)
3. Assign tasks to developers
4. Begin Week 1 implementation
5. Daily standups to track progress

**Questions/Concerns:**
- Resource availability (how many developers?)
- Budget constraints
- Must-have vs nice-to-have features
- Launch deadline flexibility

---

**Document Status:** READY FOR REVIEW  
**Last Updated:** February 1, 2026  
**Prepared By:** AI Development Team
