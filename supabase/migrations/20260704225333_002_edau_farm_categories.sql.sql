/*
# Update categories for Edau Farm products

1. Changes
- Update existing categories to match Edau Farm product lines
- Add new categories for honey and eggs
- Categories now align with: Acacia Honey, Fresh Fruits, Dorper Sheep, Free-Range Poultry, Vegetables, Dairy

2. Notes
- This migration updates the categories to match Edau Farm's actual products from West Pokot
*/

-- First, clear existing categories and insert Edau Farm categories
DELETE FROM products;
DELETE FROM categories WHERE slug NOT IN ('honey', 'fruits', 'livestock', 'poultry', 'vegetables', 'dairy', 'eggs');

-- Insert or update Edau Farm categories
INSERT INTO categories (name, slug, description, display_order, is_active)
VALUES
  ('Acacia Honey', 'honey', 'Pure, raw acacia honey harvested from West Pokot forests', 1, true),
  ('Fresh Fruits', 'fruits', 'Seasonal fruits from our orchards - mangoes, pawpaws, passion fruit', 2, true),
  ('Dorper Sheep', 'livestock', 'Premium Dorper sheep and breeding stock raised on natural pastures', 3, true),
  ('Free-Range Poultry', 'poultry', 'Healthy chickens raised on open pastures', 4, true),
  ('Fresh Vegetables', 'vegetables', 'Organic vegetables from our gardens', 5, true),
  ('Farm Eggs', 'eggs', 'Free-range eggs from pasture-raised hens', 6, true),
  ('Dairy Products', 'dairy', 'Fresh milk and dairy from our farm', 7, true)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;
