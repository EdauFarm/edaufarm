# Email Verification & Authentication System - Implementation Guide

## Overview
This document provides a complete guide to the OTP-based email verification system and password reset functionality implemented in your Gadget World e-commerce platform.

## 🎯 Features Implemented

### 1. Email Verification System
- ✅ 6-digit OTP verification for new user signups
- ✅ 10-minute OTP expiry time
- ✅ Secure OTP storage with `select: false` in database
- ✅ Resend OTP functionality
- ✅ Beautiful email templates using React Email
- ✅ Automatic redirect flow (signup → verify → signin)

### 2. Password Reset System
- ✅ Forgot password with email-based OTP
- ✅ Separate OTP fields for verification vs password reset
- ✅ Secure password update after OTP verification
- ✅ Two-step reset process (verify OTP → set new password)

### 3. Marketing Email Templates
- ✅ Flash Sale emails with product grid and countdown
- ✅ Abandoned Cart recovery emails
- ✅ Order confirmation emails
- ✅ Responsive HTML design for all email clients

---

## 📁 Files Created/Modified

### New Files
1. `/lib/email.ts` - Email sending utilities
2. `/lib/email-templates/OTPEmail.tsx` - OTP verification template
3. `/lib/email-templates/OrderConfirmation.tsx` - Order confirmation template
4. `/lib/email-templates/FlashSaleEmail.tsx` - Marketing templates
5. `/app/api/email/send-otp/route.ts` - OTP generation and sending
6. `/app/api/email/verify-otp/route.ts` - OTP verification
7. `/app/api/auth/reset-password/route.ts` - Password reset
8. `/app/auth/verify-email/page.tsx` - Email verification page
9. `/app/auth/forgot-password/page.tsx` - Forgot password page
10. `/app/auth/reset-password/page.tsx` - Reset password page (updated)

### Modified Files
1. `/models/User.ts` - Added OTP fields
2. `/app/api/auth/register/route.ts` - Added OTP generation on signup
3. `/app/auth/signup/page.tsx` - Redirect to verification after signup
4. `/lib/mongodb.ts` - Exported `connectDB` function

---

## 🔧 Configuration Required

### 1. Environment Variables
Add to `.env.local`:

```env
# Resend API Key (REQUIRED for email sending)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxx

# App URL (for email links)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# MongoDB URI (already configured)
MONGODB_URI=your_mongodb_connection_string

# NextAuth (already configured)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret_key
```

### 2. Get Resend API Key
1. Go to [resend.com](https://resend.com)
2. Sign up for a free account
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key and add to `.env.local`

### 3. Database Migration
Since the User model schema was updated, you need to migrate existing users:

**Option A: Via MongoDB Atlas**
1. Open MongoDB Atlas
2. Go to your database
3. Select the `users` collection
4. Run this update query:
```javascript
db.users.updateMany(
  { isVerified: { $exists: false } },
  { $set: { isVerified: false } }
)
```

**Option B: Migration Script**
Create `/scripts/migrate-users.ts`:
```typescript
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

async function migrateUsers() {
  await dbConnect();
  
  const result = await User.updateMany(
    { isVerified: { $exists: false } },
    { $set: { isVerified: false } }
  );
  
  console.log(`Migrated ${result.modifiedCount} users`);
  process.exit(0);
}

migrateUsers();
```

Run with: `npx ts-node scripts/migrate-users.ts`

---

## 🔄 User Flow Diagrams

### Signup Flow
```
User fills signup form
    ↓
POST /api/auth/register
    ↓
Generate 6-digit OTP (valid 10 minutes)
    ↓
Save user with isVerified: false
    ↓
Send OTP email via Resend
    ↓
Redirect to /auth/verify-email?email=...
    ↓
User enters 6-digit code
    ↓
POST /api/email/verify-otp
    ↓
Verify OTP and set isVerified: true
    ↓
Redirect to /auth/signin?verified=true
```

### Password Reset Flow
```
User clicks "Forgot Password"
    ↓
Enter email on /auth/forgot-password
    ↓
POST /api/email/send-otp (purpose: password-reset)
    ↓
Generate OTP and send email
    ↓
Redirect to /auth/reset-password?email=...
    ↓
User enters 6-digit OTP
    ↓
POST /api/email/verify-otp (purpose: password-reset)
    ↓
OTP verified, show new password form
    ↓
User enters new password
    ↓
POST /api/auth/reset-password
    ↓
Update password in database
    ↓
Redirect to /auth/signin?reset=success
```

---

## 📧 Email Templates

### OTP Verification Email
**Subject:** Verify Your Email - Gadget World  
**From:** noreply@jumia.com  
**Features:**
- Orange gradient header
- Large 6-digit OTP display
- 10-minute expiry notice
- Security warning
- Responsive design

### Password Reset Email
**Subject:** Reset Your Password - Gadget World  
**From:** noreply@jumia.com  
**Features:**
- Similar design to verification email
- Clear reset instructions
- Security tips

### Order Confirmation Email
**Subject:** Order Confirmation #GW-123 - Gadget World  
**From:** orders@jumia.com  
**Features:**
- Green success theme
- Order summary table
- Shipping address
- Track order button
- Estimated delivery date

### Flash Sale Email
**Subject:** ⚡ Flash Sale Alert! Up to 70% OFF - Gadget World  
**From:** deals@jumia.com  
**Features:**
- Red gradient header
- Countdown timer display
- 2-column product grid
- Discount badges
- Urgency messaging

### Abandoned Cart Email
**Subject:** 🛒 You left items in your cart  
**From:** noreply@jumia.com  
**Features:**
- Orange theme
- Cart items preview (max 3)
- Total amount display
- Free shipping incentive
- "Complete Purchase" CTA

---

## 🔒 Security Features

1. **OTP Security**
   - Stored with `select: false` (never returned in queries by default)
   - 10-minute automatic expiry
   - Cleared after successful verification
   - Regenerated on each request

2. **Password Security**
   - Bcrypt hashing with salt rounds = 10
   - Minimum 6 characters requirement
   - Password confirmation required

3. **Email Validation**
   - User existence check
   - Already verified check
   - Expired OTP handling

---

## 🧪 Testing the System

### 1. Test Email Verification
```bash
# 1. Sign up a new user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "1234567890",
    "password": "password123"
  }'

# 2. Check email for OTP (or check MongoDB for verificationOTP)

# 3. Verify OTP
curl -X POST http://localhost:3000/api/email/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "otp": "123456",
    "purpose": "verification"
  }'
```

### 2. Test Password Reset
```bash
# 1. Request reset OTP
curl -X POST http://localhost:3000/api/email/send-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "purpose": "password-reset"
  }'

# 2. Verify OTP
curl -X POST http://localhost:3000/api/email/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "otp": "123456",
    "purpose": "password-reset"
  }'

# 3. Reset password
curl -X POST http://localhost:3000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "newPassword": "newpassword123"
  }'
```

---

## 📝 API Reference

### POST /api/auth/register
**Description:** Register new user and send verification OTP  
**Body:**
```json
{
  "name": "string",
  "email": "string",
  "phone": "string",
  "password": "string"
}
```
**Response:**
```json
{
  "message": "User created successfully. Please verify your email.",
  "user": {
    "id": "string",
    "name": "string",
    "email": "string",
    "role": "customer"
  },
  "requiresVerification": true
}
```

### POST /api/email/send-otp
**Description:** Generate and send OTP for verification or password reset  
**Body:**
```json
{
  "email": "string",
  "purpose": "verification" | "password-reset"
}
```
**Response:**
```json
{
  "message": "OTP sent successfully",
  "expiresIn": "10 minutes"
}
```

### POST /api/email/verify-otp
**Description:** Verify OTP code  
**Body:**
```json
{
  "email": "string",
  "otp": "string",
  "purpose": "verification" | "password-reset"
}
```
**Response:**
```json
{
  "message": "Email verified successfully",
  "verified": true
}
```

### POST /api/auth/reset-password
**Description:** Update user password (after OTP verification)  
**Body:**
```json
{
  "email": "string",
  "newPassword": "string"
}
```
**Response:**
```json
{
  "message": "Password reset successfully"
}
```

---

## 🚀 Deployment Checklist

- [ ] Add `RESEND_API_KEY` to production environment variables
- [ ] Update `NEXT_PUBLIC_APP_URL` to production domain
- [ ] Run database migration for existing users
- [ ] Verify domain for Resend (for custom from addresses)
- [ ] Test email deliverability
- [ ] Configure email rate limits if needed
- [ ] Set up email monitoring/logging
- [ ] Test full signup and reset flows on production

---

## 🎨 UI/UX Features

### Verify Email Page
- Auto-focus on first OTP input
- Auto-advance to next input when digit entered
- Backspace moves to previous input
- Paste support (automatically fills all 6 digits)
- Loading states with disabled buttons
- Error and success messages
- Resend OTP button
- "Wrong email?" link to retry signup

### Reset Password Page
- Two-step process (OTP → Password)
- Same OTP input UX as verification
- Password strength requirement (min 6 chars)
- Password confirmation
- Visual feedback at each step

---

## 🐛 Troubleshooting

### Emails not sending
1. Check `RESEND_API_KEY` is set correctly
2. Verify Resend account is active
3. Check console logs for error messages
4. Ensure "from" addresses are verified in Resend

### OTP verification fails
1. Check OTP hasn't expired (10 minutes)
2. Verify user exists in database
3. Check OTP matches (case-sensitive)
4. Ensure purpose matches (verification vs password-reset)

### User model errors
1. Run database migration script
2. Ensure MongoDB connection is active
3. Check schema matches model definition

---

## 📦 Dependencies Installed

```json
{
  "resend": "^4.x.x",
  "@react-email/render": "^1.x.x"
}
```

---

## 🔗 Useful Links

- [Resend Documentation](https://resend.com/docs)
- [React Email Documentation](https://react.email)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)

---

## ✅ What's Already Working

1. **Dynamic Product Fetching**
   - FlashSales component: `GET /api/products?featured=true&limit=6`
   - SponsoredProducts: `GET /api/products?limit=6&sort=rating`

2. **Cross-Navigation**
   - Signin ↔ Signup links already present
   - Forgot password link on signin page

3. **Authentication**
   - NextAuth.js configured
   - Credentials provider working
   - Session management active

---

## 🎯 Next Steps (Your Additions)

1. **Add Resend API Key**
   - Sign up at resend.com
   - Get API key
   - Add to `.env.local`

2. **Test Email Flow**
   - Sign up a test user
   - Check email for OTP
   - Verify email works

3. **Customize Email Templates**
   - Update branding colors if needed
   - Add your logo URLs
   - Customize email copy

4. **Complete Remaining Pages**
   - Admin panel features
   - Seller dashboard
   - Order management
   - Analytics pages

---

## 📞 Support

If you encounter issues:
1. Check this documentation
2. Review console logs
3. Verify environment variables
4. Test API endpoints with curl/Postman
5. Check MongoDB data structure

---

**Last Updated:** December 2024  
**Status:** Implementation Complete ✅  
**Next:** Add Resend API Key and Test
