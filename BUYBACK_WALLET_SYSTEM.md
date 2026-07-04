# Buyback & Wallet System Documentation

## Overview
Complete buyback system with M-Pesa integrated wallet allowing users to request buybacks on delivered products, get approval from sellers and admin, and receive payments directly to their wallet.

## Features Implemented

### 1. Wallet System (`/models/Wallet.ts`)
- **Balance Tracking**: Users maintain a wallet balance in KSh
- **M-Pesa Binding**: Users can bind and verify their M-Pesa phone numbers
- **Transaction History**: Complete audit trail of all wallet transactions
- **Transaction Types**:
  - `deposit`: M-Pesa to wallet
  - `withdrawal`: Wallet to M-Pesa
  - `buyback_credit`: Buyback approval payment
  - `refund`: Order refunds

### 2. Buyback Request System (`/models/Buyback.ts`)
- **Product Buyback**: Users can request to sell back delivered products
- **Multi-Level Approval**:
  1. Seller approval/rejection
  2. Admin final approval/rejection
  3. Automatic wallet credit on completion
- **Product Condition Rating**: Excellent, Good, Fair, Poor
- **Reason Tracking**: Users must provide buyback reason
- **Image Support**: Optional product condition photos

### 3. API Endpoints

#### Wallet Management
- `GET /api/wallet` - Get wallet balance and transactions
- `POST /api/wallet` - Bind M-Pesa number
- `POST /api/wallet/deposit` - Deposit from M-Pesa (STK Push)
- `POST /api/wallet/withdraw` - Withdraw to M-Pesa

#### Buyback Management
- `GET /api/buyback` - Get user's buyback requests
- `POST /api/buyback` - Create new buyback request
- `PATCH /api/buyback/[id]` - Approve/reject buyback (seller/admin)

### 4. User Interface

#### Dashboard (`/dashboard`)
Three main tabs:
1. **My Orders** - View all orders with buyback buttons
2. **Wallet** - Manage balance, deposit, withdraw
3. **Buyback Requests** - Track buyback status

#### Order Detail (`/orders/[id]`)
- **Request Buyback** button on eligible products
- Eligibility: Order must be delivered and at least 7 days old
- Modal form with:
  - Product condition selector
  - Requested amount input
  - Reason textarea
  - How it works guide

#### Wallet Section (`/components/WalletSection.tsx`)
- **Balance Card**: Current wallet balance with gradient design
- **M-Pesa Binding**: Bind/verify phone number
- **Deposit Modal**: M-Pesa STK push integration
- **Withdrawal Modal**: Send to bound M-Pesa number
- **Transaction History**: Last 20 transactions with status

#### Admin Panel (`/admin/buybacks`)
- View all buyback requests
- Filter by status (Pending Admin, Awaiting Seller, All)
- Approve/reject with comments
- Final amount adjustment
- Automatic wallet crediting

### 5. Email Notifications

#### Buyback Emails (`/lib/email-templates/BuybackEmail.tsx`)
Automated emails for:
- Request submitted
- Seller approved/rejected
- Admin approved/rejected
- Wallet credited (completed)

#### Wallet Transaction Emails (`/lib/email-templates/WalletTransactionEmail.tsx`)
Automated emails for:
- Deposit successful
- Withdrawal processed
- Buyback credit received

### 6. Approval Workflow

```
User Requests Buyback
    ↓
Seller Reviews (24-48 hours)
    ↓ (Approved)
Admin Reviews
    ↓ (Approved)
Wallet Credited
    ↓
User Withdraws to M-Pesa
```

**Status Flow**:
1. `pending` - Awaiting seller review
2. `seller_approved` - Seller approved, awaiting admin
3. `seller_rejected` - Seller rejected
4. `admin_approved` - Admin approved, wallet credited
5. `admin_rejected` - Admin rejected
6. `completed` - Wallet credited successfully
7. `cancelled` - User cancelled

### 7. Business Rules

#### Buyback Eligibility
- Order status must be `delivered`
- Order must be at least 7 days old
- Product must be from the order
- No duplicate buyback for same product

#### Amount Validation
- Requested amount must be > 0
- Typical range: 30-70% of original price
- Seller can adjust approved amount
- Admin can adjust final amount

#### Wallet Limits
- Minimum deposit: KSh 50
- Minimum withdrawal: KSh 100
- No maximum limits (configurable)

#### M-Pesa Integration
- Phone format: 254XXXXXXXXX
- STK Push for deposits (simulated)
- B2C for withdrawals (simulated)
- Processing time: 5-10 minutes
- Reference codes tracked

### 8. Security Features
- **Authentication**: All endpoints require active session
- **Authorization**: 
  - Users can only see their own buybacks
  - Sellers can only approve their products
  - Admins have full access
- **Validation**:
  - Order ownership verification
  - Product in order verification
  - Balance sufficiency checks
  - Amount range validation

### 9. Database Schema

#### Wallet Collection
```javascript
{
  userId: ObjectId (unique),
  balance: Number,
  mpesaNumber: String,
  mpesaVerified: Boolean,
  transactions: [{
    type: String,
    amount: Number,
    mpesaReference: String,
    status: String,
    description: String,
    createdAt: Date,
    completedAt: Date
  }],
  createdAt: Date,
  updatedAt: Date
}
```

#### Buyback Collection
```javascript
{
  orderId: ObjectId,
  userId: ObjectId,
  productId: ObjectId,
  sellerId: ObjectId,
  requestedAmount: Number,
  approvedAmount: Number,
  reason: String,
  condition: String,
  images: [String],
  status: String,
  sellerResponse: {
    approvedBy: ObjectId,
    approvedAt: Date,
    comments: String
  },
  adminResponse: {
    approvedBy: ObjectId,
    approvedAt: Date,
    comments: String
  },
  creditedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### 10. M-Pesa Integration (Current Status)

**Simulated (Development)**:
- STK Push: 3-second delay simulation
- B2C Withdrawal: 5-second delay simulation
- Auto-success for testing
- Reference codes generated

**Production Requirements** (To Implement):
```javascript
// Deposit - M-Pesa STK Push API
const stkPushResponse = await mpesa.stkPush({
  phoneNumber: '254XXXXXXXXX',
  amount: 1000,
  accountReference: 'Gadget World Wallet',
  transactionDesc: 'Wallet Deposit'
});

// Withdrawal - M-Pesa B2C API
const b2cResponse = await mpesa.b2c({
  phoneNumber: '254XXXXXXXXX',
  amount: 500,
  remarks: 'Wallet Withdrawal',
  occasion: 'Withdrawal'
});
```

### 11. Testing Guide

#### Test Buyback Flow:
1. Place an order and mark as delivered (admin panel)
2. Update order createdAt to 8+ days ago (MongoDB)
3. Go to order detail, click "Request Buyback"
4. Fill form and submit
5. Check email for confirmation
6. Approve as seller (if product has seller)
7. Approve as admin at `/admin/buybacks`
8. Check wallet balance in dashboard

#### Test Wallet:
1. Go to dashboard → Wallet tab
2. Bind M-Pesa number (format: 254XXXXXXXXX)
3. Deposit money (simulated STK push)
4. Check balance after 3 seconds
5. Withdraw to M-Pesa (minimum KSh 100)
6. Check transaction history

### 12. Future Enhancements

1. **Real M-Pesa Integration**
   - Safaricom Daraja API
   - Callback URL handling
   - Transaction verification

2. **Product Return Logistics**
   - Shipping label generation
   - Return tracking
   - Quality inspection workflow

3. **Advanced Features**
   - Wallet PIN for security
   - Transaction limits per day
   - Buyback price suggestions based on condition
   - Bulk buyback requests
   - Analytics dashboard

4. **Seller Features**
   - Buyback settings per product
   - Auto-approval rules
   - Buyback statistics

5. **Notifications**
   - SMS notifications
   - Push notifications
   - In-app notification center

## Files Modified/Created

### Models
- ✅ `/models/Wallet.ts` - Wallet schema
- ✅ `/models/Buyback.ts` - Buyback schema

### API Routes
- ✅ `/app/api/wallet/route.ts` - Wallet management
- ✅ `/app/api/wallet/deposit/route.ts` - Deposits
- ✅ `/app/api/wallet/withdraw/route.ts` - Withdrawals
- ✅ `/app/api/buyback/route.ts` - Buyback requests
- ✅ `/app/api/buyback/[id]/route.ts` - Buyback actions

### Components
- ✅ `/components/WalletSection.tsx` - Wallet UI
- ✅ `/lib/email-templates/BuybackEmail.tsx` - Buyback emails
- ✅ `/lib/email-templates/WalletTransactionEmail.tsx` - Wallet emails

### Pages
- ✅ `/app/dashboard/page.tsx` - Updated with wallet & buyback tabs
- ✅ `/app/orders/[id]/page.tsx` - Added buyback button
- ✅ `/app/admin/buybacks/page.tsx` - Admin buyback management

## Support
For issues or questions, contact: support@jumia.co.ke
