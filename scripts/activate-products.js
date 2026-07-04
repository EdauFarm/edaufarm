// Script to activate all products in MongoDB
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in environment variables');
  process.exit(1);
}

async function activateProducts() {
  try {
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get the products collection
    const db = mongoose.connection.db;
    const productsCollection = db.collection('products');

    // Count total products
    const totalCount = await productsCollection.countDocuments({});
    console.log(`📦 Total products in database: ${totalCount}`);

    // Count inactive products
    const inactiveCount = await productsCollection.countDocuments({ 
      $or: [
        { active: { $ne: true } },
        { active: { $exists: false } }
      ]
    });
    console.log(`⚠️  Inactive or missing 'active' field: ${inactiveCount}`);

    if (inactiveCount === 0) {
      console.log('✅ All products are already active!');
    } else {
      // Update all products to be active
      const result = await productsCollection.updateMany(
        {
          $or: [
            { active: { $ne: true } },
            { active: { $exists: false } }
          ]
        },
        { $set: { active: true } }
      );

      console.log(`✅ Updated ${result.modifiedCount} products to active status`);
    }

    // Show sample of products
    console.log('\n📋 Sample products:');
    const samples = await productsCollection.find({}).limit(3).toArray();
    samples.forEach((p, i) => {
      console.log(`${i + 1}. ${p.title} - Active: ${p.active}, Price: ${p.price}`);
    });

    await mongoose.disconnect();
    console.log('\n✅ Done!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

activateProducts();
