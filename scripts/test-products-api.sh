#!/bin/bash
# Jumia API - Products Endpoint Testing

BASE_URL="http://localhost:3000"
# For production: BASE_URL="https://your-domain.com"

echo "🛍️  JUMIA PRODUCTS API - CURL EXAMPLES"
echo "========================================"
echo ""

# 1. Basic fetch
echo "1️⃣  Fetching all products..."
curl -s "${BASE_URL}/api/products" | head -50
echo ""
echo ""

# 2. With pagination
echo "2️⃣  Fetching page 1 with 5 products..."
curl -s "${BASE_URL}/api/products?page=1&limit=5"
echo ""
echo ""

# 3. Search products
echo "3️⃣  Searching for 'phone'..."
curl -s "${BASE_URL}/api/products?search=phone"
echo ""
echo ""

# 4. Filter by category
echo "4️⃣  Filtering by category 'electronics'..."
curl -s "${BASE_URL}/api/products?category=electronics"
echo ""
echo ""

# 5. Price range filter
echo "5️⃣  Products between $100-$500..."
curl -s "${BASE_URL}/api/products?minPrice=100&maxPrice=500"
echo ""
echo ""

# 6. Featured products
echo "6️⃣  Featured products only..."
curl -s "${BASE_URL}/api/products?featured=true"
echo ""
echo ""

# 7. Sorted by price (low to high)
echo "7️⃣  Sorted by price (ascending)..."
curl -s "${BASE_URL}/api/products?sort=price-low"
echo ""
echo ""

# 8. Combined filters
echo "8️⃣  Combined: category + price range + search..."
curl -s "${BASE_URL}/api/products?category=phones&minPrice=200&maxPrice=1000&search=samsung"
echo ""
echo ""

echo "✅ Done! Check API_ENDPOINTS.md for full documentation."
