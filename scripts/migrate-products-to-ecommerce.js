const mongoose = require('mongoose');
require('dotenv').config();

// Source and target databases
const SOURCE_DB = 'arbitrage_bot';
const TARGET_DB = 'ecommerce';

const MONGODB_BASE_URI = process.env.MONGODB_URI.replace(/\/[^\/]+\?/, `/${SOURCE_DB}?`);
const TARGET_URI = process.env.MONGODB_URI.replace(/\/[^\/]+\?/, `/${TARGET_DB}?`);

async function migrateProducts() {
  let sourceConn, targetConn;
  
  try {
    console.log('🔌 Connecting to source database (arbitrage_bot)...');
    sourceConn = await mongoose.createConnection(MONGODB_BASE_URI).asPromise();
    console.log('✅ Connected to source database');

    console.log('🔌 Connecting to target database (ecommerce)...');
    targetConn = await mongoose.createConnection(TARGET_URI).asPromise();
    console.log('✅ Connected to target database');

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
      }],
      seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    }, { timestamps: true });

    const SourceProduct = sourceConn.model('Product', productSchema);
    const TargetProduct = targetConn.model('Product', productSchema);

    // Fetch products from source
    console.log('📦 Fetching products from arbitrage_bot...');
    const products = await SourceProduct.find({}).lean();
    console.log(`✅ Found ${products.length} products in source database`);

    if (products.length === 0) {
      console.log('⚠️  No products to migrate');
      return;
    }

    // Clear existing products in target (optional)
    console.log('🗑️  Clearing existing products in ecommerce database...');
    await TargetProduct.deleteMany({});
    console.log('✅ Cleared existing products');

    // Insert products into target
    console.log('📥 Inserting products into ecommerce database...');
    const result = await TargetProduct.insertMany(products);
    console.log(`✅ Successfully migrated ${result.length} products to ecommerce database`);

    // Display summary
    console.log('\n📊 Migration Summary:');
    console.log(`   Total Products Migrated: ${result.length}`);
    console.log(`   Featured Products: ${result.filter(p => p.featured).length}`);
    console.log(`   Active Products: ${result.filter(p => p.active).length}`);
    console.log(`   Categories: ${[...new Set(products.map(p => p.category))].join(', ')}`);

    console.log('\n✅ Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Error migrating products:', error);
    process.exit(1);
  } finally {
    if (sourceConn) await sourceConn.close();
    if (targetConn) await targetConn.close();
    console.log('👋 Disconnected from all databases');
  }
}

migrateProducts();
