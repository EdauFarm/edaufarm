/*
# Agricultural Marketplace Database Schema

1. New Tables
- `categories` - Agricultural product categories (crops, livestock, tools, seeds, fertilizers, etc.)
- `products` - Farm products with agricultural-specific fields (harvest date, unit type, origin farm)
- `profiles` - User profiles extending auth.users (farmers, sellers, buyers)
- `orders` - Customer orders with delivery information
- `order_items` - Line items for each order
- `cart` - Shopping cart items
- `reviews` - Product reviews and ratings
- `market_prices` - Market price tracking for agricultural commodities

2. Security
- Enable RLS on all tables
- Owner-scoped CRUD policies for user-specific data (profiles, orders, cart, reviews)
- Public read access for products, categories, market prices (marketplace visibility)
- Only product sellers can update/delete their own products

3. Agricultural Features
- Products include: harvest_date, unit_type (kg, bunch, piece, sack), origin_farm, is_organic
- Categories: Crops, Vegetables, Fruits, Livestock, Dairy, Seeds, Fertilizers, Farm Equipment, Poultry
- Market prices for tracking commodity prices by region
*/

-- Categories table (public read, admin write)
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  image_url text,
  parent_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- User profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  phone text,
  role text NOT NULL DEFAULT 'buyer' CHECK (role IN ('buyer', 'seller', 'farmer', 'admin')),
  farm_name text,
  farm_location text,
  farm_description text,
  avatar_url text,
  is_verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Products table (seller-owned, public read)
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  price decimal(12,2) NOT NULL,
  compare_at_price decimal(12,2),
  cost_price decimal(12,2),
  quantity integer NOT NULL DEFAULT 0,
  unit_type text NOT NULL DEFAULT 'piece' CHECK (unit_type IN ('piece', 'kg', 'bunch', 'sack', 'crate', 'litre', 'dozen', 'box')),
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  seller_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  origin_farm text,
  harvest_date date,
  is_organic boolean DEFAULT false,
  is_in_stock boolean DEFAULT true,
  is_featured boolean DEFAULT false,
  is_seasonal boolean DEFAULT false,
  images text[] DEFAULT '{}',
  tags text[] DEFAULT '{}',
  rating_avg decimal(3,2) DEFAULT 0,
  rating_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Orders table (buyer-owned)
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text UNIQUE NOT NULL,
  buyer_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
  payment_status text NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  payment_method text,
  payment_reference text,
  subtotal decimal(12,2) NOT NULL,
  shipping_fee decimal(12,2) DEFAULT 0,
  tax decimal(12,2) DEFAULT 0,
  total decimal(12,2) NOT NULL,
  currency text DEFAULT 'KES',
  shipping_address jsonb,
  billing_address jsonb,
  notes text,
  delivered_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Order items
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  product_image text,
  quantity integer NOT NULL,
  unit_type text NOT NULL,
  price decimal(12,2) NOT NULL,
  subtotal decimal(12,2) NOT NULL,
  seller_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Cart items (buyer-owned)
CREATE TABLE IF NOT EXISTS cart (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity integer NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Reviews (buyer-owned, public read)
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title text,
  comment text,
  is_verified_purchase boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(product_id, user_id)
);

-- Market prices (public read, admin write)
CREATE TABLE IF NOT EXISTS market_prices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  commodity text NOT NULL,
  category text,
  region text NOT NULL,
  market_name text,
  price decimal(12,2) NOT NULL,
  unit text NOT NULL,
  currency text DEFAULT 'KES',
  price_date date NOT NULL,
  change_percent decimal(5,2),
  source text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_prices ENABLE ROW LEVEL SECURITY;

-- Categories policies (public read)
DROP POLICY IF EXISTS "anon_read_categories" ON categories;
CREATE POLICY "anon_read_categories" ON categories FOR SELECT
  TO anon, authenticated USING (is_active = true);

DROP POLICY IF EXISTS "authenticated_write_categories" ON categories;
CREATE POLICY "authenticated_write_categories" ON categories FOR ALL
  TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Profiles policies
DROP POLICY IF EXISTS "read_own_profile" ON profiles;
CREATE POLICY "read_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Products policies (public read, seller write)
DROP POLICY IF EXISTS "anon_read_products" ON products;
CREATE POLICY "anon_read_products" ON products FOR SELECT
  TO anon, authenticated USING (is_in_stock = true);

DROP POLICY IF EXISTS "insert_own_products" ON products;
CREATE POLICY "insert_own_products" ON products FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = seller_id);

DROP POLICY IF EXISTS "update_own_products" ON products;
CREATE POLICY "update_own_products" ON products FOR UPDATE
  TO authenticated USING (auth.uid() = seller_id) WITH CHECK (auth.uid() = seller_id);

DROP POLICY IF EXISTS "delete_own_products" ON products;
CREATE POLICY "delete_own_products" ON products FOR DELETE
  TO authenticated USING (auth.uid() = seller_id);

-- Orders policies (owner-only)
DROP POLICY IF EXISTS "read_own_orders" ON orders;
CREATE POLICY "read_own_orders" ON orders FOR SELECT
  TO authenticated USING (auth.uid() = buyer_id);

DROP POLICY IF EXISTS "insert_own_orders" ON orders;
CREATE POLICY "insert_own_orders" ON orders FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = buyer_id);

DROP POLICY IF EXISTS "update_own_orders" ON orders;
CREATE POLICY "update_own_orders" ON orders FOR UPDATE
  TO authenticated USING (auth.uid() = buyer_id) WITH CHECK (auth.uid() = buyer_id);

-- Order items policies (via order ownership)
DROP POLICY IF EXISTS "read_own_order_items" ON order_items;
CREATE POLICY "read_own_order_items" ON order_items FOR SELECT
  TO authenticated USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.buyer_id = auth.uid()));

DROP POLICY IF EXISTS "insert_own_order_items" ON order_items;
CREATE POLICY "insert_own_order_items" ON order_items FOR INSERT
  TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.buyer_id = auth.uid()));

-- Cart policies (owner-only)
DROP POLICY IF EXISTS "read_own_cart" ON cart;
CREATE POLICY "read_own_cart" ON cart FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_cart" ON cart;
CREATE POLICY "insert_own_cart" ON cart FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_cart" ON cart;
CREATE POLICY "update_own_cart" ON cart FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_cart" ON cart;
CREATE POLICY "delete_own_cart" ON cart FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Reviews policies
DROP POLICY IF EXISTS "anon_read_reviews" ON reviews;
CREATE POLICY "anon_read_reviews" ON reviews FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "insert_own_reviews" ON reviews;
CREATE POLICY "insert_own_reviews" ON reviews FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_reviews" ON reviews;
CREATE POLICY "update_own_reviews" ON reviews FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_reviews" ON reviews;
CREATE POLICY "delete_own_reviews" ON reviews FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Market prices policies (public read)
DROP POLICY IF EXISTS "anon_read_market_prices" ON market_prices;
CREATE POLICY "anon_read_market_prices" ON market_prices FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_write_market_prices" ON market_prices;
CREATE POLICY "admin_write_market_prices" ON market_prices FOR ALL
  TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_seller ON products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_products_in_stock ON products(is_in_stock) WHERE is_in_stock = true;
CREATE INDEX IF NOT EXISTS idx_orders_buyer ON orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_cart_user ON cart(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_market_prices_commodity ON market_prices(commodity);
CREATE INDEX IF NOT EXISTS idx_market_prices_date ON market_prices(price_date);

-- Insert default agricultural categories
INSERT INTO categories (name, slug, description, display_order) VALUES
  ('Vegetables', 'vegetables', 'Fresh vegetables from local farms', 1),
  ('Fruits', 'fruits', 'Fresh fruits and berries', 2),
  ('Crops & Grains', 'crops-grains', 'Grains, cereals, and field crops', 3),
  ('Livestock', 'livestock', 'Cattle, goats, sheep, and other livestock', 4),
  ('Poultry', 'poultry', 'Chickens, ducks, and poultry products', 5),
  ('Dairy Products', 'dairy', 'Fresh milk, cheese, and dairy products', 6),
  ('Seeds & Seedlings', 'seeds-seedlings', 'Seeds and young plants for farming', 7),
  ('Fertilizers', 'fertilizers', 'Organic and chemical fertilizers', 8),
  ('Farm Equipment', 'farm-equipment', 'Tools and machinery for farming', 9),
  ('Animal Feed', 'animal-feed', 'Feed for livestock and poultry', 10)
ON CONFLICT (slug) DO NOTHING;
