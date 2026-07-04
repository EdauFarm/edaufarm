#!/bin/bash

# Test Lipia API Integration
# Replace with your actual test phone number

API_KEY="4a12f93e1e1c571f52a58a1235cb52e15903b86e"
TEST_PHONE="0712345678"  # Replace with your actual Safaricom number
TEST_AMOUNT="10"

echo "============================================"
echo "Testing Lipia Online STK Push API"
echo "============================================"
echo ""

echo "1. Testing Lipia API directly..."
echo "Endpoint: https://lipia-api.kreativelabske.com/api/v2/payments/stk-push"
echo "Phone: $TEST_PHONE"
echo "Amount: KSh $TEST_AMOUNT"
echo ""

RESPONSE=$(curl -s -X POST https://lipia-api.kreativelabske.com/api/v2/payments/stk-push \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"phone_number\": \"$TEST_PHONE\",
    \"amount\": $TEST_AMOUNT,
    \"external_reference\": \"TEST_$(date +%s)\",
    \"metadata\": {
      \"test\": \"direct_api_test\",
      \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"
    }
  }")

echo "Response:"
echo "$RESPONSE" | jq '.' || echo "$RESPONSE"
echo ""

# Extract transaction reference if successful
TRANSACTION_REF=$(echo "$RESPONSE" | jq -r '.data.TransactionReference' 2>/dev/null)

if [ "$TRANSACTION_REF" != "null" ] && [ -n "$TRANSACTION_REF" ]; then
  echo "✅ STK Push initiated successfully!"
  echo "Transaction Reference: $TRANSACTION_REF"
  echo ""
  echo "2. Checking payment status..."
  sleep 5
  
  STATUS_RESPONSE=$(curl -s -X GET "https://lipia-api.kreativelabske.com/api/v2/payments/status?reference=$TRANSACTION_REF" \
    -H "Authorization: Bearer $API_KEY")
  
  echo "Status Response:"
  echo "$STATUS_RESPONSE" | jq '.' || echo "$STATUS_RESPONSE"
else
  echo "❌ STK Push failed!"
  echo "Error: $(echo "$RESPONSE" | jq -r '.customerMessage' 2>/dev/null || echo 'Unknown error')"
fi

echo ""
echo "============================================"
echo "Test completed"
echo "============================================"
