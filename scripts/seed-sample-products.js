const mongoose = require('mongoose');
require('dotenv').config();

// MongoDB connection string from environment
const MONGODB_URI = process.env.MONGODB_URI;

// Sample products to seed
const sampleProducts = [
  {
    title: "Samsung Galaxy A54 5G",
    description: "128GB ROM, 8GB RAM, 6.4 inch Super AMOLED Display, 50MP Camera",
    price: 45000,
    compareAtPrice: 55000,
    category: "Electronics",
    subcategory: "Phones & Tablets",
    brand: "Samsung",
    sku: "SAM-A54-001",
    images: [
      "https://ke.jumia.is/unsafe/fit-in/500x500/filters:fill(white)/product/17/9286282/1.jpg"
    ],
    stock: 50,
    featured: true,
    active: true,
    rating: { average: 4.5, count: 128 },
    tags: ["smartphone", "samsung", "5G", "android"],
    specifications: [
      { key: "RAM", value: "8GB" },
      { key: "ROM", value: "128GB" },
      { key: "Screen", value: "6.4 inch" }
    ]
  },
  {
    title: "HP Laptop 15.6\" Intel Core i5",
    description: "Intel Core i5 11th Gen, 8GB RAM, 512GB SSD, Windows 11",
    price: 75000,
    compareAtPrice: 85000,
    category: "Electronics",
    subcategory: "Computers",
    brand: "HP",
    sku: "HP-LAP-002",
    images: [
      "https://ke.jumia.is/unsafe/fit-in/500x500/filters:fill(white)/product/45/8293672/1.jpg"
    ],
    stock: 30,
    featured: true,
    active: true,
    rating: { average: 4.3, count: 84 },
    tags: ["laptop", "hp", "intel", "windows"],
    specifications: [
      { key: "Processor", value: "Intel Core i5 11th Gen" },
      { key: "RAM", value: "8GB" },
      { key: "Storage", value: "512GB SSD" }
    ]
  },
  {
    title: "Sony PlayStation 5 Console",
    description: "Ultra HD Blu-ray Gaming Console with DualSense Controller",
    price: 85000,
    compareAtPrice: 95000,
    category: "Electronics",
    subcategory: "Gaming",
    brand: "Sony",
    sku: "SONY-PS5-003",
    images: [
      "https://ke.jumia.is/unsafe/fit-in/500x500/filters:fill(white)/product/23/5194672/1.jpg"
    ],
    stock: 15,
    featured: true,
    active: true,
    rating: { average: 4.8, count: 256 },
    tags: ["gaming", "playstation", "console", "ps5"],
    specifications: [
      { key: "Storage", value: "825GB SSD" },
      { key: "Resolution", value: "4K UHD" },
      { key: "Controller", value: "DualSense" }
    ]
  },
  {
    title: "LG 43 Inch Smart TV",
    description: "Full HD LED Smart TV with webOS, WiFi and HDMI",
    price: 38000,
    compareAtPrice: 45000,
    category: "Electronics",
    subcategory: "TVs & Audio",
    brand: "LG",
    sku: "LG-TV-004",
    images: [
      "https://ke.jumia.is/unsafe/fit-in/500x500/filters:fill(white)/product/78/4285621/1.jpg"
    ],
    stock: 25,
    featured: true,
    active: true,
    rating: { average: 4.2, count: 92 },
    tags: ["tv", "smart tv", "lg", "full hd"],
    specifications: [
      { key: "Screen Size", value: "43 inches" },
      { key: "Resolution", value: "Full HD 1920x1080" },
      { key: "Smart TV", value: "Yes (webOS)" }
    ]
  },
  {
    title: "Nike Air Max 270 Running Shoes",
    description: "Men's Running Shoes, Breathable Mesh Upper, Air Max Cushioning",
    price: 12500,
    compareAtPrice: 15000,
    category: "Fashion",
    subcategory: "Shoes",
    brand: "Nike",
    sku: "NIKE-AM270-005",
    images: [
      "https://ke.jumia.is/unsafe/fit-in/500x500/filters:fill(white)/product/62/7381942/1.jpg"
    ],
    stock: 80,
    featured: true,
    active: true,
    rating: { average: 4.6, count: 184 },
    tags: ["shoes", "nike", "running", "sports"],
    specifications: [
      { key: "Type", value: "Running Shoes" },
      { key: "Gender", value: "Men" },
      { key: "Material", value: "Mesh & Synthetic" }
    ]
  },
  {
    title: "Instant Pot Duo 7-in-1 Electric Pressure Cooker",
    description: "6 Quart Multi-Use Programmable Pressure Cooker",
    price: 18500,
    compareAtPrice: 22000,
    category: "Home & Kitchen",
    subcategory: "Kitchen Appliances",
    brand: "Instant Pot",
    sku: "INST-DUO-006",
    images: [
      "https://ke.jumia.is/unsafe/fit-in/500x500/filters:fill(white)/product/91/5824631/1.jpg"
    ],
    stock: 40,
    featured: false,
    active: true,
    rating: { average: 4.7, count: 321 },
    tags: ["kitchen", "pressure cooker", "instant pot", "appliances"],
    specifications: [
      { key: "Capacity", value: "6 Quart" },
      { key: "Functions", value: "7-in-1" },
      { key: "Power", value: "1000W" }
    ]
  },
  {
    title: "Adidas Backpack - School & Travel",
    description: "Durable Polyester Backpack with Laptop Compartment",
    price: 4500,
    compareAtPrice: 6000,
    category: "Fashion",
    subcategory: "Bags",
    brand: "Adidas",
    sku: "ADID-BAG-007",
    images: [
      "https://ke.jumia.is/unsafe/fit-in/500x500/filters:fill(white)/product/34/2917483/1.jpg"
    ],
    stock: 120,
    featured: false,
    active: true,
    rating: { average: 4.1, count: 67 },
    tags: ["backpack", "adidas", "school", "travel"],
    specifications: [
      { key: "Material", value: "Polyester" },
      { key: "Laptop Size", value: "Up to 15.6 inch" },
      { key: "Pockets", value: "Multiple compartments" }
    ]
  },
  {
    title: "iPhone 13 128GB",
    description: "Apple iPhone 13, 128GB Storage, A15 Bionic Chip, 5G",
    price: 95000,
    compareAtPrice: 110000,
    category: "Electronics",
    subcategory: "Phones & Tablets",
    brand: "Apple",
    sku: "APPL-IP13-008",
    images: [
      "https://ke.jumia.is/unsafe/fit-in/500x500/filters:fill(white)/product/89/3726482/1.jpg"
    ],
    stock: 20,
    featured: true,
    active: true,
    rating: { average: 4.9, count: 412 },
    tags: ["iphone", "apple", "smartphone", "5G"],
    specifications: [
      { key: "Storage", value: "128GB" },
      { key: "Chip", value: "A15 Bionic" },
      { key: "Camera", value: "Dual 12MP" }
    ]
  },
  {
    title: "Nivea Body Lotion 400ml",
    description: "Nourishing Body Lotion with Deep Moisture Serum",
    price: 850,
    compareAtPrice: 1200,
    category: "Health & Beauty",
    subcategory: "Skin Care",
    brand: "Nivea",
    sku: "NIVEA-LOT-009",
    images: [
      "https://ke.jumia.is/unsafe/fit-in/500x500/filters:fill(white)/product/12/8394521/1.jpg"
    ],
    stock: 200,
    featured: false,
    active: true,
    rating: { average: 4.4, count: 156 },
    tags: ["lotion", "nivea", "skincare", "moisturizer"],
    specifications: [
      { key: "Size", value: "400ml" },
      { key: "Type", value: "Body Lotion" },
      { key: "Skin Type", value: "All skin types" }
    ]
  },
  {
    title: "Ramtons 4 Gas Cooker with Oven",
    description: "4 Burner Gas Cooker with Electric Oven and Grill",
    price: 28000,
    compareAtPrice: 35000,
    category: "Home & Kitchen",
    subcategory: "Kitchen Appliances",
    brand: "Ramtons",
    sku: "RAM-COOK-010",
    images: [
      "https://ke.jumia.is/unsafe/fit-in/500x500/filters:fill(white)/product/45/9182734/1.jpg"
    ],
    stock: 18,
    featured: true,
    active: true,
    rating: { average: 4.3, count: 98 },
    tags: ["cooker", "gas cooker", "oven", "ramtons"],
    specifications: [
      { key: "Burners", value: "4 Gas Burners" },
      { key: "Oven", value: "Electric with Grill" },
      { key: "Material", value: "Stainless Steel" }
    ]
  }
];

async function seedProducts() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Define Product Schema
    const productSchema = new mongoose.Schema({
      title: String,
      description: String,
      price: Number,
      compareAtPrice: Number,
      category: String,
      subcategory: String,
      brand: String,
      sku: String,
      images: [String],
      stock: Number,
      featured: Boolean,
      active: Boolean,
      rating: {
        average: Number,
        count: Number
      },
      tags: [String],
      specifications: [{
        key: String,
        value: String
      }]
    }, { timestamps: true });

    const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

    // Don't clear existing products - just add new ones
    console.log('📦 Inserting sample products...');
    const result = await Product.insertMany(sampleProducts, { ordered: false });
    console.log(`✅ Successfully inserted ${result.length} products`);

    // Display summary
    console.log('\n📊 Product Summary:');
    console.log(`   Total Products: ${result.length}`);
    console.log(`   Featured Products: ${result.filter(p => p.featured).length}`);
    console.log(`   Categories: ${[...new Set(sampleProducts.map(p => p.category))].join(', ')}`);

    console.log('\n✅ Database seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
}

seedProducts();
