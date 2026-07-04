const mongoose = require('mongoose');
require('dotenv').config();

async function updateBuyback() {
  let connection;
  try {
    connection = await mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 1,
      serverSelectionTimeoutMS: 5000
    });
    console.log('✅ Connected to MongoDB');
    
    const db = mongoose.connection.db;
    const products = db.collection('products');
    
    // First, check current state
    const before = await products.countDocuments({ buybackEnabled: true });
    console.log(`\n📊 Before: ${before} products with buybackEnabled=true\n`);
    
    // IDs for products that should have buyback ENABLED
    const enableIds = [
      new mongoose.Types.ObjectId('6977cf859f7b89c1d2fd3fb4'), // iPhone 13
      new mongoose.Types.ObjectId('6977cf859f7b89c1d2fd3f98')  // Samsung Galaxy A54
    ];
    
    // Enable buyback for iPhone 13 and Samsung Galaxy A54
    const enableResult = await products.updateMany(
      { _id: { $in: enableIds } },
      { $set: { buybackEnabled: true } },
      { writeConcern: { w: 'majority' } }
    );
    
    console.log(`✅ Enabled buyback: matched=${enableResult.matchedCount}, modified=${enableResult.modifiedCount}`);
    
    // Disable buyback for ALL other products
    const disableResult = await products.updateMany(
      { _id: { $nin: enableIds } },
      { $set: { buybackEnabled: false } },
      { writeConcern: { w: 'majority' } }
    );
    
    console.log(`✅ Disabled buyback: matched=${disableResult.matchedCount}, modified=${disableResult.modifiedCount}\n`);
    
    // Verify results
    const after = await products.countDocuments({ buybackEnabled: true });
    console.log(`📊 After: ${after} products with buybackEnabled=true\n`);
    
    // Show all products with their buyback status
    const allProducts = await products.find({}, { 
      projection: { title: 1, price: 1, buybackEnabled: 1 } 
    }).sort({ price: -1 }).toArray();
    
    console.log('━'.repeat(80));
    console.log('All Products:');
    console.log('━'.repeat(80));
    allProducts.forEach(p => {
      const status = p.buybackEnabled ? '✓ ENABLED ' : '✗ DISABLED';
      console.log(`${status} | ${p.title.padEnd(45)} | KSh ${p.price.toLocaleString()}`);
    });
    console.log('━'.repeat(80));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    if (connection) {
      await mongoose.disconnect();
      console.log('\n✅ Disconnected from MongoDB');
    }
  }
}

updateBuyback().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
