#!/bin/bash

# Quick Product Seeding Script for Jumia

echo "🌱 Seeding Jumia Products Database..."
echo "======================================"
echo ""

# Check if server is running
if ! curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "❌ Server not running!"
    echo ""
    echo "Please start the server first:"
    echo "   npm run dev"
    echo ""
    exit 1
fi

# Get NEXTAUTH_SECRET from .env
if [ -f .env ]; then
    NEXTAUTH_SECRET=$(grep NEXTAUTH_SECRET .env | cut -d '=' -f2)
else
    echo "❌ .env file not found!"
    exit 1
fi

# Seed 100 products
echo "📦 Seeding 100 products..."
echo ""

RESPONSE=$(curl -s -X POST http://localhost:3000/api/admin/migrate-products \
    -H "Content-Type: application/json" \
    -d "{\"count\": 100, \"secret\": \"$NEXTAUTH_SECRET\"}")

echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
echo ""

# Verify
echo "✅ Verifying products..."
VERIFY=$(curl -s http://localhost:3000/api/admin/migrate-products)
COUNT=$(echo "$VERIFY" | jq -r '.totalProducts' 2>/dev/null)

echo "Total products in database: $COUNT"
echo ""
echo "======================================"
echo "✅ Done! Products are ready."
echo ""
echo "Test the API:"
echo "   curl http://localhost:3000/api/products | jq '.'"
echo ""
echo "View in browser:"
echo "   http://localhost:3000/products"
echo ""
