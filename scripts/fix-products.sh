#!/bin/bash

# Comprehensive Product Fetching Fix Script

echo "🔧 Jumia Product Fetching Diagnostic & Fix"
echo "==========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${RED}❌ .env file not found!${NC}"
    echo "Please create .env file with MONGODB_URI"
    exit 1
fi

# Check if server is running
echo "1️⃣  Checking server status..."
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Server is running${NC}"
else
    echo -e "${RED}❌ Server not running!${NC}"
    echo ""
    echo "Start the server first:"
    echo "   npm run dev"
    echo ""
    exit 1
fi
echo ""

# Test API endpoint
echo "2️⃣  Testing Products API..."
API_RESPONSE=$(curl -s -w "\n%{http_code}" http://localhost:3000/api/products)
HTTP_CODE=$(echo "$API_RESPONSE" | tail -n 1)
BODY=$(echo "$API_RESPONSE" | head -n -1)

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ API responding (HTTP $HTTP_CODE)${NC}"
    
    # Parse product count
    PRODUCT_COUNT=$(echo "$BODY" | jq -r '.products | length' 2>/dev/null)
    TOTAL_COUNT=$(echo "$BODY" | jq -r '.pagination.total' 2>/dev/null)
    
    if [ "$PRODUCT_COUNT" != "null" ] && [ "$PRODUCT_COUNT" -gt 0 ]; then
        echo -e "${GREEN}✅ Found $PRODUCT_COUNT products on page 1${NC}"
        echo -e "${GREEN}✅ Total products in DB: $TOTAL_COUNT${NC}"
    else
        echo -e "${YELLOW}⚠️  No products returned from API${NC}"
        TOTAL_COUNT=0
    fi
else
    echo -e "${RED}❌ API error (HTTP $HTTP_CODE)${NC}"
    echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
    TOTAL_COUNT=0
fi
echo ""

# If no products, seed them
if [ "$TOTAL_COUNT" -eq 0 ] || [ "$TOTAL_COUNT" = "null" ]; then
    echo "3️⃣  Database appears empty. Seeding products..."
    
    # Get secret from .env
    NEXTAUTH_SECRET=$(grep "^NEXTAUTH_SECRET=" .env 2>/dev/null | cut -d '=' -f2- | tr -d '"' | tr -d "'" | xargs)
    
    if [ -z "$NEXTAUTH_SECRET" ]; then
        echo -e "${RED}❌ NEXTAUTH_SECRET not found in .env${NC}"
        echo ""
        echo "Please add to .env file:"
        echo "  NEXTAUTH_SECRET=\$(openssl rand -base64 32)"
        echo ""
        exit 1
    fi
    
    echo "Using secret: ${NEXTAUTH_SECRET:0:10}..." # Show first 10 chars only
    
    # Seed 100 products
    SEED_RESPONSE=$(curl -s -X POST http://localhost:3000/api/admin/migrate-products \
        -H "Content-Type: application/json" \
        -d "{\"count\": 100, \"secret\": \"$NEXTAUTH_SECRET\"}")
    
    SUCCESS=$(echo "$SEED_RESPONSE" | jq -r '.success' 2>/dev/null)
    
    if [ "$SUCCESS" = "true" ]; then
        SEEDED=$(echo "$SEED_RESPONSE" | jq -r '.productsAdded' 2>/dev/null)
        echo -e "${GREEN}✅ Successfully seeded $SEEDED products!${NC}"
    else
        echo -e "${RED}❌ Seeding failed${NC}"
        echo "$SEED_RESPONSE" | jq '.' 2>/dev/null || echo "$SEED_RESPONSE"
        exit 1
    fi
else
    echo "3️⃣  Database has products, skipping seeding"
fi
echo ""

# Test specific product endpoints
echo "4️⃣  Testing various API queries..."

# Test categories
CATEGORIES=$(curl -s http://localhost:3000/api/products/categories | jq -r '.categories | length' 2>/dev/null)
if [ "$CATEGORIES" -gt 0 ]; then
    echo -e "${GREEN}✅ Categories: $CATEGORIES${NC}"
else
    echo -e "${YELLOW}⚠️  No categories found${NC}"
fi

# Test search
SEARCH_RESULT=$(curl -s "http://localhost:3000/api/products?search=laptop" | jq -r '.products | length' 2>/dev/null)
if [ "$SEARCH_RESULT" -ge 0 ]; then
    echo -e "${GREEN}✅ Search working: $SEARCH_RESULT results for 'laptop'${NC}"
fi

# Test featured products
FEATURED=$(curl -s "http://localhost:3000/api/products?featured=true" | jq -r '.products | length' 2>/dev/null)
if [ "$FEATURED" -ge 0 ]; then
    echo -e "${GREEN}✅ Featured products: $FEATURED${NC}"
fi

# Test sorting
SORTED=$(curl -s "http://localhost:3000/api/products?sort=rating" | jq -r '.products | length' 2>/dev/null)
if [ "$SORTED" -ge 0 ]; then
    echo -e "${GREEN}✅ Sorting working: $SORTED products by rating${NC}"
fi
echo ""

# Final verification
echo "5️⃣  Final Verification..."
FINAL_CHECK=$(curl -s http://localhost:3000/api/products | jq -r '.pagination.total' 2>/dev/null)
if [ "$FINAL_CHECK" -gt 0 ]; then
    echo -e "${GREEN}✅✅✅ PRODUCT FETCHING IS WORKING!${NC}"
    echo -e "${GREEN}Total products: $FINAL_CHECK${NC}"
    echo ""
    echo "You can now:"
    echo "  • Visit http://localhost:3000/products"
    echo "  • Browse categories"
    echo "  • Search for products"
    echo "  • Place orders"
else
    echo -e "${RED}❌ Product fetching still not working${NC}"
    echo "Please check:"
    echo "  • MongoDB connection (MONGODB_URI in .env)"
    echo "  • Server logs for errors"
    echo "  • Browser console for client-side errors"
fi
echo ""
echo "==========================================="
echo "🎉 Done!"
echo ""
