/**
 * Verify product updates and ensure active field is set
 */

const mongoose = require('mongoose');
require('dotenv').config();

async function verifyProducts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const db = mongoose.connection.db;
    const productsCollection = db.collection('products');

    // Get all products
    const products = await productsCollection.find({}).toArray();
    console.log(`📦 Total products: ${products.length}\n`);

    // Show details
    for (const product of products) {
      console.log(`Product: ${product.title}`);
      console.log(`  - ID: ${product._id}`);
      console.log(`  - Seller: ${product.seller ? '✓ ' + product.seller : '✗ Missing'}`);
      console.log(`  - Buyback: ${product.buybackEnabled !== undefined ? (product.buybackEnabled ? '✓ Enabled' : '✓ Disabled') : '✗ Missing'}`);
      console.log(`  - Active: ${product.active !== undefined ? (product.active ? '✓ Yes' : '✗ No') : '⚠️  Not set (defaults to true)'}`);
      console.log('');
    }

    // Ensure all products have active field set to true if missing
    const result = await productsCollection.updateMany(
      { active: { $exists: false } },
      { $set: { active: true } }
    );

    if (result.modifiedCount > 0) {
      console.log(`✅ Set active=true for ${result.modifiedCount} products\n`);
    }

    // Show summary
    const summary = await productsCollection.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          withSeller: {
            $sum: { $cond: [{ $ifNull: ['$seller', false] }, 1, 0] }
          },
          withBuyback: {
            $sum: { $cond: [{ $ne: ['$buybackEnabled', null] }, 1, 0] }
          },
          buybackEnabled: {
            $sum: { $cond: ['$buybackEnabled', 1, 0] }
          },
          active: {
            $sum: { $cond: [{ $eq: ['$active', true] }, 1, 0] }
          }
        }
      }
    ]).toArray();

    if (summary.length > 0) {
      const stats = summary[0];
      console.log('📊 Summary:');
      console.log(`  Total products: ${stats.total}`);
      console.log(`  With seller: ${stats.withSeller}/${stats.total}`);
      console.log(`  With buyback field: ${stats.withBuyback}/${stats.total}`);
      console.log(`  Buyback enabled: ${stats.buybackEnabled}/${stats.total}`);
      console.log(`  Active products: ${stats.active}/${stats.total}`);
    }

    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

verifyProducts();
