const mongoose = require('mongoose');
require('dotenv').config();

async function fixBuyback() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const db = mongoose.connection.db;
    const products = db.collection('products');
    
    // IDs for products that should have buyback ENABLED
    const enableIds = [
      '6977cf859f7b89c1d2fd3fb4', // iPhone 13
      '6977cf859f7b89c1d2fd3f98'  // Samsung Galaxy A54
    ].map(id => new mongoose.Types.ObjectId(id));
    
    // Enable buyback for iPhone 13 and Samsung Galaxy A54
    const enableResult = await products.updateMany(
      { _id: { $in: enableIds } },
      { $set: { buybackEnabled: true } }
    );
    
    console.log(`✅ Enabled buyback for ${enableResult.modifiedCount} products`);
    
    // Disable buyback for ALL other products
    const disableResult = await products.updateMany(
      { _id: { $nin: enableIds } },
      { $set: { buybackEnabled: false } }
    );
    
    console.log(`✅ Disabled buyback for ${disableResult.modifiedCount} products`);
    
    // Verify and display results
    const allProducts = await products.find({}).sort({ price: -1 }).toArray();
    
    console.log('\n📊 All Products Buyback Status:');
    console.log('━'.repeat(80));
    
    allProducts.forEach(p => {
      const status = p.buybackEnabled ? '✓ ENABLED ' : '✗ DISABLED';
      const color = p.buybackEnabled ? '\x1b[32m' : '\x1b[90m';
      const reset = '\x1b[0m';
      console.log(`${color}${status}${reset} | ${p.title.padEnd(45)} | KSh ${p.price.toLocaleString()}`);
    });
    
    const enabledCount = allProducts.filter(p => p.buybackEnabled).length;
    const disabledCount = allProducts.filter(p => !p.buybackEnabled).length;
    
    console.log('━'.repeat(80));
    console.log(`\nTotal: ${allProducts.length} products | Enabled: ${enabledCount} | Disabled: ${disabledCount}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

fixBuyback();
