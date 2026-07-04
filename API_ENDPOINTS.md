# API Endpoints Documentation

## Authentication & User Management

### POST `/api/auth/register`
- Register a new user account
- Body: `{ name, email, password, phone }`
- Returns: User object

### POST `/api/auth/[...nextauth]`
- NextAuth.js authentication endpoint
- Handles sign-in, sign-out, callbacks
- Supports credentials provider

### POST `/api/auth/reset-password`
- Reset user password
- Body: `{ email, token, newPassword }`
- Returns: Success message

## Products

### GET `/api/products`
- Fetch products with filters and pagination
- Query params:
  - `page` (default: 1)
  - `limit` (default: 12)
  - `category` - Filter by category
  - `search` - Search products by title/description/tags
  - `sortBy` - Sort field (default: createdAt)
  - `order` - Sort order (asc/desc)
  - `minPrice` - Minimum price filter
  - `maxPrice` - Maximum price filter
  - `featured` - Filter featured products (true/false)
  - `sellerId` - Filter by seller ID
  - `sort` - Predefined sorts (rating, price-low, price-high, newest)
- Returns: `{ success, products[], pagination: { page, limit, total, pages } }`

### GET `/api/products/[id]`
- Get single product by ID
- Returns: `{ product }`

### PUT `/api/products/[id]`
- Update product (seller only)
- Body: Product fields to update
- Returns: `{ product }`

### DELETE `/api/products/[id]`
- Delete product (seller/admin only)
- Returns: Success message

### POST `/api/products/upload`
- Create new product (seller only)
- Body: `{ title, description, price, category, images, stock, sku, ... }`
- Returns: `{ product }`

### GET `/api/products/categories`
- Get all unique product categories
- Returns: `{ categories: string[] }`

## Cart

### GET `/api/cart`
- Get user's cart (authenticated)
- Returns: `{ cart }`

### POST `/api/cart`
- Add item to cart
- Body: `{ productId, quantity }`
- Returns: `{ cart }`

### PUT `/api/cart`
- Update cart item quantity
- Body: `{ productId, quantity }`
- Returns: `{ cart }`

### DELETE `/api/cart`
- Remove item from cart
- Body: `{ productId }`
- Returns: `{ cart }`

## Orders

### GET `/api/orders`
- Get user's orders (authenticated)
- Query params: `status` - Filter by order status
- Returns: `{ orders[] }`

### POST `/api/orders`
- Create new order
- Body: `{ items, shippingAddress, paymentMethod }`
- Returns: `{ order }`

### GET `/api/orders/[id]`
- Get order details by ID
- Returns: `{ order }`

### PUT `/api/orders/[id]`
- Update order status (admin only)
- Body: `{ status, trackingNumber }`
- Returns: `{ order }`

## Email

### POST `/api/email/send-otp`
- Send OTP for email verification
- Body: `{ email }`
- Returns: Success message

### POST `/api/email/verify-otp`
- Verify OTP code
- Body: `{ email, otp }`
- Returns: `{ verified: boolean }`

## Admin

### GET `/api/admin/stats`
- Get admin dashboard statistics
- Returns: `{ totalUsers, totalProducts, totalOrders, revenue, ... }`

### GET `/api/admin/users`
- Get all users with filters
- Query params: `search`, `role`, `verified`, `page`, `limit`
- Returns: `{ users[], pagination }`

### PUT `/api/admin/users`
- Update user (role, verification, etc.)
- Body: `{ userId, updates }`
- Returns: `{ user }`

### DELETE `/api/admin/users`
- Delete user account
- Body: `{ userId }`
- Returns: Success message

### POST `/api/admin/products/approve`
- Approve or reject seller product
- Body: `{ productId, action: 'approve' | 'reject' }`
- Returns: `{ product }`

### POST `/api/admin/migrate-products`
- Migrate/import products (bulk operations)
- Body: Product array
- Returns: Success message

## Seller

### GET `/api/seller/stats`
- Get seller dashboard statistics
- Returns: `{ totalProducts, activeProducts, totalSales, revenue, ... }`

---

## Response Formats

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "message": "Detailed error description"
}
```

### Pagination Format
```json
{
  "page": 1,
  "limit": 12,
  "total": 100,
  "pages": 9
}
```
