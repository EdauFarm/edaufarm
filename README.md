# Gadget World - Full-Stack E-commerce Platform

A comprehensive e-commerce platform built with Next.js 14, MongoDB Atlas, and Shopify integration.

## Features

### 🛍️ E-commerce Functionality
- **Product Management**: Browse, search, and filter products
- **Shopping Cart**: Add/remove items, update quantities
- **Checkout System**: Complete order processing with shipping details
- **User Authentication**: Secure sign-up and sign-in with NextAuth.js
- **Order Management**: Track orders and view order history
- **Responsive Design**: Mobile-first, fully responsive UI

### 🔧 Technical Features
- **MongoDB Atlas**: Scalable cloud database with Mongoose ODM
- **Shopify Integration**: Sync products from Shopify Admin API
- **Server-Side Rendering**: Fast page loads with Next.js 14 App Router
- **Type Safety**: Full TypeScript support
- **State Management**: Zustand for cart state with persistence
- **Styling**: Tailwind CSS with custom design system

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, MongoDB, Mongoose
- **Authentication**: NextAuth.js with credentials provider
- **State Management**: Zustand with local storage persistence
- **UI Components**: Custom components with React Icons
- **HTTP Client**: Axios
- **Notifications**: React Hot Toast
- **Shopify Integration**: Shopify Admin API

## Prerequisites

- Node.js 18+ and npm/yarn
- MongoDB Atlas account
- (Optional) Shopify store with Admin API access

## Installation

### 1. Clone the repository
```bash
cd /home/mosion/Desktop/Jumia
```

### 2. Install dependencies
```bash
npm install
# or
yarn install
```

### 3. Environment Setup

Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:

```env
# MongoDB Atlas
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/gadget-world?retryWrites=true&w=majority

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here-generate-with-openssl-rand-base64-32

# Shopify (Optional)
SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
SHOPIFY_ADMIN_ACCESS_TOKEN=shpat_your_admin_access_token
SHOPIFY_API_VERSION=2024-01

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Generate NextAuth Secret
```bash
openssl rand -base64 32
```

### 5. MongoDB Atlas Setup

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Create a database user
4. Whitelist your IP address (or use 0.0.0.0/0 for development)
5. Get your connection string and update `MONGODB_URI`

### 6. Shopify Setup (Optional)

If you want to sync products from Shopify:

1. Create a Shopify store or use existing one
2. Go to Settings → Apps and sales channels → Develop apps
3. Create a new custom app
4. Configure Admin API scopes: `read_products`, `write_products`, `read_orders`, `write_orders`
5. Install the app and get your Admin API access token
6. Update `SHOPIFY_STORE_DOMAIN` and `SHOPIFY_ADMIN_ACCESS_TOKEN`

### 7. Run the development server
```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Creating Sample Products

You can create products through:

1. **API Endpoint**: POST to `/api/products`
2. **Shopify Sync**: POST to `/api/shopify/sync` (requires Shopify setup)

Example product creation:
```javascript
POST /api/products
{
  "title": "Wireless Headphones",
  "description": "High-quality wireless headphones with noise cancellation",
  "price": 99.99,
  "compareAtPrice": 149.99,
  "images": ["https://example.com/image.jpg"],
  "category": "Electronics",
  "brand": "TechBrand",
  "sku": "WH-001",
  "stock": 50,
  "featured": true
}
```

### User Flow

1. **Browse Products**: Visit `/products` to see all products
2. **Search & Filter**: Use search bar and category filters
3. **Product Details**: Click on a product to view details
4. **Add to Cart**: Add products to cart
5. **Sign Up/Sign In**: Create account or sign in
6. **Checkout**: Complete purchase with shipping details
7. **View Orders**: Check order history in dashboard

## API Routes

### Products
- `GET /api/products` - List products with pagination and filters
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `GET /api/products/categories` - Get all categories

### Cart
- `GET /api/cart` - Get user's cart
- `POST /api/cart` - Add item to cart
- `PUT /api/cart` - Update cart item quantity
- `DELETE /api/cart` - Clear cart

### Orders
- `GET /api/orders` - Get user's orders
- `GET /api/orders/:id` - Get single order
- `POST /api/orders` - Create new order

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/[...nextauth]` - Sign in/out (NextAuth)

### Shopify
- `POST /api/shopify/sync` - Sync products from Shopify

## Project Structure

```
gadget-world/
├── app/
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── cart/          # Cart management
│   │   ├── orders/        # Order management
│   │   ├── products/      # Product CRUD
│   │   └── shopify/       # Shopify integration
│   ├── auth/              # Auth pages (signin, signup)
│   ├── cart/              # Shopping cart page
│   ├── checkout/          # Checkout page
│   ├── products/          # Product listing and details
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   ├── ProductCard.tsx
│   ├── CategoryFilter.tsx
│   └── LoadingSpinner.tsx
├── lib/                   # Utility libraries
│   ├── mongodb.ts         # Database connection
│   ├── shopify.ts         # Shopify API client
│   └── utils.ts           # Helper functions
├── models/                # Mongoose models
│   ├── User.ts
│   ├── Product.ts
│   ├── Cart.ts
│   └── Order.ts
├── store/                 # State management
│   └── cartStore.ts       # Zustand cart store
├── types/                 # TypeScript types
│   ├── global.d.ts
│   └── next-auth.d.ts
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

## Features Breakdown

### Product Catalog
- Product search with text indexing
- Category and price filtering
- Sorting (price, name, date)
- Pagination
- Featured products
- Product ratings and reviews

### Shopping Cart
- Persistent cart (local storage)
- Real-time updates
- Quantity management
- Price calculations
- Free shipping threshold

### User Management
- Secure authentication
- Password hashing with bcrypt
- Session management
- User profiles
- Order history

### Order Processing
- Checkout flow
- Shipping address collection
- Multiple payment methods
- Order number generation
- Tax and shipping calculations

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Environment Variables for Production

Ensure all environment variables are set in your deployment platform:
- `MONGODB_URI`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL` (your production URL)
- `NEXT_PUBLIC_APP_URL` (your production URL)
- Shopify credentials (if using)

## Contributing

Feel free to submit issues and enhancement requests!

## License

This project is for educational purposes.

## Support

For issues and questions:
- Check the MongoDB Atlas documentation
- Review Next.js documentation
- Check Shopify API documentation

## Future Enhancements

- [ ] Payment gateway integration (Stripe, PayPal)
- [ ] Product reviews and ratings
- [ ] Wishlist functionality
- [ ] Advanced search with Elasticsearch
- [ ] Email notifications
- [ ] Admin dashboard
- [ ] Multi-language support
- [ ] Product recommendations
- [ ] Inventory management
- [ ] Order tracking with courier APIs

---

Built with ❤️ using Next.js, MongoDB, and Shopify
# jumia
# gadgetworld
# gadgetworldshop
