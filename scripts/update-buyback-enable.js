const mongoose = require('mongoose');
require('dotenv').config();

async function updateBuyback() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const db = mongoose.connection.db;
    const products = db.collection('products');
    
    // Enable buyback for 2 random products (iPhone 13 and Samsung Galaxy A54)
    const enableIds = [
      new mongoose.Types.ObjectId('6977cf859f7b89c1d2fd3fb4'), // iPhone 13
      new mongoose.Types.ObjectId('6977cf859f7b89c1d2fd3f98')  // Samsung Galaxy A54
    ];
    
    // Update products with buyback enabled
    const enableResult = await products.updateMany(
      { _id: { $in: enableIds } },
      { $set: { buybackEnabled: true } }
    );
    
    // Update all other products with buyback disabled
    const disableResult = await products.updateMany(
      { _id: { $nin: enableIds } },
      { $set: { buybackEnabled: false } }
    );
    
    console.log('\n✅ Updated buyback settings:');
    console.log(`  - Enabled: ${enableResult.modifiedCount} products`);
    console.log(`  - Disabled: ${disableResult.modifiedCount} products`);
    
    // Verify
    const enabled = await products.find({ buybackEnabled: true }).toArray();
    const disabled = await products.find({ buybackEnabled: false }).toArray();
    
    console.log(`\n📊 Verification:`);
    console.log(`  - ${enabled.length} products with buyback enabled:`);
    enabled.forEach(p => console.log(`    ✓ ${p.title} - KSh ${p.price.toLocaleString()}`));
    console.log(`  - ${disabled.length} products with buyback disabled`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

updateBuyback();
