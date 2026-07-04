# Lipia Online Payment API - STK Push Integration Guide

## API Overview

**Base URL:** `https://lipia-api.kreativelabske.com/api/v2`

**Authentication:** Bearer token via API key
```
Authorization: Bearer YOUR_API_KEY
```

### Getting API Key
1. Visit [lipia-online.vercel.app/dashboard](https://lipia-online.vercel.app/dashboard)
2. Sign up and create an account
3. Create a new app in dashboard
4. Generate API key from security section

---

## API Response Structure

### Success Response
```json
{
  "success": true,
  "status": "success",
  "message": "Operation completed successfully",
  "customerMessage": "User-friendly message",
  "data": { /* Response data */ },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Error Response
```json
{
  "success": false,
  "status": "error",
  "message": "Technical error message",
  "customerMessage": "User-friendly error message",
  "error": {
    "code": "ERROR_CODE",
    /* debugging details */
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## 1. Initiate STK Push

**Endpoint:** `POST /payments/stk-push`

**Headers:**
```
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json
```

### Request Body
```json
{
  "phone_number": "0712345678",
  "amount": 100,
  "external_reference": "order_123",
  "callback_url": "https://your-domain.com/callback",
  "metadata": {
    "order_id": "12345",
    "customer_name": "John Doe"
  }
}
```

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `phone_number` | String | ✅ | Kenyan phone number (0712345678, 0112345678, 254712345678) |
| `amount` | Number | ✅ | Payment amount in KES (minimum 1) |
| `external_reference` | String/Number | ❌ | Your tracking reference ID |
| `callback_url` | String | ❌ | Webhook URL for payment status updates |
| `metadata` | Object | ❌ | Additional key-value data to store |

### Phone Number Formats
- ✅ Valid: `2547...`, `2541...`, `+2547...`, `+2541...`, `07...`, `01...`
- ❌ Invalid: Non-Safaricom numbers

### Success Response
```json
{
  "success": true,
  "status": "success",
  "message": "STK push initiated successfully",
  "customerMessage": "STK push initiated successfully",
  "data": {
    "TransactionReference": "64f1a2b3c4d5e6f7g8h9i0j1",
    "ResponseCode": 0,
    "ResponseDescription": "Success. Request accepted for processing"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Key Response Fields:**
- `TransactionReference`: Unique ID for tracking payment status
- `ResponseCode`: 0 = success
- `ResponseDescription`: Human-readable status

### Error Response Example
```json
{
  "success": false,
  "status": "error",
  "message": "Validation failed",
  "customerMessage": "Please check your input and try again",
  "error": {
    "code": "VALIDATION_ERROR",
    "field": "phone_number",
    "location": "body",
    "value": "0712345678",
    "expected": "valid safaricom kenyan number"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Implementation Example (Node.js)
```javascript
const initiatePayment = async (paymentData) => {
  try {
    const response = await fetch('https://lipia-api.kreativelabske.com/api/v2/payments/stk-push', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.LIPIA_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(paymentData)
    });
 
    const result = await response.json();
    
    if (result.success) {
      console.log('Payment initiated:', result.data.TransactionReference);
      return result.data;
    } else {
      console.error('Payment failed:', result.message);
      throw new Error(result.customerMessage);
    }
  } catch (error) {
    console.error('Error initiating payment:', error);
    throw error;
  }
};

// Usage
const paymentData = {
  phone_number: '254712345678',
  amount: 100,
  external_reference: 'order_123',
  callback_url: 'https://your-domain.com/callback',
  metadata: {
    order_id: '12345',
    customer_name: 'John Doe'
  }
};

initiatePayment(paymentData);
```

---

## 2. Check Transaction Status

**Endpoint:** `GET /payments/status?reference=TRANSACTION_REFERENCE`

**Headers:**
```
Authorization: Bearer YOUR_API_KEY
```

### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `reference` | String | ✅ | Transaction reference from STK push |

### Payment States

#### PENDING
```json
{
  "success": true,
  "message": "Payment status: Payment is still being processed",
  "customerMessage": "Payment is still being processed",
  "data": {
    "response": {
      "Amount": 100,
      "Status": "PENDING",
      "MpesaReceiptNumber": "",
      "ResultCode": 0,
      "ResultDesc": "Payment is still being processed"
    },
    "status": false
  }
}
```

#### SUCCESS
```json
{
  "success": true,
  "message": "Payment status: Payment completed successfully",
  "customerMessage": "Payment completed successfully",
  "data": {
    "response": {
      "Amount": 100,
      "Status": "SUCCESS",
      "MpesaReceiptNumber": "NEF61H8J60",
      "ResultCode": 0,
      "ResultDesc": "Payment completed successfully"
    },
    "status": true
  }
}
```

#### FAILED
```json
{
  "success": true,
  "message": "Payment status: Payment failed",
  "customerMessage": "Payment failed",
  "data": {
    "response": {
      "Amount": 100,
      "Status": "FAILED",
      "MpesaReceiptNumber": "",
      "ResultCode": 1,
      "ResultDesc": "The initiator information is invalid"
    },
    "status": false
  }
}
```

### Response Fields
| Field | Type | Description |
|-------|------|-------------|
| `Amount` | Number | Payment amount in KES |
| `ExternalReference` | String | Your tracking reference |
| `MerchantRequestID` | String | Internal merchant request ID |
| `MpesaReceiptNumber` | String | Receipt number (empty if pending/failed) |
| `Phone` | String | Customer's phone number |
| `ResultCode` | Number | 0 = success, >0 = error |
| `ResultDesc` | String | Human-readable result |
| `Metadata` | Object | Additional stored data |
| `Status` | String | PENDING, SUCCESS, or FAILED |
| `TransactionDate` | String | ISO timestamp |
| `status` | Boolean | true = successful, false = failed/pending |

### Implementation Example
```javascript
const checkPaymentStatus = async (transactionReference) => {
  try {
    const response = await fetch(
      `https://lipia-api.kreativelabske.com/api/v2/payments/status?reference=${transactionReference}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.LIPIA_API_KEY}`
        }
      }
    );
 
    const result = await response.json();
    
    if (result.success) {
      const paymentData = result.data.response;
      console.log('Payment Status:', paymentData.Status);
      console.log('Amount:', paymentData.Amount);
      console.log('Receipt Number:', paymentData.MpesaReceiptNumber);
      return paymentData;
    } else {
      throw new Error(result.customerMessage);
    }
  } catch (error) {
    console.error('Error checking payment status:', error);
    throw error;
  }
};
```

---

## 3. Webhook Callbacks

### How Callbacks Work
1. **Initiate Payment** - Include `callback_url` in STK push request
2. **Payment Processing** - Customer enters PIN on their phone
3. **Status Change** - Payment status changes (success/failed)
4. **Webhook Notification** - Lipia sends POST request to your callback URL
5. **Acknowledgment** - Your endpoint responds with HTTP 200 and "ok"

### Callback URL Requirements
- ✅ Publicly accessible (not localhost)
- ✅ HTTPS enabled (for security)
- ✅ Respond within 30 seconds
- ✅ Handle POST requests

### Callback Payload Structure

#### Successful Payment
```json
{
  "response": {
    "Amount": 100,
    "ExternalReference": "order_123",
    "MerchantRequestID": "12345-67890-12345-67890",
    "CheckoutRequestID": "12345-67890-12345-67890",
    "MpesaReceiptNumber": "NEF61H8J60",
    "Phone": "254712345678",
    "ResultCode": 0,
    "ResultDesc": "Success. Request accepted for processing",
    "Metadata": {
      "order_id": "12345",
      "customer_name": "John Doe"
    },
    "Status": "Success"
  },
  "status": true
}
```

#### Failed Payment
```json
{
  "response": {
    "Amount": 100,
    "ExternalReference": "order_123",
    "MerchantRequestID": "12345-67890-12345-67890",
    "CheckoutRequestID": "value",
    "MpesaReceiptNumber": "",
    "Phone": "254712345678",
    "ResultCode": 1,
    "ResultDesc": "The initiator information is invalid",
    "Metadata": {
      "order_id": "12345",
      "customer_name": "John Doe"
    },
    "Status": "Failed"
  },
  "status": false
}
```

### Required Response from Your Callback
```
HTTP/1.1 200 OK
Content-Type: text/plain

ok
```

### Callback Implementation Example (Next.js API Route)
```javascript
// app/api/payments/callback/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    
    const { response, status } = payload;
    
    if (status) {
      // Payment successful
      console.log('Payment successful:', response.MpesaReceiptNumber);
      
      // Update order status in database
      await updateOrderPaymentStatus(
        response.ExternalReference,
        'paid',
        response.MpesaReceiptNumber
      );
    } else {
      // Payment failed
      console.log('Payment failed:', response.ResultDesc);
      
      // Update order status to failed
      await updateOrderPaymentStatus(
        response.ExternalReference,
        'failed',
        null
      );
    }
    
    // Must return "ok" for acknowledgment
    return new NextResponse('ok', { status: 200 });
    
  } catch (error) {
    console.error('Callback error:', error);
    return new NextResponse('ok', { status: 200 }); // Still acknowledge
  }
}
```

---

## Best Practices

### 1. Error Handling
```javascript
try {
  const result = await initiatePayment(paymentData);
  // Handle success
} catch (error) {
  if (error.code === 'VALIDATION_ERROR') {
    // Show user-friendly validation message
  } else if (error.code === 'PAYMENT_ERROR') {
    // Handle payment-specific errors
  } else {
    // Handle other errors
  }
}
```

### 2. Security
- Store API key in environment variables
- Use HTTPS for all callback URLs
- Validate callback payloads
- Implement rate limiting

### 3. User Experience
- Show loading state during STK push
- Display clear error messages
- Allow payment status checking
- Implement timeout handling (max 2 minutes)

### 4. Transaction Tracking
- Store `TransactionReference` in database
- Log all payment attempts
- Use `external_reference` for order matching
- Store `metadata` for additional context

---

## Integration Checklist

- [ ] Sign up and get API key from Lipia dashboard
- [ ] Store API key securely in environment variables
- [ ] Implement STK push initiation endpoint
- [ ] Create callback URL endpoint (HTTPS)
- [ ] Test phone number validation
- [ ] Implement payment status checking
- [ ] Handle success/failure states
- [ ] Add error handling and logging
- [ ] Test with real M-Pesa account
- [ ] Implement order completion logic in callback
- [ ] Add timeout handling for pending payments

---

## Summary

**Flow:**
1. User initiates payment → Call `POST /payments/stk-push`
2. Get `TransactionReference` from response
3. Customer enters PIN on phone
4. Your callback URL receives webhook with status
5. Update order/payment status in database
6. Return "ok" to acknowledge callback
7. (Optional) Poll `GET /payments/status` for status updates

**Key Points:**
- Minimum amount: 1 KES
- Only Safaricom numbers supported
- Callback URL must be HTTPS and publicly accessible
- Must respond with "ok" to webhook callbacks
- Transaction reference is unique identifier for tracking
- Use `external_reference` to link payments to your orders
