import axios from 'axios';
import * as cheerio from 'cheerio';

interface ScrapedProduct {
  title: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  category: string;
  subcategory?: string;
  brand?: string;
  sku: string;
  stock: number;
  variants?: {
    name: string;
    options: string[];
    price?: number;
    stock?: number;
  }[];
  specifications?: {
    key: string;
    value: string;
  }[];
  rating: {
    average: number;
    count: number;
  };
  tags: string[];
  featured: boolean;
  active: boolean;
}

// Sample product data generator - realistic African market products
function generateProducts(count: number): ScrapedProduct[] {
  const products: ScrapedProduct[] = [];
  
  const categories = [
    { name: 'Electronics', subcats: ['Phones', 'TVs', 'Laptops', 'Tablets', 'Cameras', 'Audio'] },
    { name: 'Fashion', subcats: ['Men Clothing', 'Women Clothing', 'Shoes', 'Bags', 'Accessories'] },
    { name: 'Home & Living', subcats: ['Furniture', 'Kitchen', 'Bedding', 'Decor', 'Lighting'] },
    { name: 'Health & Beauty', subcats: ['Skincare', 'Makeup', 'Haircare', 'Fragrances', 'Personal Care'] },
    { name: 'Sports', subcats: ['Gym Equipment', 'Sportswear', 'Outdoor', 'Cycling', 'Team Sports'] },
    { name: 'Grocery', subcats: ['Food', 'Beverages', 'Snacks', 'Household', 'Baby Products'] },
  ];

  const brands = {
    Electronics: ['Samsung', 'Apple', 'LG', 'Sony', 'HP', 'Dell', 'Lenovo', 'Xiaomi', 'Huawei', 'Nokia'],
    Fashion: ['Nike', 'Adidas', 'Puma', 'Zara', 'H&M', 'Gucci', 'Versace', 'Polo', 'Tommy Hilfiger', 'Levi\'s'],
    'Home & Living': ['IKEA', 'Philips', 'Panasonic', 'Black+Decker', 'KitchenAid', 'Tefal'],
    'Health & Beauty': ['L\'Oreal', 'Nivea', 'Dove', 'MAC', 'Clinique', 'The Body Shop', 'Maybelline'],
    Sports: ['Nike', 'Adidas', 'Puma', 'Reebok', 'Under Armour', 'New Balance', 'Asics'],
    Grocery: ['Nestle', 'Coca-Cola', 'Unilever', 'Procter & Gamble', 'Kellogg\'s', 'Cadbury'],
  };

  const productTemplates = {
    Electronics: [
      { name: 'Smartphone', specs: ['RAM', 'Storage', 'Camera', 'Battery', 'Display'] },
      { name: 'Laptop', specs: ['Processor', 'RAM', 'Storage', 'Graphics', 'Display Size'] },
      { name: 'Smart TV', specs: ['Screen Size', 'Resolution', 'Smart Features', 'HDMI Ports', 'Refresh Rate'] },
      { name: 'Wireless Earbuds', specs: ['Battery Life', 'Bluetooth Version', 'Water Resistance', 'Noise Cancellation'] },
      { name: 'Tablet', specs: ['Screen Size', 'Storage', 'RAM', 'Camera', 'Battery'] },
      { name: 'Smartwatch', specs: ['Display', 'Battery Life', 'Water Resistance', 'Health Sensors'] },
    ],
    Fashion: [
      { name: 'Men\'s Shirt', specs: ['Size', 'Material', 'Color', 'Fit', 'Care Instructions'] },
      { name: 'Women\'s Dress', specs: ['Size', 'Material', 'Length', 'Occasion', 'Wash Instructions'] },
      { name: 'Running Shoes', specs: ['Size', 'Material', 'Sole Type', 'Weight', 'Cushioning'] },
      { name: 'Handbag', specs: ['Material', 'Dimensions', 'Compartments', 'Closure Type', 'Color'] },
      { name: 'Sunglasses', specs: ['UV Protection', 'Frame Material', 'Lens Type', 'Size', 'Gender'] },
    ],
    'Home & Living': [
      { name: 'Sofa Set', specs: ['Seating Capacity', 'Material', 'Dimensions', 'Color', 'Frame Material'] },
      { name: 'Blender', specs: ['Power', 'Capacity', 'Speed Settings', 'Material', 'Blade Type'] },
      { name: 'Bed Sheet Set', specs: ['Size', 'Thread Count', 'Material', 'Color', 'Piece Count'] },
      { name: 'LED Lamp', specs: ['Wattage', 'Color Temperature', 'Lumens', 'Base Type', 'Dimmable'] },
    ],
    'Health & Beauty': [
      { name: 'Face Cream', specs: ['Skin Type', 'Volume', 'SPF', 'Key Ingredients', 'Fragrance'] },
      { name: 'Lipstick', specs: ['Shade', 'Finish', 'Formula', 'Long-lasting', 'Hydrating'] },
      { name: 'Hair Dryer', specs: ['Power', 'Heat Settings', 'Speed Settings', 'Attachments', 'Cord Length'] },
      { name: 'Perfume', specs: ['Volume', 'Fragrance Family', 'Gender', 'Longevity', 'Notes'] },
    ],
    Sports: [
      { name: 'Dumbbell Set', specs: ['Weight Range', 'Material', 'Adjustable', 'Grip Type', 'Stand Included'] },
      { name: 'Yoga Mat', specs: ['Thickness', 'Material', 'Dimensions', 'Non-slip', 'Carrying Strap'] },
      { name: 'Football', specs: ['Size', 'Material', 'Official Size', 'Indoor/Outdoor', 'Bladder Type'] },
    ],
    Grocery: [
      { name: 'Coffee', specs: ['Weight', 'Type', 'Roast Level', 'Origin', 'Expiry Date'] },
      { name: 'Cooking Oil', specs: ['Volume', 'Type', 'Origin', 'Cholesterol Free', 'Uses'] },
      { name: 'Rice', specs: ['Weight', 'Type', 'Origin', 'Grain Length', 'Cooking Time'] },
    ],
  };

  for (let i = 0; i < count; i++) {
    const categoryObj = categories[i % categories.length];
    const category = categoryObj.name;
    const subcategory = categoryObj.subcats[Math.floor(Math.random() * categoryObj.subcats.length)];
    const brandList = brands[category as keyof typeof brands] || ['Generic'];
    const brand = brandList[Math.floor(Math.random() * brandList.length)];
    
    const templates = productTemplates[category as keyof typeof productTemplates] || [{ name: 'Product', specs: ['Feature'] }];
    const template = templates[Math.floor(Math.random() * templates.length)];
    
    const basePrice = Math.floor(Math.random() * 5000) + 100;
    const discount = Math.random() > 0.5 ? Math.floor(Math.random() * 40) + 10 : 0;
    const price = basePrice - (basePrice * discount / 100);
    
    const specifications = template.specs.map(spec => ({
      key: spec,
      value: `${spec} value ${Math.floor(Math.random() * 100)}`
    }));

    products.push({
      title: `${brand} ${template.name} ${i + 1}`,
      description: `High-quality ${template.name.toLowerCase()} from ${brand}. Perfect for ${category.toLowerCase()} enthusiasts. Features premium build quality, excellent performance, and great value for money. Ideal for everyday use with outstanding durability and reliability.`,
      price: Math.round(price * 100) / 100,
      compareAtPrice: discount > 0 ? basePrice : undefined,
      images: [], // Real products should have actual image URLs
      category,
      subcategory,
      brand,
      sku: `SKU-${category.substring(0, 3).toUpperCase()}-${Date.now()}-${i}`,
      stock: Math.floor(Math.random() * 200) + 10,
      specifications,
      rating: {
        average: Math.round((Math.random() * 2 + 3) * 10) / 10, // 3.0 to 5.0
        count: Math.floor(Math.random() * 500) + 10,
      },
      tags: [category, subcategory, brand, template.name],
      featured: Math.random() > 0.8,
      active: true,
    });
  }

  return products;
}

export async function scrapeProducts(count: number = 100): Promise<ScrapedProduct[]> {
  
  // In production, this would scrape real websites
  // For now, we generate realistic sample data
  const products = generateProducts(count);
  
  return products;
}

// Sanitize products to match MongoDB schema
export function sanitizeProducts(products: ScrapedProduct[]) {
  return products.map(product => ({
    title: product.title.substring(0, 200),
    description: product.description,
    price: product.price,
    compareAtPrice: product.compareAtPrice,
    images: product.images.slice(0, 10), // Max 10 images
    category: product.category,
    subcategory: product.subcategory,
    brand: product.brand,
    sku: product.sku,
    stock: product.stock,
    variants: product.variants || [],
    specifications: product.specifications || [],
    rating: product.rating,
    tags: product.tags,
    featured: product.featured,
    active: product.active,
  }));
}
