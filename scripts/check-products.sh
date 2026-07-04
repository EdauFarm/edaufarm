#!/bin/bash

# Check MongoDB Products and Seed Data Script

echo "🔍 Checking MongoDB Product Status..."
echo "======================================"
echo ""

# Start dev server in background if not running
if ! curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "⚠️  Server not running. Please start it first with:"
    echo "   npm run dev"
    echo ""
    exit 1
fi

echo "1️⃣  Checking current product count..."
RESPONSE=$(curl -s http://localhost:3000/api/admin/migrate-products)
echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
echo ""

PRODUCT_COUNT=$(echo "$RESPONSE" | jq -r '.totalProducts' 2>/dev/null)

if [ "$PRODUCT_COUNT" = "0" ] || [ "$PRODUCT_COUNT" = "null" ] || [ -z "$PRODUCT_COUNT" ]; then
    echo "❌ No products found in database!"
    echo ""
    echo "2️⃣  Seeding database with sample products..."
    echo ""
    
    # Read the NEXTAUTH_SECRET from .env file
    if [ -f .env ]; then
        NEXT_AUTH_SECRET=$(grep NEXTAUTH_SECRET .env | cut -d '=' -f2)
    else
        echo "❌ .env file not found!"
        exit 1
    fi
    
    # Seed products
    SEED_RESPONSE=$(curl -s -X POST http://localhost:3000/api/admin/migrate-products \
        -H "Content-Type: application/json" \
        -d "{\"count\": 50, \"secret\": \"$NEXT_AUTH_SECRET\"}")
    
    echo "$SEED_RESPONSE" | jq '.' 2>/dev/null || echo "$SEED_RESPONSE"
    echo ""
    
    # Check again
    echo "3️⃣  Verifying seeded products..."
    VERIFY=$(curl -s http://localhost:3000/api/admin/migrate-products)
    NEW_COUNT=$(echo "$VERIFY" | jq -r '.totalProducts' 2>/dev/null)
    echo "✅ Total products now: $NEW_COUNT"
    echo ""
    
    # Show sample products
    echo "📦 Sample products:"
    echo "$VERIFY" | jq -r '.sampleProducts[] | "- \(.title) ($\(.price))"' 2>/dev/null | head -5
    
else
    echo "✅ Found $PRODUCT_COUNT products in database"
    echo ""
    echo "📦 Sample products:"
    echo "$RESPONSE" | jq -r '.sampleProducts[] | "- \(.title) ($\(.price))"' 2>/dev/null | head -10
fi

echo ""
echo "======================================"
echo "🎯 Test the products API:"
echo "   curl http://localhost:3000/api/products | jq '.'"
echo ""
echo "🌐 View in browser:"
echo "   http://localhost:3000/products"
echo ""
